export type CameraStatus = "idle" | "requesting" | "live" | "denied" | "missing";

export type CameraHandle = {
  video: HTMLVideoElement;
  status: CameraStatus;
  error: string | null;
  start: () => Promise<CameraStatus>;
  stop: () => void;
};

export function createCamera(): CameraHandle {
  const video = document.createElement("video");
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;

  let stream: MediaStream | null = null;
  const handle: CameraHandle = {
    video,
    status: "idle",
    error: null,
    async start() {
      if (handle.status === "live") {
        return handle.status;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        handle.status = "missing";
        handle.error = "This browser cannot open a camera.";
        return handle.status;
      }
      handle.status = "requesting";
      handle.error = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        video.srcObject = stream;
        await video.play();
        handle.status = "live";
        return handle.status;
      } catch (err) {
        const name = err instanceof DOMException ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          handle.status = "denied";
          handle.error = "Camera blocked — eyelids stay closed.";
        } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
          handle.status = "missing";
          handle.error = "No camera found. Phosphene keeps running closed-eye.";
        } else {
          handle.status = "missing";
          handle.error = "Camera could not open. Phosphene keeps running closed-eye.";
        }
        return handle.status;
      }
    },
    stop() {
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
      video.srcObject = null;
      handle.status = "idle";
    },
  };
  return handle;
}
