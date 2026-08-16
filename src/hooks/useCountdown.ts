"use client";

import { useEffect, useState } from "react";
import { THRESHOLDS } from "@/lib/config";
import { endTimeToDate } from "@/lib/launchEndStore";
import { useLaunchEnd } from "./useLaunchEnd";

export type CountdownPhase = "normal" | "warning" | "critical" | "closed";

export interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  phase: CountdownPhase;
  /** True only during the render immediately after hitting zero. */
  justClosed: boolean;
}

function compute(endTime: number): Omit<CountdownState, "justClosed"> {
  const diffMs = endTime - Date.now();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let phase: CountdownPhase = "normal";
  if (totalSeconds <= 0) phase = "closed";
  else if (totalSeconds <= THRESHOLDS.critical) phase = "critical";
  else if (totalSeconds <= THRESHOLDS.warning) phase = "warning";

  return { hours, minutes, seconds, totalSeconds, phase };
}

/**
 * Ticks every second toward the (live-editable) Launch End Time.
 * Recomputes immediately when the target time changes.
 */
export function useCountdown(): CountdownState & { mounted: boolean } {
  const { time } = useLaunchEnd();
  const endTime = endTimeToDate(time).getTime();

  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<CountdownState>(() => ({
    ...compute(endTime),
    justClosed: false,
  }));

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let wasOpen = compute(endTime).totalSeconds > 0;

    const tick = () => {
      const next = compute(endTime);
      const justClosed = wasOpen && next.totalSeconds <= 0;
      wasOpen = next.totalSeconds > 0;
      setState({ ...next, justClosed });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return { ...state, mounted };
}
