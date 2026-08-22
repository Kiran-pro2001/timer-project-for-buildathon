"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, Music2, Plus, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useBackgroundAudio } from "@/hooks/useBackgroundAudio";
import { useLaunchEnd } from "@/hooks/useLaunchEnd";
import { useTimerStatus } from "@/hooks/useTimerStatus";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { HARKIRAT_FAVOURITES } from "@/lib/youtubeConfig";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TimerCompletionModal({ open, onClose }: Props) {
  const { setTime } = useLaunchEnd();
  const { startTimer } = useTimerStatus();
  const { youtube, setYouTube } = useBackgroundAudio();

  // YouTube player hook reference to trigger music
  const activeVideoId = youtube?.videoId ?? HARKIRAT_FAVOURITES[0].videoId;
  const { forcePlay } = useYouTubePlayer({
    containerId: "youtube-bg-audio-container",
    videoId: activeVideoId,
    volume: 80,
    enabled: true,
    isPlaying: true,
  });

  const handleAddOvertime = (minutes: number) => {
    // 1. Set new end time
    const end = new Date(Date.now() + minutes * 60 * 1000);
    setTime(end.getHours(), end.getMinutes());

    // 2. Auto-select default Harkirat music if none selected
    if (!youtube) {
      setYouTube(HARKIRAT_FAVOURITES[0]);
    }

    // 3. Start timer
    startTimer();

    // 4. Force play background music
    forcePlay();

    // 5. Close popup
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative w-full max-w-md rounded-3xl border border-accent/40 bg-[#0d0d12]/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl text-center space-y-6 overflow-hidden"
          >
            {/* Ambient Accent Glow */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />

            {/* Top Close Cross Icon */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/5 p-2 text-muted hover:bg-white/10 hover:text-foreground transition-colors"
              aria-label="Dismiss popup"
            >
              <X size={18} />
            </button>

            {/* Header Icon & Title */}
            <div className="flex flex-col items-center gap-2 pt-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/30 shadow-lg animate-bounce">
                <Sparkles size={28} />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                Time&apos;s Up!
              </h2>
              <p className="text-sm text-muted max-w-xs">
                Need more time? Extend the timer by adding overtime minutes.
              </p>
            </div>

            {/* Overtime Quick Buttons */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                <Clock size={14} /> Add Overtime & Resume Music
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[5, 10, 15, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleAddOvertime(mins)}
                    className="flex flex-col items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 p-3 text-center transition-all hover:bg-accent hover:text-black hover:scale-105 active:scale-95 group"
                  >
                    <span className="text-base font-extrabold flex items-center gap-0.5">
                      <Plus size={14} /> {mins}m
                    </span>
                    <span className="text-[10px] opacity-80 font-medium group-hover:text-black">
                      +{mins} Minutes
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer note */}
            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-center gap-1.5 text-xs text-muted">
              <Music2 size={13} className="text-accent" />
              <span>Extending automatically resumes focus music</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
