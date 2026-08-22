"use client";

import { useSyncExternalStore } from "react";
import {
  getTimerStatus,
  setTimerStatus,
  subscribeTimerStatus,
  type TimerStatus,
} from "@/lib/timerStateStore";

export function useTimerStatus() {
  const status = useSyncExternalStore(
    subscribeTimerStatus,
    getTimerStatus,
    getTimerStatus
  );

  return {
    status,
    isRunning: status === "running",
    isPaused: status === "paused",
    isStopped: status === "stopped",
    isCompleted: status === "completed",
    setTimerStatus: (newStatus: TimerStatus) => setTimerStatus(newStatus),
    startTimer: () => setTimerStatus("running"),
    pauseTimer: () => setTimerStatus("paused"),
    resumeTimer: () => setTimerStatus("running"),
    stopTimer: () => setTimerStatus("stopped"),
    completeTimer: () => setTimerStatus("completed"),
  };
}
