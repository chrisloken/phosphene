import "./style.css";
import { createAudio } from "./audio";
import { createCamera } from "./camera";
import { createMirror } from "./mirror";
import { createMotion } from "./motion";
import { PROGRAMS } from "./programs";
import { Renderer } from "./renderer";
import { playHref, readRoom, readView, watchHref } from "./view";

const stage = document.querySelector<HTMLCanvasElement>("#stage");
const mast = document.querySelector<HTMLElement>("#mast");
const mastWatch = document.querySelector<HTMLElement>("#mast-watch");
const hud = document.querySelector<HTMLElement>("#hud");
const fatal = document.querySelector<HTMLElement>("#fatal");
const banner = document.querySelector<HTMLElement>("#banner");
const openEye = document.querySelector<HTMLButtonElement>("#open-eye");
const enter = document.querySelector<HTMLButtonElement>("#enter");
const holdWatch = document.querySelector<HTMLButtonElement>("#hold-watch");
const watchLink = document.querySelector<HTMLAnchorElement>("#watch-link");
const playLink = document.querySelector<HTMLAnchorElement>("#play-link");
const modeIndex = document.querySelector<HTMLElement>("#mode-index");
const modeName = document.querySelector<HTMLElement>("#mode-name");
const modeNote = document.querySelector<HTMLElement>("#mode-note");
const camStatus = document.querySelector<HTMLElement>("#cam-status");
const linkNote = document.querySelector<HTMLElement>("#link-note");
const remoteEye = document.querySelector<HTMLVideoElement>("#remote-eye");

if (!stage || !mast || !hud || !fatal || !banner || !openEye || !enter || !mastWatch || !holdWatch || !remoteEye) {
  throw new Error("Phosphene markup is missing.");
}

const isWatch = readView() === "watch";
const roomName = readRoom();
document.body.classList.toggle("is-watch", isWatch);
mast.hidden = isWatch;
mastWatch.hidden = !isWatch;
if (watchLink) {
  watchLink.href = watchHref();
}
if (playLink) {
  playLink.href = playHref();
}

let renderer: Renderer;
try {
  renderer = new Renderer(stage);
} catch (err) {
  fatal.hidden = false;
  mast.hidden = true;
  mastWatch.hidden = true;
  stage.style.display = "none";
  const detail = fatal.querySelector("p:last-of-type");
  if (detail && err instanceof Error) {
    detail.textContent = err.message;
  }
  throw err;
}

const camera = createCamera();
const motion = createMotion();
const sound = createAudio();
const armature = document.querySelector<HTMLElement>("#armature");
let programIndex = 0;
let hold = 0;
let holdTarget = 0;
let entered = false;
let hudVisible = true;
let start: number | null = null;
let outbound: MediaStream | null = null;
let didPublish = false;
let watchHeld = false;
let lastFrameSend = 0;
let announcedRemote = false;

function showBanner(message: string): void {
  banner.hidden = false;
  banner.textContent = message;
  window.setTimeout(() => {
    if (banner.textContent === message) {
      banner.hidden = true;
    }
  }, 4200);
}

function syncHud(): void {
  const program = PROGRAMS[programIndex];
  if (!program || !modeIndex || !modeName || !modeNote) {
    return;
  }
  modeIndex.textContent = program.index;
  modeName.textContent = program.name;
  modeNote.textContent = program.note;
}

function syncLinkNote(): void {
  if (!linkNote) {
    return;
  }
  if (!isWatch) {
    linkNote.textContent = mirror.status === "live" ? "remote view live" : "remote view waiting";
    return;
  }
  if (mirror.status === "live") {
    linkNote.textContent = "mirroring a live session";
  } else if (mirror.status === "error") {
    linkNote.textContent = "remote link failed";
  } else {
    linkNote.textContent = "waiting for a session";
  }
}

function attachRemoteMedia(stream: MediaStream | null): void {
  if (remoteEye.srcObject === stream) {
    return;
  }
  remoteEye.srcObject = stream;
  if (stream) {
    void remoteEye.play().catch(() => {
      showBanner("Tap to hear the mirrored session.");
    });
  }
}

