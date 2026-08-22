"use client";

export interface ThemeConfig {
  mode: "default" | "custom";
  posterUrl: string | null;
  accentColor: string; // e.g. "#FFD700" or "#3B82F6"
  geminiApiKey: string;
}

const DEFAULT_THEME: ThemeConfig = {
  mode: "default",
  posterUrl: null,
  accentColor: "#FFD700", // Yellow gold default
  geminiApiKey: "",
};

const KEY = "lh:theme-config";
let currentConfig: ThemeConfig = { ...DEFAULT_THEME };
let hydrated = false;
const listeners = new Set<() => void>();

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  }
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function applyThemeToDOM(config: ThemeConfig) {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  if (config.mode === "default") {
    // Revert to CSS default properties
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-soft");
    root.style.removeProperty("--accent-glow");
    return;
  }

  // Custom poster theme mode
  const rgb = hexToRgb(config.accentColor) || { r: 255, g: 215, b: 0 };
  const accentHex = config.accentColor;
  const accentSoft = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
  const accentGlow = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;

  root.style.setProperty("--accent", accentHex);
  root.style.setProperty("--accent-soft", accentSoft);
  root.style.setProperty("--accent-glow", accentGlow);
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      currentConfig = { ...DEFAULT_THEME, ...parsed };
    }
  } catch {
    /* ignore */
  }
  applyThemeToDOM(currentConfig);
}

export function getThemeConfig(): ThemeConfig {
  hydrate();
  return currentConfig;
}

export function setThemeConfig(next: Partial<ThemeConfig>) {
  currentConfig = { ...currentConfig, ...next };
  applyThemeToDOM(currentConfig);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(currentConfig));
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((l) => l());
}

export function subscribeThemeConfig(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** HTML5 Canvas dominant vibrant color extractor for uploaded poster images */
export async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve("#FFD700");
          return;
        }

        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(img, 0, 0, 64, 64);

        const imageData = ctx.getImageData(0, 0, 64, 64).data;
        let maxVibrancy = -1;
        let bestRgb = { r: 255, g: 215, b: 0 };

        for (let i = 0; i < imageData.length; i += 16) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];

          // Calculate saturation & brightness
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          const brightness = max / 255;

          // We prefer vibrant, colorful, mid-to-bright accent colors
          const score = saturation * 2 + brightness;
          if (score > maxVibrancy && max > 50 && min < 230) {
            maxVibrancy = score;
            bestRgb = { r, g, b };
          }
        }

        resolve(rgbToHex(bestRgb.r, bestRgb.g, bestRgb.b));
      } catch {
        resolve("#FFD700");
      }
    };

    img.onerror = () => resolve("#FFD700");
  });
}
