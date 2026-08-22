"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { THRESHOLDS } from "@/lib/config";
import { endTimeToDate } from "@/lib/launchEndStore";
import { setTimerStatus, subscribeTimerStatus, getTimerStatus, type TimerStatus } from "@/lib/timerStateStore";
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
  timerStatus: TimerStatus;
}

function computeState(totalSecs: number): Omit<CountdownState, "justClosed" | "timerStatus"> {
  const totalSeconds = Math.max(0, totalSecs);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let phase: CountdownPhase = "normal";
  if (totalSeconds <= 0) phase = "closed";
  else if (totalSeconds <= THRESHOLDS.critical) phase = "critical";
  else if (totalSeconds <= THRESHOLDS.warning) phase = "warning";

  return { hours, minutes, seconds, totalSeconds, phase };
}

const emptySubscribe = () => () => {};

/**
 * Ticks every second toward the Launch End Time.
 * Synchronized with global timerStatus.
 */
export function useCountdown(): CountdownState & { mounted: boolean } {
  const { time } = useLaunchEnd();
  const endTime = endTimeToDate(time).getTime();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [timerStatus, setTimerStatusState] = useState<TimerStatus>(() => getTimerStatus());

  // Store frozen seconds when paused or offset for resumption
  const pausedSecsRef = useRef<number | null>(null);
  const offsetMsRef = useRef<number>(0);

  const calculateRemainingSeconds = useCallback((): number => {
    const currentSt = getTimerStatus();
    if (currentSt === "paused" && pausedSecsRef.current !== null) {
      return pausedSecsRef.current;
    }
    if (currentSt === "stopped") {
      return 0;
    }
    const diffMs = endTime + offsetMsRef.current - Date.now();
    return Math.max(0, Math.floor(diffMs / 1000));
  }, [endTime]);

  const [state, setState] = useState<CountdownState>(() => {
    const remainingSecs = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    return {
      ...computeState(remainingSecs),
      justClosed: false,
      timerStatus: getTimerStatus(),
    };
  });

  // Listen to target time changes (reset offset & pause)
  useEffect(() => {
    offsetMsRef.current = 0;
    pausedSecsRef.current = null;
    if (getTimerStatus() === "stopped" || getTimerStatus() === "completed") {
      setTimerStatus("running");
    }
  }, [endTime]);

  // Subscribe to timer status changes
  useEffect(() => {
    const unsubscribe = subscribeTimerStatus((newStatus) => {
      setTimerStatusState(newStatus);
      if (newStatus === "paused") {
        pausedSecsRef.current = calculateRemainingSeconds();
      } else if (newStatus === "running" && pausedSecsRef.current !== null) {
        // Adjust offset so countdown resumes from frozen remaining seconds
        const currentDiff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        offsetMsRef.current += (pausedSecsRef.current - currentDiff) * 1000;
        pausedSecsRef.current = null;
      }
    });
    return unsubscribe;
  }, [endTime, calculateRemainingSeconds]);

  useEffect(() => {
    let wasOpen = calculateRemainingSeconds() > 0;

    const tick = () => {
      const remaining = calculateRemainingSeconds();
      const next = computeState(remaining);
      const justClosed = wasOpen && next.totalSeconds <= 0;
      wasOpen = next.totalSeconds > 0;

      if (justClosed && getTimerStatus() !== "completed") {
        setTimerStatus("completed");
      }

      setState({
        ...next,
        justClosed,
        timerStatus: getTimerStatus(),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime, timerStatus, calculateRemainingSeconds]);

  return { ...state, mounted };
}