const mirror = createMirror(isWatch ? "watch" : "session", roomName, () => {
  syncLinkNote();
  attachRemoteMedia(mirror.remoteStream);
  if (isWatch && mirror.status === "live") {
    holdWatchScreen();
    if (mirror.remoteFrame) {
      programIndex = ((mirror.remoteFrame.mode % PROGRAMS.length) + PROGRAMS.length) % PROGRAMS.length;
      syncHud();
    }
  }
  if (!isWatch && mirror.status === "live" && entered && !announcedRemote) {
    announcedRemote = true;
    showBanner("A remote view is mirroring this session.");
  }
});

function holdWatchScreen(): void {
  if (!isWatch || watchHeld) {
    return;
  }
  watchHeld = true;
  mastWatch.classList.add("is-gone");
  hud.hidden = false;
  hud.classList.toggle("is-dim", !hudVisible);
  void remoteEye.play().catch(() => undefined);
}

function publishOutbound(): void {
  if (isWatch || !entered) {
    return;
  }
  if (!outbound) {
    outbound = new MediaStream();
  }
  const added: MediaStreamTrack[] = [];
  const audio = sound.captureStream();
  audio?.getAudioTracks().forEach((track) => {
    if (!outbound?.getTracks().some((existing) => existing.id === track.id)) {
      outbound?.addTrack(track);
      added.push(track);
    }
  });
  camera.stream?.getVideoTracks().forEach((track) => {
    if (!outbound?.getTracks().some((existing) => existing.id === track.id)) {
      outbound?.addTrack(track);
      added.push(track);
    }
  });
  if (!didPublish && outbound.getTracks().length > 0) {
    mirror.publish(outbound);
    didPublish = true;
    return;
  }
  if (didPublish) {
    added.forEach((track) => mirror.addTrack(track, outbound as MediaStream));
  }
}

async function beginSession(): Promise<void> {
  await mirror.start();
  await sound.start();
  publishOutbound();
  const mic = await sound.startMic();
  publishOutbound();
  if (mic === "live") {
    showBanner("Pad open. Microphone is live in the delay mix.");
  } else if (mic === "denied") {
    showBanner("Microphone blocked — pad still runs.");
  }
}

function enterField(): void {
  if (isWatch || entered) {
    return;
  }
  entered = true;
  mast.classList.add("is-gone");
  hud.hidden = false;
  hud.classList.toggle("is-dim", !hudVisible);
  void motion.requestAccess();
  void beginSession();
}

function setProgram(next: number): void {
  if (isWatch) {
    return;
  }
  programIndex = (next + PROGRAMS.length) % PROGRAMS.length;
  syncHud();
}

function onPointerDown(): void {
  if (isWatch) {
    return;
  }
  holdTarget = 1;
}

function onPointerUp(): void {
  holdTarget = 0;
}

openEye.addEventListener("click", async () => {
  enterField();
  if (camStatus) {
    camStatus.textContent = "Asking for the camera…";
  }
  const status = await camera.start();
  publishOutbound();
  if (status === "live") {
    if (camStatus) {
      camStatus.textContent = "Camera open. Nothing is recorded.";
    }
    showBanner("Channel open. The world shears into the frame.");
  } else {
    showBanner(camera.error ?? "Camera stayed closed.");
    if (camStatus) {
      camStatus.textContent = camera.error ?? "Camera stayed closed.";
    }
  }
});

enter.addEventListener("click", () => {
  enterField();
});

holdWatch.addEventListener("click", () => {
  holdWatchScreen();
  void remoteEye.play().catch(() => undefined);
});

