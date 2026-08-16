"use client";

import { useEffect, useRef } from "react";
import type { Launch } from "@/types/launch";

/**
 * Calls `onNew` whenever a brand-new launch appears at the top of the list.
 *
 * The first *ready* snapshot is captured as the baseline (so pre-existing /
 * seed launches are never celebrated). `ready` matters because the list is
 * briefly empty before the data source delivers its initial snapshot — without
 * gating on it, that first delivery would look like a fresh launch.
 */
export function useNewLaunch(
  launches: Launch[],
  ready: boolean,
  onNew: (launch: Launch) => void,
) {
  const prevTop = useRef<string | null>(null);
  const initialized = useRef(false);
  const cb = useRef(onNew);
  cb.current = onNew;

  useEffect(() => {
    if (!ready) return;
    const top = launches[0] ?? null;
    if (!initialized.current) {
      prevTop.current = top?.id ?? null;
      initialized.current = true;
      return;
    }
    if (top && top.id !== prevTop.current) {
      prevTop.current = top.id;
      cb.current(top);
    }
  }, [launches, ready]);
}
