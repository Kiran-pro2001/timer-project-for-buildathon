import type { YouTubeVideo } from "@/types/audio";

export const HARKIRAT_FAVOURITES: YouTubeVideo[] = [
  {
    id: "harkirat-1",
    videoId: "84EcTxYlFfU",
    title: "Harkirat 100xDevs Focus Stream",
    url: "https://youtu.be/84EcTxYlFfU",
    category: "Harkirat's Pick",
  },
  {
    id: "harkirat-2",
    videoId: "Vm0lZAelVAk",
    title: "Harkirat Deep Coding Music",
    url: "https://youtu.be/Vm0lZAelVAk",
    category: "Harkirat's Pick",
  },
  {
    id: "harkirat-3",
    videoId: "kt2mtS7VTG4",
    title: "Harkirat Lo-Fi Build Beats",
    url: "https://youtu.be/kt2mtS7VTG4",
    category: "Harkirat's Pick",
  },
  {
    id: "harkirat-4",
    videoId: "eEobh8iCbIE",
    title: "Harkirat Chill Hackathon Ambient",
    url: "https://youtu.be/eEobh8iCbIE",
    category: "Harkirat's Pick",
  },
];

export const DEFAULT_YOUTUBE_SOUNDS: YouTubeVideo[] = [
  ...HARKIRAT_FAVOURITES,
  {
    id: "lofi-focus-stream",
    videoId: "4xDzrJKXOOY",
    title: "Lo-fi Focus Stream (Lofi Girl)",
    url: "https://www.youtube.com/watch?v=4xDzrJKXOOY",
    category: "Lo-fi",
  },
  {
    id: "deep-focus-ambient",
    videoId: "lTRiuFIWV54",
    title: "Deep Focus Ambient Beats",
    url: "https://www.youtube.com/watch?v=lTRiuFIWV54",
    category: "Ambient",
  },
];

export interface HistoryYouTubeItem extends YouTubeVideo {
  addedAt: string;
}

const RECENT_KEY = "lh:recent-yt-history";

export function getRecentYouTubeHistory(): HistoryYouTubeItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function addRecentYouTubeHistory(item: YouTubeVideo): HistoryYouTubeItem[] {
  if (typeof window === "undefined") return [];
  const current = getRecentYouTubeHistory();
  const filtered = current.filter((x) => x.videoId !== item.videoId);
  const newItem: HistoryYouTubeItem = {
    ...item,
    addedAt: new Date().toISOString(),
  };
  const updated = [newItem, ...filtered].slice(0, 8); // Keep last 8 recent custom links
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
  return updated;
}

export function clearRecentYouTubeHistory() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    /* ignore */
  }
}

export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const pattern =
    /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = trimmed.match(pattern);
  if (match && match[1]) {
    return match[1];
  }

  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      if ((pathParts[0] === "embed" || pathParts[0] === "shorts") && pathParts[1]) {
        if (/^[a-zA-Z0-9_-]{11}$/.test(pathParts[1])) {
          return pathParts[1];
        }
      }
    } else if (parsed.hostname.includes("youtu.be")) {
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      if (pathParts[0] && /^[a-zA-Z0-9_-]{11}$/.test(pathParts[0])) {
        return pathParts[0];
      }
    }
  } catch {
    /* ignore */
  }

  return null;
}
