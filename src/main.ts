import "./style.css";
import { createCamera } from "./camera";
import { PROGRAMS } from "./programs";
import { Renderer } from "./renderer";

const stage = document.querySelector<HTMLCanvasElement>("#stage");
const mast = document.querySelector<HTMLElement>("#mast");
const hud = document.querySelector<HTMLElement>("#hud");
const fatal = document.querySelector<HTMLElement>("#fatal");
const banner = document.querySelector<HTMLElement>("#banner");
const openEye = document.querySelector<HTMLButtonElement>("#open-eye");
const enter = document.querySelector<HTMLButtonElement>("#enter");
const modeIndex = document.querySelector<HTMLElement>("#mode-index");
const modeName = document.querySelector<HTMLElement>("#mode-name");
const modeNote = document.querySelector<HTMLElement>("#mode-note");
const camStatus = document.querySelector<HTMLElement>("#cam-status");

if (!stage || !mast || !hud || !fatal || !banner || !openEye || !enter) {
  throw new Error("Phosphene markup is missing.");
}

let renderer: Renderer;
try {
  renderer = new Renderer(stage);
} catch (err) {
  fatal.hidden = false;
  mast.hidden = true;
  stage.style.display = "none";
  const detail = fatal.querySelector("p:last-of-type");
  if (detail && err instanceof Error) {
    detail.textContent = err.message;
  }
  throw err;
}

const camera = createCamera();
let programIndex = 0;
let hold = 0;
let holdTarget = 0;
let entered = false;
let hudVisible = true;
let start: number | null = null;

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

function enterField(): void {
  if (entered) {
    return;
  }
  entered = true;
  mast.classList.add("is-gone");
  hud.hidden = false;
  hud.classList.toggle("is-dim", !hudVisible);
}

function setProgram(next: number): void {
  programIndex = (next + PROGRAMS.length) % PROGRAMS.length;
  syncHud();
}

function onPointerDown(): void {
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

stage.addEventListener("click", () => {
  if (!entered) {
    enterField();
    return;
  }
  setProgram(programIndex + 1);
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    holdTarget = 1;
    enterField();
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
  touchHoldTimer = window.setTimeout(() => {
    holdTarget = 1;
  }, 280);
}, { passive: true });
stage.addEventListener("touchend", () => {
  window.clearTimeout(touchHoldTimer);
  holdTarget = 0;
});

syncHud();

function tick(now: number): void {
  if (start === null) {
    start = now;
  }
  const time = (now - start) / 1000;
  hold += (holdTarget - hold) * 0.08;
  renderer.frame({
    time,
    mode: programIndex,
    intensity: 1,
    hold,
    hasCamera: camera.status === "live",
    video: camera.video,
  });
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
