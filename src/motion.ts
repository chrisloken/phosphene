export type MotionSample = {
  panX: number;
  panY: number;
  energy: number;
};

type DeviceOrientationEventWithPermission = {
  requestPermission?: () => Promise<"granted" | "denied">;
};

type DeviceMotionEventWithPermission = {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const FLOW_W = 48;
const FLOW_H = 32;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function createMotion() {
  const canvas = document.createElement("canvas");
  canvas.width = FLOW_W;
  canvas.height = FLOW_H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const previous = new Float32Array(FLOW_W * FLOW_H);
  let hasPrevious = false;

  let tiltX = 0;
  let tiltY = 0;
  let shake = 0;
  let lastOrientAt = 0;
  let restGamma: number | null = null;
  let restBeta: number | null = null;

  let pointerX = 0;
  let pointerY = 0;
  let lastPointerAt = 0;

  let panX = 0;
  let panY = 0;
  let energy = 0;

  const onOrientation = (event: DeviceOrientationEvent) => {
    if (event.gamma == null || event.beta == null) {
      return;
    }
    lastOrientAt = performance.now();
    if (restGamma == null || restBeta == null) {
      restGamma = event.gamma;
      restBeta = event.beta;
    }
    tiltX = clamp((event.gamma - restGamma) / 28, -1, 1);
    tiltY = clamp((event.beta - restBeta) / 32, -1, 1);
  };

  const onMotion = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc) {
      return;
    }
    const mag = Math.hypot(acc.x ?? 0, acc.y ?? 0, acc.z ?? 0);
    shake = clamp((mag - 9.6) / 8, 0, 1);
  };

  const onPointer = (event: PointerEvent) => {
    const w = Math.max(window.innerWidth, 1);
    const h = Math.max(window.innerHeight, 1);
    pointerX = clamp((event.clientX / w) * 2 - 1, -1, 1);
    pointerY = clamp((event.clientY / h) * 2 - 1, -1, 1);
    lastPointerAt = performance.now();
  };

  window.addEventListener("deviceorientation", onOrientation);
  window.addEventListener("devicemotion", onMotion);
  window.addEventListener("pointermove", onPointer, { passive: true });

  function flowFromVideo(video: HTMLVideoElement, mirror: boolean): { x: number; y: number; mag: number } {
    if (!ctx || video.readyState < 2) {
      return { x: 0, y: 0, mag: 0 };
    }
    ctx.drawImage(video, 0, 0, FLOW_W, FLOW_H);
    const pixels = ctx.getImageData(0, 0, FLOW_W, FLOW_H).data;
    const current = new Float32Array(FLOW_W * FLOW_H);
    for (let i = 0, p = 0; i < current.length; i++, p += 4) {
      current[i] = (pixels[p] * 0.2126 + pixels[p + 1] * 0.7152 + pixels[p + 2] * 0.0722) / 255;
    }
    if (!hasPrevious) {
      previous.set(current);
      hasPrevious = true;
      return { x: 0, y: 0, mag: 0 };
    }

    let numX = 0;
    let denX = 0;
    let numY = 0;
    let denY = 0;
    for (let y = 1; y < FLOW_H - 1; y++) {
      for (let x = 1; x < FLOW_W - 1; x++) {
        const i = y * FLOW_W + x;
        const ix = (current[i + 1] - current[i - 1]) * 0.5;
        const iy = (current[i + FLOW_W] - current[i - FLOW_W]) * 0.5;
        const it = current[i] - previous[i];
        numX += -ix * it;
        denX += ix * ix;
        numY += -iy * it;
        denY += iy * iy;
      }
    }
    previous.set(current);
    let x = numX / (denX + 1e-4);
    let y = numY / (denY + 1e-4);
    if (mirror) {
      x = -x;
    }
    x = clamp(x / 2.4, -1, 1);
    y = clamp(y / 2.4, -1, 1);
    return { x, y, mag: clamp(Math.hypot(x, y), 0, 1) };
  }

  return {
    async requestAccess(): Promise<void> {
      const orientation = DeviceOrientationEvent as unknown as DeviceOrientationEventWithPermission;
      const motion = DeviceMotionEvent as unknown as DeviceMotionEventWithPermission;
      try {
        if (typeof orientation.requestPermission === "function") {
          await orientation.requestPermission();
        }
      } catch {
        // Permission APIs can throw outside a gesture; tilt still works when the browser allows it.
      }
      try {
        if (typeof motion.requestPermission === "function") {
          await motion.requestPermission();
        }
      } catch {
        // Same as above.
      }
      restGamma = null;
      restBeta = null;
    },
    sample(video: HTMLVideoElement | null, mirror: boolean): MotionSample {
      const now = performance.now();
      const flow = video ? flowFromVideo(video, mirror) : { x: 0, y: 0, mag: 0 };
      const usingDevice = now - lastOrientAt < 900;
      const usingPointer = !usingDevice && now - lastPointerAt < 1200;
      const targetX = clamp(
        (usingDevice ? tiltX : 0) * 0.85
          + flow.x * 0.55
          + (usingPointer ? pointerX * 0.35 : 0),
        -1,
        1,
      );
      const targetY = clamp(
        (usingDevice ? tiltY : 0) * 0.85
          + flow.y * 0.55
          + (usingPointer ? pointerY * 0.35 : 0),
        -1,
        1,
      );
      panX = lerp(panX, targetX, 0.12);
      panY = lerp(panY, targetY, 0.12);
      const targetEnergy = clamp(flow.mag * 0.85 + shake * 0.7 + Math.hypot(panX, panY) * 0.2, 0, 1);
      energy = lerp(energy, targetEnergy, 0.18);
      shake *= 0.9;
      return { panX, panY, energy };
    },
  };
}
