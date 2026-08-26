"use client";

import { motion } from "framer-motion";
import { ExternalLink, Maximize2, Minimize2, Sparkles, Timer } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TIMER_APP_URL = "https://mellow-minute-timer.lovable.app/";

export function FocusTimerSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full space-y-4"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/30 shadow-md">
            <Timer size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Focus Timer
              </h2>
              <span className="flex items-center gap-1 text-[11px] font-bold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                <Sparkles size={11} /> Mellow Minute App
              </span>
            </div>
            <p className="text-xs text-muted">
              Interactive ambient focus timer for deep build sessions.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-foreground transition-all"
          >
            {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{expanded ? "Compact" : "Expand View"}</span>
          </button>

          <a
            href={TIMER_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-black hover:bg-accent/90 transition-transform active:scale-95 shadow-md"
          >
            <span>Open in New Tab</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Embedded Interactive Web App Frame */}
      <div
        className={cn(
          "relative w-full rounded-3xl border border-[var(--border)] bg-black/40 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300",
          expanded ? "h-[850px]" : "h-[620px]"
        )}
      >
        <iframe
          src={TIMER_APP_URL}
          title="Mellow Minute Focus Timer"
          className="h-full w-full border-0 rounded-3xl"
          allow="autoplay; fullscreen"
          loading="lazy"
        />
      </div>
    </motion.section>
  );
}
