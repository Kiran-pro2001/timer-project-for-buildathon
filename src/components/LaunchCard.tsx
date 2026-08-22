"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, PartyPopper, Sparkles, X } from "lucide-react";
import type { Launch } from "@/types/launch";
import { formatClock, formatRelative } from "@/hooks/useNow";

interface Props {
  launch: Launch;
  now: number;
  /** True for the freshly-added top card — triggers the highlight. */
  isNew: boolean;
  /** Promote this launch to the Billboard spotlight with fireworks. */
  onBillboard: (launch: Launch) => void;
  onDelete?: (id: string) => void;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function LaunchCard({ launch, now, isNew, onBillboard, onDelete }: Props) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, x: 80, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 backdrop-blur-sm"
    >
      {/* Fresh-launch highlight sweep */}
      {isNew && (
        <motion.div
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background:
              "linear-gradient(120deg, transparent, var(--accent-soft), transparent)",
            boxShadow: "inset 0 0 0 1px var(--accent-glow)",
          }}
        />
      )}

      {/* Delete button cross icon */}
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(launch.id)}
          title="Delete launch"
          aria-label="Delete launch"
          className="absolute top-3 right-3 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-muted opacity-80 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
        >
          <X size={13} />
        </button>
      )}

      <div className="relative flex items-start justify-between gap-3 pr-6">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
            <span>🚀</span>
            <span className="truncate">{launch.product}</span>
          </h3>
          <p className="mt-1 text-sm text-muted sm:text-base">
            by <span className="text-foreground">{launch.builder}</span>
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Live
          </span>
          <motion.button
            onClick={() => onBillboard(launch)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:border-[var(--accent)]/40 hover:text-accent"
          >
            <PartyPopper size={13} />
            Billboard
          </motion.button>
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-3">
        <a
          href={launch.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-w-0 items-center gap-1 text-sm font-medium text-accent transition-opacity hover:opacity-80"
        >
          <span className="truncate">{hostname(launch.url)}</span>
          <ArrowUpRight
            size={15}
            className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>

        <span className="flex shrink-0 items-center gap-1 text-xs text-muted">
          {isNew && <Sparkles size={13} className="text-accent" />}
          {formatRelative(launch.launchedAt, now)} · {formatClock(launch.launchedAt)}
        </span>
      </div>
    </motion.article>
  );
}
