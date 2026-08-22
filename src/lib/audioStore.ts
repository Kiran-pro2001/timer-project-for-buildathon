import type { AudioState, YouTubeVideo } from "@/types/audio";
import { HARKIRAT_FAVOURITES } from "./youtubeConfig";

const KEY = "lh:bg-audio";

let current: AudioState = {
  source: "youtube",
  youtube: HARKIRAT_FAVOURITES[0],
  volume: 70,
};

let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && typeof p === "object") {
        current.source = "youtube";
        if (typeof p.volume === "number" && p.volume >= 0 && p.volume <= 100) {
          current.volume = p.volume;
        }
        if (p.youtube && typeof p.youtube === "object" && p.youtube.videoId) {
          current.youtube = {
            id: p.youtube.id || p.youtube.videoId,
            videoId: p.youtube.videoId,
            url: p.youtube.url || `https://www.youtube.com/watch?v=${p.youtube.videoId}`,
            title: p.youtube.title || "YouTube Audio",
            category: p.youtube.category,
          };
        }
      }
    }
  } catch {
    /* ignore malformed storage */
  }
}

function persist() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(current));
    } catch {
      /* ignore */
    }
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

export function getAudioState(): AudioState {
  hydrate();
  return current;
}

export function setYouTubeVideo(video: YouTubeVideo | null) {
  hydrate();
  current = { ...current, youtube: video };
  emit();
}

export function setVolume(volume: number) {
  hydrate();
  const clamped = Math.max(0, Math.min(100, Math.round(volume)));
  if (current.volume === clamped) return;
  current = { ...current, volume: clamped };
  emit();
}

export function subscribeAudioState(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
