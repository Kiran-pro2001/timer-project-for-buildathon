"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flame, Zap } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

interface Props {
  points: number;
  combo: number;
  /** 0–100 */
  hype: number;
}

export function HypeBar({ points, combo, hype }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-3 backdrop-blur-sm sm:justify-between"
    >
      {/* Hype meter */}
      <div className="flex min-w-[200px] flex-1 items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
          <Zap size={15} className={hype > 60 ? "animate-pulse" : ""} />
          Hype
        </span>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--accent), #38bdf8, #ff4d5e)",
            }}
            animate={{ width: `${hype}%` }}
            transition={{ ease: "easeOut", duration: 0.2 }}
          />
        </div>
      </div>

      {/* Combo */}
      <AnimatePresence>
        {combo >= 2 && (
          <motion.div
            key={combo}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-bold text-accent"
          >
            <Flame size={15} />
            {combo}x combo
          </motion.div>
        )}
      </AnimatePresence>

      {/* Points */}
      <div className="flex items-center gap-2 text-sm">
        <span className="uppercase tracking-wider text-muted">Hype pts</span>
        <AnimatedCounter
          value={points}
          className="text-xl font-bold text-foreground"
        />
      </div>
    </motion.div>
  );
}
