import type { LaunchStore } from "@/types/launch";
import { localStore } from "./localStore";

/**
 * The single source of truth for the app's data layer.
 *
 * ── Swapping to Supabase Realtime ──────────────────────────────
 * 1. Create `src/data/supabaseStore.ts` implementing `LaunchStore`.
 * 2. Change the line below to `export const launchStore = supabaseStore;`
 * That's the entire migration — hooks and components don't change.
 */
export const launchStore: LaunchStore = localStore;

export const { getLaunches, addLaunch, subscribeToLaunches } = launchStore;
