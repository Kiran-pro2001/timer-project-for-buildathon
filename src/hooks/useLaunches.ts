"use client";

import { useCallback, useEffect, useState } from "react";
import { launchStore } from "@/data";
import type { Launch, NewLaunch } from "@/types/launch";

/**
 * Subscribes to the launch store. Works identically whether the store is
 * local state or Supabase Realtime — this hook never changes.
 */
export function useLaunches() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = launchStore.subscribeToLaunches((next) => {
      setLaunches(next);
      setReady(true);
    });
    return unsubscribe;
  }, []);

  const addLaunch = useCallback((launch: NewLaunch) => {
    return launchStore.addLaunch(launch);
  }, []);

  return { launches, addLaunch, ready };
}
