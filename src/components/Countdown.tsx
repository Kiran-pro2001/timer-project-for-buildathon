"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCountdown, type CountdownPhase } from "@/hooks/useCountdown";
import { useLaunchEnd } from "@/hooks/useLaunchEnd";
import { DURATION_PRESETS_HOURS } from "@/lib/config";
import { cn, pad } from "@/lib/utils";

interface Props {
  onClosed?: () => void;
}

/** A single rolling two-digit group with per-digit flip animation. */
function DigitGroup({ value, phase }: { value: number; phase: CountdownPhase }) {
  const chars = pad(value).split("");
  return (
    <span className="inline-flex">
      {chars.map((c, i) => (
        <span
          key={i}
          className="relative inline-block w-[0.62em] overflow-hidden text-center"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={c}
              initial={{ y: "-90%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "90%", opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "block",
                phase === "critical" && "animate-glow",
              )}
            >
              {c}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

function Colon() {
  return (
    <span className="mx-1 -translate-y-[0.05em] text-muted/50 sm:mx-2">:</span>
  );
}

function TimerEditor({ onDone }: { onDone: () => void }) {
  const { time, setTime } = useLaunchEnd();

  const onTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(":").map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) setTime(h, m);
  };

  const setDurationHours = (hours: number) => {
    const end = new Date(Date.now() + hours * 60 * 60 * 1000);
    setTime(end.getHours(), end.getMinutes());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="mt-6 w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 backdrop-blur-sm"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted">
          <Clock size={15} className="text-accent" />
          Set timer
        </div>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg p-1 text-muted transition-colors hover:bg-white/5 hover:text-foreground"
          aria-label="Close timer editor"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-wide text-muted">
          End time
        </span>
        <input
          type="time"
          value={`${pad(time.hour)}:${pad(time.minute)}`}
          onChange={onTimeChange}
          className="rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-1.5 text-base text-foreground outline-none focus:border-accent"
          style={{ colorScheme: "dark" }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {DURATION_PRESETS_HOURS.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => setDurationHours(h)}
            className="rounded-lg border border-[var(--border)] bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-foreground"
          >
            {h}h from now
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function Countdown({ onClosed }: Props) {
  const { hours, minutes, seconds, phase, justClosed, mounted } =
    useCountdown();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.phase = phase;
  }, [phase, mounted]);

  useEffect(() => {
    if (justClosed) onClosed?.();
  }, [justClosed, onClosed]);

  const closed = phase === "closed";

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="wait">
        {closed ? (
          <motion.div
            key="closed"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <div className="text-5xl font-bold tracking-tight text-accent sm:text-7xl lg:text-8xl">
              Time&apos;s Up
            </div>
            <div className="mt-4 text-lg text-muted sm:text-xl">
              Pencils down. Time to celebrate what shipped.
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="running"
            className={cn(
              "tnum font-mono font-bold leading-none tracking-tight",
              "text-[clamp(4rem,18vw,15rem)]",
              phase === "critical" && "animate-shake text-accent",
              phase === "warning" && "text-accent",
            )}
            style={{ color: phase === "normal" ? undefined : "var(--accent)" }}
          >
            {mounted ? (
              <>
                <DigitGroup value={hours} phase={phase} />
                <Colon />
                <DigitGroup value={minutes} phase={phase} />
                <Colon />
                <DigitGroup value={seconds} phase={phase} />
              </>
            ) : (
              <span className="opacity-40">00:00:00</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!closed && phase !== "normal" && mounted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-accent sm:text-base"
        >
          {phase === "critical"
            ? "Final minutes — ship it now"
            : "Under 30 minutes left"}
        </motion.div>
      )}

      <button
        type="button"
        onClick={() => setEditing((v) => !v)}
        className="mt-5 flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-3.5 py-1.5 text-sm font-medium text-muted backdrop-blur-sm transition-colors hover:text-foreground"
      >
        <Pencil size={14} />
        {editing ? "Hide editor" : "Edit timer"}
      </button>

      <AnimatePresence>
        {editing && <TimerEditor onDone={() => setEditing(false)} />}
      </AnimatePresence>
    </div>
  );
}
