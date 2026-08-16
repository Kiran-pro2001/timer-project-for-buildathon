"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Radio } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Launch } from "@/types/launch";
import { useNow } from "@/hooks/useNow";
import { LaunchCard } from "./LaunchCard";

interface Props {
  launches: Launch[];
  ready: boolean;
  onBillboard: (launch: Launch) => void;
}

/** A tiny emoji burst when a new launch lands. */
function MiniCelebration({ trigger }: { trigger: number }) {
  const emojis = ["🚀", "🎉", "🔥", "✨", "💸"];
  return (
    <AnimatePresence>
      {trigger > 0 && (
        <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2">
          {emojis.map((e, i) => (
            <motion.span
              key={`${trigger}-${i}`}
              className="absolute text-2xl"
              initial={{ opacity: 1, y: 0, x: 0, scale: 0.6 }}
              animate={{
                opacity: 0,
                y: -70 - Math.random() * 30,
                x: (i - 2) * 34 + (Math.random() - 0.5) * 20,
                scale: 1.1,
                rotate: (Math.random() - 0.5) * 60,
              }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            >
              {e}
            </motion.span>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

export function LaunchFeed({ launches, ready, onBillboard }: Props) {
  const now = useNow(15_000);
  const [newestId, setNewestId] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);
  const prevTop = useRef<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!ready) return;
    const topId = launches[0]?.id ?? null;
    if (!initialized.current) {
      // Capture the first ready snapshot as baseline — don't celebrate seeds.
      prevTop.current = topId;
      initialized.current = true;
      return;
    }
    if (topId && topId !== prevTop.current) {
      prevTop.current = topId;
      setNewestId(topId);
      setBurst((b) => b + 1);
      const t = setTimeout(() => setNewestId(null), 3000);
      return () => clearTimeout(t);
    }
  }, [launches, ready]);

  return (
    <section className="flex h-full flex-col">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
          <Radio size={22} className="text-accent" />
          Live Launch Feed
        </h2>
        <span className="rounded-full border border-[var(--border)] px-3 py-1 text-sm text-muted">
          {launches.length} shipped
        </span>
      </div>

      <div className="relative flex-1">
        <MiniCelebration trigger={burst} />

        {ready && launches.length === 0 ? (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-[var(--border)] text-center text-muted">
            <div>
              <p className="text-lg font-medium">No launches yet.</p>
              <p className="mt-1 text-sm">
                Press{" "}
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">
                  A
                </kbd>{" "}
                to add the first one.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false} mode="popLayout">
              {launches.map((launch) => (
                <LaunchCard
                  key={launch.id}
                  launch={launch}
                  now={now}
                  isNew={launch.id === newestId}
                  onBillboard={onBillboard}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
