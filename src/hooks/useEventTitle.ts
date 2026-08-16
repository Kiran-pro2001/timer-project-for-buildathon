"use client";

import { useSyncExternalStore } from "react";
import { BRANDING } from "@/lib/config";
import {
  getEventTitle,
  setEventTitle,
  subscribeEventTitle,
} from "@/lib/eventTitleStore";

/** Live-editable event title, shared across the hero, footer, and admin panel. */
export function useEventTitle() {
  const title = useSyncExternalStore(
    subscribeEventTitle,
    getEventTitle,
    () => BRANDING.title,
  );

  return {
    title,
    setTitle: setEventTitle,
  };
}
