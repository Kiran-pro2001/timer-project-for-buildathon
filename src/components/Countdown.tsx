"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, Minus, Pause, Pencil, Play, Plus, RotateCcw, X, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useBackgroundAudio } from "@/hooks/useBackgroundAudio";
import { useCountdown, type CountdownPhase } from "@/hooks/useCountdown";
import { useLaunchEnd } from "@/hooks/useLaunchEnd";
import { useTimerStatus } from "@/hooks/useTimerStatus";
import { HARKIRAT_FAVOURITES } from "@/lib/youtubeConfig";
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

/** Alarm-Clock style interactive timer duration editor */
function TimerEditor({ onDone }: { onDone: () => void }) {
  const { time, setTime } = useLaunchEnd();

  const [hours, setHours] = useState(3);
  const [minutes, setMinutes] = useState(28);
  const [seconds, setSeconds] = useState(0);
  const [applied, setApplied] = useState(false);

  const applyDuration = (h: number, m: number, s: number = 0) => {
    const totalMs = (h * 3600 + m * 60 + s) * 1000;
    const end = new Date(Date.now() + totalMs);
    setTime(end.getHours(), end.getMinutes());
    setApplied(true);
    setTimeout(() => setApplied(false), 1500);
  };

  const handleApply = () => {
    applyDuration(hours, minutes, seconds);
  };

  const onTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(":").map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) {
      setTime(h, m);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="mt-6 w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 backdrop-blur-md shadow-2xl"
    >
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Clock size={16} className="text-accent" />
          Alarm-Clock Timer Editor
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

      {/* Alarm Clock Spinner Controls (Hours, Minutes, Seconds) */}
      <div className="my-4 flex items-center justify-center gap-4 sm:gap-6 bg-black/30 p-4 rounded-2xl border border-[var(--border)]">
        {/* Hours Spinner */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
            Hours
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHours((h) => Math.max(0, h - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted hover:bg-white/10 hover:text-foreground"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center font-mono text-2xl font-bold text-foreground">
              {pad(hours)}
            </span>
            <button
              type="button"
              onClick={() => setHours((h) => Math.min(24, h + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted hover:bg-white/10 hover:text-foreground"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <span className="font-mono text-2xl font-bold text-muted/40 pb-1">:</span>

        {/* Minutes Spinner */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
            Minutes
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMinutes((m) => (m <= 0 ? 59 : m - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted hover:bg-white/10 hover:text-foreground"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center font-mono text-2xl font-bold text-foreground">
              {pad(minutes)}
            </span>
            <button
              type="button"
              onClick={() => setMinutes((m) => (m >= 59 ? 0 : m + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted hover:bg-white/10 hover:text-foreground"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <span className="font-mono text-2xl font-bold text-muted/40 pb-1">:</span>

        {/* Seconds Spinner */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
            Seconds
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSeconds((s) => (s <= 0 ? 59 : s - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted hover:bg-white/10 hover:text-foreground"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center font-mono text-2xl font-bold text-foreground">
              {pad(seconds)}
            </span>
            <button
              type="button"
              onClick={() => setSeconds((s) => (s >= 59 ? 0 : s + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted hover:bg-white/10 hover:text-foreground"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Preset Duration Chips */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted pr-1">Quick Presets:</span>
        <button
          type="button"
          onClick={() => {
            setHours(3);
            setMinutes(28);
            setSeconds(0);
            applyDuration(3, 28, 0);
          }}
          className="rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
        >
          3h 28m
        </button>
        <button
          type="button"
          onClick={() => {
            setHours(0);
            setMinutes(30);
            setSeconds(0);
            applyDuration(0, 30, 0);
          }}
          className="rounded-lg border border-[var(--border)] bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-foreground"
        >
          30m
        </button>
        <button
          type="button"
          onClick={() => {
            setHours(1);
            setMinutes(0);
            setSeconds(0);
            applyDuration(1, 0, 0);
          }}
          className="rounded-lg border border-[var(--border)] bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-foreground"
        >
          1h
        </button>
        <button
          type="button"
          onClick={() => {
            setHours(2);
            setMinutes(0);
            setSeconds(0);
            applyDuration(2, 0, 0);
          }}
          className="rounded-lg border border-[var(--border)] bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-foreground"
        >
          2h
        </button>
        <button
          type="button"
          onClick={() => {
            setHours(4);
            setMinutes(0);
            setSeconds(0);
            applyDuration(4, 0, 0);
          }}
          className="rounded-lg border border-[var(--border)] bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-foreground"
        >
          4h
        </button>
        <button
          type="button"
          onClick={() => {
            setHours(6);
            setMinutes(0);
            setSeconds(0);
            applyDuration(6, 0, 0);
          }}
          className="rounded-lg border border-accent/30 bg-accent/5 px-2.5 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
        >
          6h
        </button>
        <button
          type="button"
          onClick={() => {
            setHours(12);
            setMinutes(0);
            setSeconds(0);
            applyDuration(12, 0, 0);
          }}
          className="rounded-lg border border-accent/30 bg-accent/5 px-2.5 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
        >
          12h
        </button>
      </div>

      {/* Target Clock Time Picker */}
      <div className="pt-3 border-t border-[var(--border)] space-y-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-wide text-muted font-medium">
              Or End Clock Time (e.g. 5:44 PM)
            </span>
            <p className="text-[11px] text-muted/70">
              Timer counts down to this exact clock time today
            </p>
          </div>
          <input
            type="time"
            value={`${pad(time.hour)}:${pad(time.minute)}`}
            onChange={onTimeChange}
            className="rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-1.5 text-sm font-mono text-foreground outline-none focus:border-accent shrink-0"
            style={{ colorScheme: "dark" }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleApply}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-semibold text-black transition-transform active:scale-[0.98] hover:bg-accent/90"
      >
        {applied ? <Check size={16} /> : <Clock size={16} />}
        {applied ? "Applied Custom Timer!" : "Set Alarm Timer Duration"}
      </button>
    </motion.div>
  );
}

export function Countdown({ onClosed }: Props) {
  const { hours, minutes, seconds, phase, justClosed, mounted } =
    useCountdown();
  const { isRunning, isPaused, startTimer, pauseTimer, resumeTimer, stopTimer } =
    useTimerStatus();
  const { youtube, setYouTube } = useBackgroundAudio();

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.phase = phase;
  }, [phase, mounted]);

  useEffect(() => {
    if (justClosed) onClosed?.();
  }, [justClosed, onClosed]);

  const handleStartTimer = () => {
    if (!youtube) {
      setYouTube(HARKIRAT_FAVOURITES[0]);
    }
    startTimer();
  };

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

      {/* Main Timer Action Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {isRunning ? (
          <button
            type="button"
            onClick={pauseTimer}
            className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-6 py-2.5 text-sm font-bold text-amber-400 shadow-md backdrop-blur-sm transition-all hover:bg-amber-500/20 active:scale-[0.98]"
          >
            <Pause size={16} /> Pause Timer
          </button>
        ) : isPaused ? (
          <button
            type="button"
            onClick={resumeTimer}
            className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-black shadow-lg transition-all hover:bg-accent/90 active:scale-[0.98]"
          >
            <Play size={16} /> Resume Timer
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStartTimer}
            className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-black shadow-lg transition-all hover:bg-accent/90 active:scale-[0.98]"
          >
            <Play size={16} /> Start Timer
          </button>
        )}

        {(isRunning || isPaused) && (
          <button
            type="button"
            onClick={stopTimer}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-muted backdrop-blur-sm transition-colors hover:text-foreground active:scale-[0.98]"
          >
            <RotateCcw size={15} /> Reset
          </button>
        )}

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-muted backdrop-blur-sm transition-colors hover:text-foreground"
        >
          <Pencil size={14} />
          {editing ? "Hide editor" : "Edit timer"}
        </button>
      </div>

      <AnimatePresence>
        {editing && <TimerEditor onDone={() => setEditing(false)} />}
      </AnimatePresence>
    </div>
  );
}
