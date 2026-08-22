import type { Launch, LaunchStore, NewLaunch } from "@/types/launch";

function minutesAgo(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

// Seed data so the projected screen never looks empty at kickoff.
const seed: Launch[] = [
  {
    id: "seed-1",
    builder: "Aarav",
    product: "InboxZero AI",
    url: "https://inboxzero.example.com",
    launchedAt: minutesAgo(4),
  },
  {
    id: "seed-2",
    builder: "Meera",
    product: "SnapDeck",
    url: "https://snapdeck.example.com",
    launchedAt: minutesAgo(11),
  },
  {
    id: "seed-3",
    builder: "Kabir",
    product: "PayPing",
    url: "https://payping.example.com",
    launchedAt: minutesAgo(23),
  },
];

let launches: Launch[] = [...seed].sort(
  (a, b) => +new Date(b.launchedAt) - +new Date(a.launchedAt),
);

const subscribers = new Set<(launches: Launch[]) => void>();

function emit() {
  const snapshot = [...launches];
  subscribers.forEach((cb) => cb(snapshot));
}

function makeId() {
  return `launch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const localStore: LaunchStore = {
  async getLaunches() {
    return [...launches];
  },

  async addLaunch(input: NewLaunch) {
    const launch: Launch = {
      id: makeId(),
      builder: input.builder.trim(),
      product: input.product.trim(),
      url: input.url.trim(),
      launchedAt: new Date().toISOString(),
    };
    launches = [launch, ...launches];
    emit();
    return launch;
  },

  async deleteLaunch(id: string) {
    launches = launches.filter((l) => l.id !== id);
    emit();
  },

  async clearAllLaunches() {
    launches = [];
    emit();
  },

  subscribeToLaunches(callback) {
    subscribers.add(callback);
    callback([...launches]);
    return () => {
      subscribers.delete(callback);
    };
  },
};
