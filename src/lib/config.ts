/**
 * ─────────────────────────────────────────────────────────────
 *  BUILD HOUR — EVENT CONFIG
 *  Defaults for the timer and branding. End time and event title
 *  can also be changed live from the admin panel (persisted).
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Default end time, in 24h local time.
 * The countdown always counts *to* this time — it never restarts
 * from a fixed duration. Open the page at 4:23 PM with END at 18:00
 * and it shows 01:37:00. Override live from the admin panel.
 */
export const LAUNCH_END = {
  hour: 23, // 24h clock — 18 = 6:00 PM. Change these two numbers to move the timer.
  minute: 59,
} as const;

/**
 * Resolve the configured end time to a concrete Date for *today*.
 * Kept as a function so a countdown can recompute if the day rolls over.
 */
export function getLaunchEndTime(now: Date = new Date()): Date {
  const end = new Date(now);
  end.setHours(LAUNCH_END.hour, LAUNCH_END.minute, 0, 0);
  return end;
}

/** Human-readable end time, e.g. "6:00 PM". */
export function formatLaunchEndLabel(): string {
  const d = getLaunchEndTime();
  return d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Accent thresholds, in seconds remaining. */
export const THRESHOLDS = {
  warning: 30 * 60, // < 30 min → color shift
  critical: 10 * 60, // < 10 min → shake + glow
} as const;

/** Quick duration presets shown in the admin timer (hours). */
export const DURATION_PRESETS_HOURS = [1, 2, 4, 6, 8, 12] as const;

export const BRANDING = {
  title: "Build Hour",
  tagline: "Time to build. Ship something.",
} as const;

export const MOTIVATION_QUOTES = [
  "Ship > Perfect",
  "Nobody remembers drafts.",
  "The internet rewards people who publish.",
  "Launch scared.",
  "Customers decide what's good.",
  "Done is viral.",
  "Don't polish. Publish.",
  "Your first version should embarrass you.",
  "Post it before you're ready.",
] as const;

export const CHECKLIST_ITEMS = [
  "Posted on X",
  "Posted on LinkedIn",
  "Posted on Reddit",
  "Sent to 10 people",
  "Asked for feedback",
  "Shared in WhatsApp groups",
  "First customer message sent",
] as const;

/** How often the motivation quote rotates (ms). */
export const QUOTE_ROTATION_MS = 10_000;

/** How long a launch stays on the Billboard spotlight before auto-clearing. */
export const SPOTLIGHT_MS = 5 * 60 * 1000; // 5 minutes

/** Points awarded each time a launch hits the Billboard. */
export const BILLBOARD_POINTS = 100;

/** Two launches within this window keep a combo streak alive. */
export const COMBO_WINDOW_MS = 5 * 60 * 1000;
