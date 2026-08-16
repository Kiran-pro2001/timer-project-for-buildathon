"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, PartyPopper, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Launch } from "@/types/launch";
import { SPOTLIGHT_MS } from "@/lib/config";

interface Props {
  featured: Launch | null;
  /** Timestamp (ms) when the spotlight expires. */
  until: number;
  onClose: () => void;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function LaunchBillboard({ featured, until, onClose }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!featured) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [featured]);

  const remaining = Math.max(0, until - now);
  const fraction = Math.max(0, Math.min(1, remaining / SPOTLIGHT_MS));
  const secs = Math.ceil(remaining / 1000);
  const mm = Math.floor(secs / 60);
  const ss = secs % 60;

  return (
    <AnimatePresence mode="wait">
      {featured && (
        <motion.section
          key={featured.id}
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="relative overflow-hidden rounded-[2rem] p-[2px]"
        >
          {/* Animated glowing gradient border */}
          <motion.div
            aria-hidden
            className="absolute inset-[-40%]"
            style={{
              background:
                "conic-gradient(from 0deg, var(--accent), #38bdf8, #a78bfa, #ff4d5e, var(--accent))",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />

          <div className="relative overflow-hidden rounded-[calc(2rem-2px)] bg-[#08080b]/95 px-7 py-8 backdrop-blur-xl sm:px-12 sm:py-10">
            {/* soft accent wash */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_-10%,var(--accent-soft),transparent_70%)]" />

            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-foreground"
              aria-label="Clear billboard"
            >
              <X size={18} />
            </button>

            <div className="relative flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-4 flex items-center gap-2 rounded-full border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-bold uppercase tracking-[0.25em] text-accent"
              >
                <PartyPopper size={16} />
                Now Launching
              </motion.div>

              <motion.h2
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl"
              >
                <span className="mr-3">🚀</span>
                <span className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                  {featured.product}
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mt-3 text-xl text-muted sm:text-2xl"
              >
                by <span className="text-foreground">{featured.builder}</span>
              </motion.p>

              <motion.a
                href={featured.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.04 }}
                className="group mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-lg font-semibold text-black"
              >
                {hostname(featured.url)}
                <ArrowUpRight
                  size={20}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </motion.a>
            </div>

            {/* Spotlight countdown bar (gamified 5-min timer) */}
            <div className="relative mt-8">
              <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted">
                <span>On the billboard</span>
                <span className="tnum text-accent">
                  {mm}:{ss.toString().padStart(2, "0")} left
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  animate={{ width: `${fraction * 100}%` }}
                  transition={{ ease: "linear", duration: 0.25 }}
                />
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
