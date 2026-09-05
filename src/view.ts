export type ViewMode = "play" | "watch";

function params(): URLSearchParams {
  return new URLSearchParams(location.search);
}

export function readView(): ViewMode {
  const q = params().get("view") ?? params().get("mode");
  if (q === "watch" || q === "remote") {
    return "watch";
  }
  if (location.hash.replace(/^#/, "") === "watch") {
    return "watch";
  }
  return "play";
}

export function readRoom(): string {
  const raw = (params().get("room") ?? "phosphene").toLowerCase();
  const clean = raw.replace(/[^a-z0-9-]/g, "").slice(0, 32);
  return clean || "phosphene";
}

export function watchHref(): string {
  const next = params();
  next.set("view", "watch");
  return `./?${next.toString()}`;
}

export function playHref(): string {
  const next = params();
  next.delete("view");
  next.delete("mode");
  const q = next.toString();
  return q ? `./?${q}` : "./";
}

export const SIGNAL_PORT = 43148;
export const APP_ID = "phosphene-chrisloken";
