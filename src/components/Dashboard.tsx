"use client";

import { motion } from "framer-motion";
import { Sliders, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Launch } from "@/types/launch";
import { SPOTLIGHT_MS } from "@/lib/config";
import { playLaunchSound, setMuted, unlockAudio } from "@/lib/sound";
import { BrandingBottom } from "./Branding";
import { Background } from "./Background";
import { Confetti } from "./Confetti";
import { Countdown } from "./Countdown";
import { Fireworks } from "./Fireworks";
import { Hero } from "./Hero";
import { HypeBar } from "./HypeBar";
import { LaunchBillboard } from "./LaunchBillboard";
import { LaunchFeed } from "./LaunchFeed";
import { FocusTimerSection } from "./FocusTimerSection";
import { MotivationQuote } from "./MotivationQuote";
import { StatsBar } from "./StatsBar";
import { AdminPanel } from "./AdminPanel";
import { PersistentAudioEngine } from "./PersistentAudioEngine";
import { TimerCompletionModal } from "./TimerCompletionModal";
import { useAdminHotkey } from "@/hooks/useAdminHotkey";
import { useHype } from "@/hooks/useHype";
import { useLaunches } from "@/hooks/useLaunches";
import { useNewLaunch } from "@/hooks/useNewLaunch";
import { useThemeConfig } from "@/hooks/useThemeConfig";

interface Props {
  /** When mounted from /admin, open the panel immediately. */
  adminOpenInitially?: boolean;
}

interface Featured {
  launch: Launch;
  until: number;
}

export function Dashboard({ adminOpenInitially = false }: Props) {
  const { launches, addLaunch, deleteLaunch, clearAllLaunches, ready } = useLaunches();
  const [adminOpen, setAdminOpen] = useState(adminOpenInitially);
  const [confettiFire, setConfettiFire] = useState(0);
  const [fireworksFire, setFireworksFire] = useState(0);
  const [featured, setFeatured] = useState<Featured | null>(null);
  const [muted, setMutedState] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);

  const hype = useHype();
  useThemeConfig(); // Mounts active theme configuration & CSS properties

  const openAdmin = useCallback(() => setAdminOpen(true), []);
  useAdminHotkey(openAdmin);

  // Unlock the audio context on the first user interaction so auto-triggered
  // billboards can play sound (browsers block audio before a gesture).
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((m) => {
      const next = !m;
      setMuted(next);
      return next;
    });
  }, []);

  // Promote a launch to the Billboard: spotlight it + fireworks + sound + points.
  const billboard = useCallback(
    (launch: Launch) => {
      setFeatured({ launch, until: Date.now() + SPOTLIGHT_MS });
      setFireworksFire((n) => n + 1);
      playLaunchSound();
      hype.register();
    },
    [hype],
  );

  // Every new launch auto-takes the Billboard.
  useNewLaunch(launches, ready, billboard);

  // Auto-clear the spotlight after its window elapses.
  useEffect(() => {
    if (!featured) return;
    const ms = featured.until - Date.now();
    if (ms <= 0) {
      setFeatured(null);
      return;
    }
    const id = setTimeout(() => setFeatured(null), ms);
    return () => clearTimeout(id);
  }, [featured]);

  const handleClosed = useCallback(() => {
    setConfettiFire((n) => n + 1);
    setCompletionModalOpen(true);
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Persistent YouTube Audio Engine (Runs continuously in background across dialog open/close) */}
      <PersistentAudioEngine />

      <Background />
      <Fireworks fire={fireworksFire} />
      <Confetti fire={confettiFire} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col justify-between px-6 py-4 sm:px-8 sm:py-6">
        {/* FIRST FOLD CONTAINER: Fits exactly 100vh on screen */}
        <div className="flex min-h-[calc(100vh-3rem)] flex-col justify-between items-center py-2">
          {/* Top Right Header Controls */}
          <header className="flex w-full items-center justify-end">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                aria-label={muted ? "Unmute sound" : "Mute sound"}
                title={muted ? "Sound off" : "Sound on"}
                className="flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] p-2 text-muted backdrop-blur-sm transition-colors hover:text-foreground"
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                onClick={openAdmin}
                className="flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent backdrop-blur-md transition-all hover:bg-accent/20 active:scale-95 shadow-md"
              >
                <Sliders size={15} />
                <span>Admin & Controls</span>
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                  A
                </kbd>
              </button>
            </div>
          </header>

          {/* Core Presentation Focus: Hero Title + Big Stopwatch */}
          <div className="flex flex-col items-center justify-center my-auto py-4">
            <Hero />
            <Countdown onClosed={handleClosed} />
          </div>

          {/* Motivation Quote: Bottom of 1st Fold */}
          <div className="w-full max-w-2xl text-center pb-2">
            <MotivationQuote />
          </div>
        </div>

        {/* SECOND FOLD CONTENT: Scrolls below 100vh */}
        <div className="mt-12 space-y-12 pt-6 border-t border-[var(--border)]/40">
          {/* Billboard spotlight — appears when a launch is featured */}
          <LaunchBillboard
            featured={featured?.launch ?? null}
            until={featured?.until ?? 0}
            onClose={() => setFeatured(null)}
          />

          {/* Gamified hype strip */}
          <HypeBar points={hype.points} combo={hype.combo} hype={hype.hype} />

          {/* Stats */}
          <StatsBar launches={launches} />

          {/* Live feed — full width */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <LaunchFeed
              launches={launches}
              ready={ready}
              onBillboard={billboard}
              onDelete={deleteLaunch}
              onClearAll={clearAllLaunches}
            />
          </motion.div>

          {/* Focus Timer Section — directly after the launch section */}
          <FocusTimerSection />

          {/* Footer */}
          <footer className="pt-6">
            <BrandingBottom />
          </footer>
        </div>
      </div>

      <AdminPanel
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        onSubmit={addLaunch}
      />

      <TimerCompletionModal
        open={completionModalOpen}
        onClose={() => setCompletionModalOpen(false)}
      />
    </main>
  );
}
