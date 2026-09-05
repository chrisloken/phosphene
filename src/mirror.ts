import type { JsonValue, Room } from "@trystero-p2p/core";
import { APP_ID, SIGNAL_PORT } from "./view";

export type MirrorRole = "session" | "watch";
export type MirrorStatus = "idle" | "waiting" | "live" | "error";

export type SessionFrame = {
  time: number;
  mode: number;
  intensity: number;
  hold: number;
  hasCamera: boolean;
  mirror: boolean;
  panX: number;
  panY: number;
  energy: number;
};

export type MirrorHandle = {
  status: MirrorStatus;
  error: string | null;
  livePeerId: string | null;
  remoteStream: MediaStream | null;
  remoteFrame: SessionFrame | null;
  start: () => Promise<void>;
  publish: (stream: MediaStream) => void;
  addTrack: (track: MediaStreamTrack, stream: MediaStream) => void;
  sendFrame: (frame: SessionFrame) => void;
  leave: () => void;
};

type Hello = { role: MirrorRole };
type FrameAction = { send: (data: SessionFrame, options?: { target?: string }) => Promise<void> };

const SESSION_META = { role: "session" } satisfies JsonValue;

function isSessionFrame(value: unknown): value is SessionFrame {
  if (!value || typeof value !== "object") {
    return false;
  }
  const f = value as SessionFrame;
  return typeof f.time === "number" && typeof f.mode === "number";
}

function isHello(value: unknown): value is Hello {
  return Boolean(
    value &&
      typeof value === "object" &&
      ((value as Hello).role === "session" || (value as Hello).role === "watch"),
  );
}

async function openRoom(roomName: string): Promise<Room> {
  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun.cloudflare.com:3478" },
    ],
  };

  if (import.meta.env.DEV) {
    const { joinRoom } = await import("@trystero-p2p/ws-relay");
    const proto = location.protocol === "https:" ? "wss" : "ws";
    return joinRoom(
      {
        appId: APP_ID,
        rtcConfig,
        relayConfig: { urls: [`${proto}://${location.hostname}:${SIGNAL_PORT}`] },
      },
      roomName,
    );
  }

  const { joinRoom } = await import("@trystero-p2p/mqtt");
  return joinRoom({ appId: APP_ID, rtcConfig }, roomName);
}

export function createMirror(role: MirrorRole, roomName: string, onChange: () => void): MirrorHandle {
  let room: Room | null = null;
  let frameAction: FrameAction | null = null;
  let outbound: MediaStream | null = null;
  let started = false;
  let didPublish = false;
  const roles = new Map<string, MirrorRole>();

  const handle: MirrorHandle = {
    status: "idle",
    error: null,
    livePeerId: null,
    remoteStream: null,
    remoteFrame: null,
    async start() {
      if (started) {
        return;
      }
      started = true;
      handle.status = "waiting";
      handle.error = null;
      onChange();
      try {
        room = await openRoom(roomName);
      } catch (err) {
        handle.status = "error";
        handle.error = err instanceof Error ? err.message : "Could not open the remote room.";
        onChange();
        return;
      }

      const hello = room.makeAction<Hello>("hello");
      const frame = room.makeAction<SessionFrame>("frame");
      frameAction = frame;

      hello.send({ role }).catch(() => undefined);
      hello.onMessage = (data, { peerId }) => {
        if (!isHello(data)) {
          return;
        }
        roles.set(peerId, data.role);
        if (role === "watch" && data.role === "session") {
          handle.livePeerId = peerId;
          handle.status = "live";
          onChange();
        }
        if (role === "session" && data.role === "watch") {
          handle.status = "live";
          onChange();
        }
      };

      frame.onMessage = (data, { peerId }) => {
        if (role !== "watch" || !isSessionFrame(data)) {
          return;
        }
        const becameLive = handle.status !== "live";
        const modeChanged = handle.remoteFrame?.mode !== data.mode;
        handle.livePeerId = peerId;
        handle.remoteFrame = data;
        handle.status = "live";
        if (becameLive || modeChanged) {
          onChange();
        }
      };

      room.onPeerJoin = (peerId) => {
        hello.send({ role }, { target: peerId }).catch(() => undefined);
        if (role === "session" && outbound) {
          room?.addStream(outbound, { target: peerId, metadata: SESSION_META });
        }
        if (role === "session" && handle.remoteFrame) {
          frame.send(handle.remoteFrame, { target: peerId }).catch(() => undefined);
        }
      };

      room.onPeerLeave = (peerId) => {
        roles.delete(peerId);
        if (handle.livePeerId === peerId) {
          handle.livePeerId = null;
          handle.remoteStream = null;
          handle.remoteFrame = null;
          const next = [...roles.entries()].find(([, r]) => r === "session");
          handle.status = next ? "live" : "waiting";
          if (next) {
            handle.livePeerId = next[0];
          }
          onChange();
        }
      };

      room.onPeerStream = (stream, peerId, metadata) => {
        if (role !== "watch") {
          return;
        }
        const metaRole = metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata.role : null;
        if (metaRole && metaRole !== "session") {
          return;
        }
        handle.livePeerId = peerId;
        handle.remoteStream = stream;
        handle.status = "live";
        onChange();
      };

      room.onPeerTrack = (_track, stream, peerId) => {
        if (role !== "watch") {
          return;
        }
        handle.livePeerId = peerId;
        handle.remoteStream = stream;
        handle.status = "live";
        onChange();
      };

      onChange();
    },
    publish(stream) {
      outbound = stream;
      if (!room || role !== "session" || didPublish) {
        return;
      }
      didPublish = true;
      room.addStream(stream, { metadata: SESSION_META });
    },
    addTrack(track, stream) {
      outbound = stream;
      if (!room || role !== "session") {
        return;
      }
      room.addTrack(track, stream, { metadata: SESSION_META });
    },
    sendFrame(frame) {
      if (role !== "session" || !frameAction) {
        return;
      }
      handle.remoteFrame = frame;
      void frameAction.send(frame);
    },
    leave() {
      void room?.leave();
      room = null;
      started = false;
      handle.status = "idle";
      handle.livePeerId = null;
      handle.remoteStream = null;
      handle.remoteFrame = null;
    },
  };

  return handle;
}
