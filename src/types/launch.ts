export interface Launch {
  id: string;
  builder: string;
  product: string;
  url: string;
  /** ISO timestamp of when the launch was submitted */
  launchedAt: string;
}

export type NewLaunch = Omit<Launch, "id" | "launchedAt">;

/** Shape every data source (local or Supabase) must implement. */
export interface LaunchStore {
  getLaunches(): Promise<Launch[]>;
  addLaunch(launch: NewLaunch): Promise<Launch>;
  /**
   * Subscribe to the full, ordered (newest-first) list of launches.
   * Fires immediately with the current list, then on every change.
   * Returns an unsubscribe function.
   */
  subscribeToLaunches(callback: (launches: Launch[]) => void): () => void;
}
