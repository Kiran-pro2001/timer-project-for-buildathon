export type TimerStatus = "idle" | "running" | "paused" | "completed" | "stopped";

let currentStatus: TimerStatus = "running";
const statusListeners = new Set<(status: TimerStatus) => void>();

export function getTimerStatus(): TimerStatus {
  return currentStatus;
}

export function setTimerStatus(status: TimerStatus) {
  if (currentStatus === status) return;
  currentStatus = status;
  statusListeners.forEach((cb) => cb(currentStatus));
}

export function subscribeTimerStatus(cb: (status: TimerStatus) => void) {
  statusListeners.add(cb);
  return () => {
    statusListeners.delete(cb);
  };
}
