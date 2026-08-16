"use client";

import { motion } from "framer-motion";
import { Rocket, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import type { Launch } from "@/types/launch";
import { AnimatedCounter } from "./AnimatedCounter";

interface Props {
  launches: Launch[];
}

function useStats(launches: Launch[]) {
  return useMemo(() => {
    const hourAgo = Date.now() - 60 * 60 * 1000;
    const thisHour = launches.filter(
      (l) => +new Date(l.launchedAt) >= hourAgo,
    ).length;
    const builders = new Set(
      launches.map((l) => l.builder.trim().toLowerCase()),
    ).size;
    return {
      total: launches.length,
      thisHour,
      builders,
    };
  }, [launches]);
}

const stats = [
  { key: "total", label: "Products Launched", icon: Rocket },
  { key: "thisHour", label: "Launches This Hour", icon: TrendingUp },
  { key: "builders", label: "Builders Shipping", icon: Users },
] as const;

export function StatsBar({ launches }: Props) {
  const data = useStats(launches);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 * i, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 backdrop-blur-sm sm:p-7"
          >
            <div className="absolute -right-6 -top-6 opacity-[0.06] transition-opacity group-hover:opacity-[0.12]">
              <Icon size={110} strokeWidth={1} />
            </div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted">
              <Icon size={16} className="text-accent" />
              {s.label}
            </div>
            <AnimatedCounter
              value={data[s.key]}
              className="block text-6xl font-bold tracking-tight sm:text-7xl"
            />
          </motion.div>
        );
      })}
    </div>
  );
}