stage.addEventListener("click", () => {
  if (isWatch) {
    holdWatchScreen();
    return;
  }
  if (!entered) {
    enterField();
    return;
  }
  setProgram(programIndex + 1);
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    if (isWatch) {
      holdWatchScreen();
      return;
    }
    holdTarget = 1;
    enterField();
    return;
  }
  if (event.key === "m" || event.key === "M") {
    if (isWatch) {
      remoteEye.muted = !remoteEye.muted;
      showBanner(remoteEye.muted ? "Audio muted." : "Audio on.");
      return;
    }
    const muted = sound.toggleMuted();
    showBanner(muted ? "Audio muted." : "Audio on.");
    return;
  }
  if (event.key === "h" || event.key === "H") {
    hudVisible = !hudVisible;
    hud.classList.toggle("is-dim", !hudVisible);
    return;
  }
  if (event.key === "f" || event.key === "F") {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen().catch(() => undefined);
    } else {
      void document.exitFullscreen().catch(() => undefined);
    }
    return;
  }
  if (isWatch) {
    return;
  }
  const asNum = Number(event.key);
  if (asNum >= 1 && asNum <= PROGRAMS.length) {
    enterField();
    setProgram(asNum - 1);
    return;
  }
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    enterField();
    setProgram(programIndex + 1);
  }
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    enterField();
    setProgram(programIndex - 1);
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    holdTarget = 0;
  }
});

stage.addEventListener("pointerdown", onPointerDown);
window.addEventListener("pointerup", onPointerUp);
window.addEventListener("pointercancel", onPointerUp);
window.addEventListener("blur", onPointerUp);

let touchHoldTimer = 0;
stage.addEventListener("touchstart", () => {
  if (isWatch) {
    return;
  }
  touchHoldTimer = window.setTimeout(() => {
    holdTarget = 1;
  }, 280);
}, { passive: true });
stage.addEventListener("touchend", () => {
  window.clearTimeout(touchHoldTimer);
  holdTarget = 0;
});

syncHud();
syncLinkNote();

if (isWatch) {
  void mirror.start();
}

window.addEventListener("pagehide", () => {
  mirror.leave();
});

function tick(now: number): void {
  if (start === null) {
    start = now;
  }

  if (isWatch && mirror.status === "live" && mirror.remoteFrame) {
    const frame = mirror.remoteFrame;
    programIndex = ((frame.mode % PROGRAMS.length) + PROGRAMS.length) % PROGRAMS.length;
    hold = frame.hold;
    if (armature) {
      armature.style.setProperty("--pan-x", frame.panX.toFixed(4));
      armature.style.setProperty("--pan-y", frame.panY.toFixed(4));
    }
    const remoteVideo = remoteEye.srcObject ? remoteEye : null;
    const hasVideo = Boolean(remoteVideo && remoteVideo.readyState >= 2 && remoteVideo.videoWidth > 0);
    renderer.frame({
      time: frame.time,
      mode: frame.mode,
      intensity: frame.intensity,
      hold: frame.hold,
      hasCamera: frame.hasCamera && hasVideo,
      mirror: frame.mirror,
      panX: frame.panX,
      panY: frame.panY,
      energy: frame.energy,
      video: hasVideo ? remoteVideo : null,
    });
    requestAnimationFrame(tick);
    return;
  }

  const time = (now - start) / 1000;
  hold += (holdTarget - hold) * 0.08;
  const live = !isWatch && camera.status === "live";
  const move = motion.sample(live ? camera.video : null, camera.mirror);
  const pulse = isWatch ? 0 : sound.tick();
  if (armature) {
    armature.style.setProperty("--pan-x", move.panX.toFixed(4));
    armature.style.setProperty("--pan-y", move.panY.toFixed(4));
  }
  const energy = Math.min(1, move.energy + pulse * 0.4);
  renderer.frame({
    time,
    mode: programIndex,
    intensity: 1,
    hold,
    hasCamera: live,
    mirror: camera.mirror,
    panX: move.panX,
    panY: move.panY,
    energy,
    video: live ? camera.video : null,
  });
  if (!isWatch && entered && now - lastFrameSend > 40) {
    lastFrameSend = now;
    mirror.sendFrame({
      time,
      mode: programIndex,
      intensity: 1,
      hold,
      hasCamera: live,
      mirror: camera.mirror,
      panX: move.panX,
      panY: move.panY,
      energy,
    });
  }
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
