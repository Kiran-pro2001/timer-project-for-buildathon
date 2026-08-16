"use client";

import { useSyncExternalStore } from "react";
import { LAUNCH_END } from "@/lib/config";
import {
  formatEndLabel,
  getEndTime,
  setEndTime,
  subscribeEndTime,
  type EndTime,
} from "@/lib/launchEndStore";

const serverSnapshot: EndTime = {
  hour: LAUNCH_END.hour,
  minute: LAUNCH_END.minute,
};

/** Live-editable Launch End Time, shared across the countdown and admin panel. */
export function useLaunchEnd() {
  const time = useSyncExternalStore(
    subscribeEndTime,
    getEndTime,
    () => serverSnapshot,
  );

  return {
    time,
    label: formatEndLabel(time),
    setTime: (hour: number, minute: number) => setEndTime({ hour, minute }),
  };
}
