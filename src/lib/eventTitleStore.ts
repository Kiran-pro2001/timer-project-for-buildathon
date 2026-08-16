import { BRANDING } from "./config";

/**
 * Runtime-editable event title.
 * Defaults to BRANDING.title; admin can rename it for any event.
 * Persisted to localStorage so a refresh keeps the same name.
 */
const KEY = "lh:event-title";
let current: string = BRANDING.title;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (typeof raw === "string" && raw.trim()) {
      current = raw.trim();
    }
  } catch {
    /* ignore malformed storage */
  }
}

export function getEventTitle(): string {
  hydrate();
  return current;
}

export function setEventTitle(title: string) {
  const next = title.trim() || BRANDING.title;
  current = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, current);
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((l) => l());
}

export function subscribeEventTitle(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
