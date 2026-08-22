"use client";

export interface DesignSense {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  fontStyle: "sans" | "mono" | "serif";
}

export interface ThemeConfig {
  mode: "default" | "custom";
  posterUrl: string | null;
  accentColor: string;
  secondaryColor: string;
  fontStyle: "sans" | "mono" | "serif";
  geminiApiKey: string;
  designSenses: DesignSense[];
  selectedSenseId: string | null;
}

const DEFAULT_THEME: ThemeConfig = {
  mode: "default",
  posterUrl: null,
  accentColor: "#FFD700",
  secondaryColor: "#1A1A24",
  fontStyle: "sans",
  geminiApiKey: "",
  designSenses: [],
  selectedSenseId: null,
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
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-soft");
    root.style.removeProperty("--accent-glow");
    return;
  }

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

/** Analyze image via Canvas pixel analysis and generate 3 distinct Design Senses */
export async function analyzePosterCanvas(imageUrl: string): Promise<DesignSense[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(fallbackSenses());
          return;
        }

        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(img, 0, 0, 64, 64);

        const imageData = ctx.getImageData(0, 0, 64, 64).data;
        const colorCounts: Map<string, { r: number; g: number; b: number; score: number }> = new Map();

        for (let i = 0; i < imageData.length; i += 16) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          const brightness = max / 255;

          if (max > 40 && min < 240) {
            const hex = rgbToHex(r, g, b);
            const score = saturation * 2 + brightness;
            colorCounts.set(hex, { r, g, b, score });
          }
        }

        const sorted = Array.from(colorCounts.values()).sort((a, b) => b.score - a.score);

        const primary1 = sorted[0] ? rgbToHex(sorted[0].r, sorted[0].g, sorted[0].b) : "#FF3B30";
        const primary2 = sorted[Math.floor(sorted.length * 0.3)]
          ? rgbToHex(
              sorted[Math.floor(sorted.length * 0.3)].r,
              sorted[Math.floor(sorted.length * 0.3)].g,
              sorted[Math.floor(sorted.length * 0.3)].b
            )
          : "#34C759";
        const primary3 = sorted[Math.floor(sorted.length * 0.6)]
          ? rgbToHex(
              sorted[Math.floor(sorted.length * 0.6)].r,
              sorted[Math.floor(sorted.length * 0.6)].g,
              sorted[Math.floor(sorted.length * 0.6)].b
            )
          : "#007AFF";

        const senses: DesignSense[] = [
          {
            id: "sense-vibrant",
            name: "Vibrant Hero Sense",
            description: "Bold primary accent color extracted from poster contrast.",
            primaryColor: primary1,
            secondaryColor: "#1C1C1E",
            fontStyle: "sans",
          },
          {
            id: "sense-[cyber]",
            name: "Cyber Neon Sense",
            description: "High contrast neon palette with technical typography.",
            primaryColor: primary2,
            secondaryColor: "#0E1117",
            fontStyle: "mono",
          },
          {
            id: "sense-ambient",
            name: "Soft Ambient Sense",
            description: "Balanced ambient palette with elegant typography.",
            primaryColor: primary3,
            secondaryColor: "#181824",
            fontStyle: "serif",
          },
        ];

        resolve(senses);
      } catch {
        resolve(fallbackSenses());
      }
    };

    img.onerror = () => resolve(fallbackSenses());
  });
}

/** Analyze poster image via Google Gemini API */
export async function analyzePosterGemini(
  imageUrl: string,
  apiKey: string
): Promise<DesignSense[]> {
  try {
    const base64Data = imageUrl.includes("base64,")
      ? imageUrl.split("base64,")[1]
      : await fetchImageAsBase64(imageUrl);

    if (!base64Data) return analyzePosterCanvas(imageUrl);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this event poster image. Suggest 3 distinct UI design senses/themes for a website matching this poster. Output ONLY a valid JSON array of 3 objects with fields: id, name, description, primaryColor (hex), secondaryColor (hex), fontStyle ("sans", "mono", or "serif"). Do not include markdown code block formatting.`,
                },
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      return analyzePosterCanvas(imageUrl);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    if (Array.isArray(parsed) && parsed.length >= 3) {
      return parsed.slice(0, 3).map((item, idx) => ({
        id: item.id || `gemini-sense-${idx}`,
        name: item.name || `AI Design Sense ${idx + 1}`,
        description: item.description || "AI-classified design vibe.",
        primaryColor: item.primaryColor || "#FFD700",
        secondaryColor: item.secondaryColor || "#1A1A24",
        fontStyle: ["sans", "mono", "serif"].includes(item.fontStyle)
          ? item.fontStyle
          : "sans",
      }));
    }

    return analyzePosterCanvas(imageUrl);
  } catch {
    return analyzePosterCanvas(imageUrl);
  }
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split("base64,")[1] || null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function fallbackSenses(): DesignSense[] {
  return [
    {
      id: "sense-1",
      name: "Vibrant Hero",
      description: "Bold gold and cyberpunk dark backdrop.",
      primaryColor: "#FFD700",
      secondaryColor: "#1A1A24",
      fontStyle: "sans",
    },
    {
      id: "sense-2",
      name: "Neon Emerald",
      description: "High-contrast emerald with dark card tint.",
      primaryColor: "#10B981",
      secondaryColor: "#064E3B",
      fontStyle: "mono",
    },
    {
      id: "sense-3",
      name: "Electric Sky",
      description: "Electric blue theme with sleek typography.",
      primaryColor: "#3B82F6",
      secondaryColor: "#1E3A8A",
      fontStyle: "sans",
    },
  ];
}
