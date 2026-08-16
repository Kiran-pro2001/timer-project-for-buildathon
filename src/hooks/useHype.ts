"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BILLBOARD_POINTS, COMBO_WINDOW_MS } from "@/lib/config";

/**
 * Lightweight gamification state.
 * - `points` accrue per billboard.
 * - `combo` grows when launches land back-to-back within COMBO_WINDOW_MS.
 * - `hype` spikes to 100 on each launch and decays over ~5s.
 */
export function useHype() {
  const [points, setPoints] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hype, setHype] = useState(0);
  const lastAt = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      setHype((h) => (h > 0 ? Math.max(0, h - 2) : 0));
    }, 100);
    return () => clearInterval(id);
  }, []);

  const register = useCallback(() => {
    const now = Date.now();
    setPoints((p) => p + BILLBOARD_POINTS);
    setCombo((c) => (now - lastAt.current <= COMBO_WINDOW_MS ? c + 1 : 1));
    lastAt.current = now;
    setHype(100);
  }, []);

  return { points, combo, hype, register };
}
