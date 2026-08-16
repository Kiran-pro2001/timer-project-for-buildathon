import { LAUNCH_END } from "./config";

/**
 * Runtime-editable Launch End Time.
 *
 * Defaults to LAUNCH_END from config, but can be changed live from the admin
 * panel and is persisted to localStorage so a refresh keeps the same target.
 * The countdown subscribes to this, so edits update the timer instantly.
 */
export interface EndTime {
  hour: number;
  minute: number;
}

const KEY = "lh:launch-end";
let current: EndTime = { hour: LAUNCH_END.hour, minute: LAUNCH_END.minute };
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (typeof p?.hour === "number" && typeof p?.minute === "number") {
        current = { hour: p.hour, minute: p.minute };
      }
    }
  } catch {
    /* ignore malformed storage */
  }
}

export function getEndTime(): EndTime {
  hydrate();
  return current;
}

export function setEndTime(t: EndTime) {
  current = { hour: t.hour, minute: t.minute };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(current));
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((l) => l());
}

export function subscribeEndTime(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Resolve the end time to a concrete Date for today. */
export function endTimeToDate(t: EndTime, now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(t.hour, t.minute, 0, 0);
  return d;
}

/** Human label, e.g. "6:00 PM". */
export function formatEndLabel(t: EndTime): string {
  return endTimeToDate(t).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
