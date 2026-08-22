"use client";

import { useSyncExternalStore } from "react";
import {
  getThemeConfig,
  setThemeConfig,
  subscribeThemeConfig,
  type ThemeConfig,
} from "@/lib/themeStore";

export function useThemeConfig(): ThemeConfig & {
  setTheme: (next: Partial<ThemeConfig>) => void;
} {
  const config = useSyncExternalStore(
    subscribeThemeConfig,
    getThemeConfig,
    getThemeConfig
  );

  return {
    ...config,
    setTheme: setThemeConfig,
  };
}
