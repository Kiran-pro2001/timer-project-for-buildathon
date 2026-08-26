import type { AudioState, YouTubeVideo } from "@/types/audio";
import { HARKIRAT_FAVOURITES } from "./youtubeConfig";

const KEY = "lh:bg-audio";

let current: AudioState = {
  source: "youtube",
  youtube: HARKIRAT_FAVOURITES[0],
  volume: 70,
  isPlaying: false,
};

let lastVolume = 70;
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
          if (p.volume > 0) lastVolume = p.volume;
        }
        if (typeof p.isPlaying === "boolean") {
          current.isPlaying = p.isPlaying;
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

export function setYouTubeVideo(video: YouTubeVideo | null, playImmediately: boolean = true) {
  hydrate();
  current = { ...current, youtube: video, isPlaying: playImmediately && Boolean(video) };
  emit();
}

export function setAudioPlaying(playing: boolean) {
  hydrate();
  current = { ...current, isPlaying: playing && Boolean(current.youtube) };
  emit();
}

export function setVolume(volume: number) {
  hydrate();
  const clamped = Math.max(0, Math.min(100, Math.round(volume)));
  if (clamped > 0) lastVolume = clamped;
  if (current.volume === clamped) return;
  current = { ...current, volume: clamped };
  emit();
}

export function toggleMute() {
  hydrate();
  if (current.volume > 0) {
    lastVolume = current.volume;
    setVolume(0);
  } else {
    setVolume(lastVolume > 0 ? lastVolume : 70);
  }
}

export function subscribeAudioState(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
