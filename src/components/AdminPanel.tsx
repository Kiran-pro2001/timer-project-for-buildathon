"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  Image as ImageIcon,
  Key,
  Music2,
  Palette,
  Pause,
  Pencil,
  Play,
  Rocket,
  RotateCcw,
  Sliders,
  Sparkles,
  Target,
  Type,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NewLaunch } from "@/types/launch";
import { useBackgroundAudio } from "@/hooks/useBackgroundAudio";
import { useEventTitle } from "@/hooks/useEventTitle";
import { useThemeConfig } from "@/hooks/useThemeConfig";
import { useTimerStatus } from "@/hooks/useTimerStatus";
import { extractDominantColor } from "@/lib/themeStore";
import { HARKIRAT_FAVOURITES } from "@/lib/youtubeConfig";
import { BackgroundAudio } from "./BackgroundAudio";
import { TimerEditor } from "./Countdown";
import { PomodoroTaskPanel } from "./PomodoroTaskPanel";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (launch: NewLaunch) => Promise<unknown> | void;
}

const empty = { builder: "", product: "", url: "" };

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function AdminPanel({ open, onClose, onSubmit }: Props) {
  const [activeTab, setActiveTab] = useState<"timer" | "audio" | "pomodoro" | "theme" | "launch">("timer");

  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const { title, setTitle } = useEventTitle();
  const [titleDraft, setTitleDraft] = useState(title);
  const [editingTimer, setEditingTimer] = useState(false);

  const { status, isRunning, isPaused, startTimer, pauseTimer, resumeTimer, stopTimer } =
    useTimerStatus();
  const { youtube, setYouTube } = useBackgroundAudio();

  // Theme Config
  const theme = useThemeConfig();
  const [posterUrlInput, setPosterUrlInput] = useState(theme.posterUrl || "");
  const [geminiKeyInput, setGeminiKeyInput] = useState(theme.geminiApiKey || "");
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    if (open) setTitleDraft(title);
  }, [open, title]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const handleStartTimer = () => {
    if (!youtube) {
      setYouTube(HARKIRAT_FAVOURITES[0]);
    }
    startTimer();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      setPosterUrlInput(dataUrl);
      setExtracting(true);
      const extractedHex = await extractDominantColor(dataUrl);
      setExtracting(false);

      theme.setTheme({
        mode: "custom",
        posterUrl: dataUrl,
        accentColor: extractedHex,
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePosterUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posterUrlInput.trim()) return;

    setExtracting(true);
    const extractedHex = await extractDominantColor(posterUrlInput.trim());
    setExtracting(false);

    theme.setTheme({
      mode: "custom",
      posterUrl: posterUrlInput.trim(),
      accentColor: extractedHex,
    });
  };

  const updateForm = (key: keyof typeof empty) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.builder.trim() || !form.product.trim()) {
      setError("Builder and product names are required.");
      return;
    }
    const url = normalizeUrl(form.url);
    try {
      new URL(url);
    } catch {
      setError("Enter a valid launch URL.");
      return;
    }

    await onSubmit({ builder: form.builder, product: form.product, url });
    setForm(empty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    firstFieldRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Build Hour admin panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[var(--border)] bg-[#0c0c0f]/95 p-6 sm:p-7 shadow-2xl space-y-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Sliders size={20} className="text-accent" />
                  Control & Admin Center
                </div>
                <p className="mt-1 text-xs text-muted">
                  Control the live countdown, theme, music, focus modes, and launches.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-foreground"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Admin Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 rounded-2xl border border-[var(--border)] bg-black/30 p-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("timer")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-semibold transition-all",
                  activeTab === "timer"
                    ? "bg-accent text-black shadow-sm"
                    : "text-muted hover:text-foreground"
                )}
              >
                <Clock size={14} /> Timer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("audio")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-semibold transition-all",
                  activeTab === "audio"
                    ? "bg-accent text-black shadow-sm"
                    : "text-muted hover:text-foreground"
                )}
              >
                <Music2 size={14} /> Music
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pomodoro")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-semibold transition-all",
                  activeTab === "pomodoro"
                    ? "bg-accent text-black shadow-sm"
                    : "text-muted hover:text-foreground"
                )}
              >
                <Target size={14} /> Focus
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("theme")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-semibold transition-all",
                  activeTab === "theme"
                    ? "bg-accent text-black shadow-sm"
                    : "text-muted hover:text-foreground"
                )}
              >
                <Palette size={14} /> Theme
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("launch")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-semibold transition-all",
                  activeTab === "launch"
                    ? "bg-accent text-black shadow-sm"
                    : "text-muted hover:text-foreground"
                )}
              >
                <Rocket size={14} /> Launch
              </button>
            </div>

            {/* TAB 1: TIMER CONTROLS */}
            {activeTab === "timer" && (
              <div className="space-y-5">
                {/* Event Name */}
                <div className="rounded-2xl border border-[var(--border)] bg-white/[0.02] p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    <Type size={14} className="text-accent" />
                    Event Name
                  </div>
                  <input
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={() => setTitle(titleDraft)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setTitle(titleDraft);
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    placeholder="Build Hour"
                    className="admin-input"
                  />
                </div>

                {/* Primary Timer Controls */}
                <div className="rounded-2xl border border-accent/20 bg-accent/[0.03] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Timer Status
                    </span>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent bg-accent/15 px-3 py-1 rounded-full border border-accent/30">
                      {status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {isRunning ? (
                      <button
                        type="button"
                        onClick={pauseTimer}
                        className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all shadow-md active:scale-95"
                      >
                        <Pause size={15} /> Pause Timer
                      </button>
                    ) : isPaused ? (
                      <button
                        type="button"
                        onClick={resumeTimer}
                        className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-black hover:bg-accent/90 transition-all shadow-md active:scale-95"
                      >
                        <Play size={15} /> Resume Timer
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartTimer}
                        className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-black hover:bg-accent/90 transition-all shadow-md active:scale-95"
                      >
                        <Play size={15} /> Start Timer
                      </button>
                    )}

                    {(isRunning || isPaused) && (
                      <button
                        type="button"
                        onClick={stopTimer}
                        className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white/5 px-4 py-2.5 text-xs font-semibold text-muted hover:text-foreground transition-all active:scale-95"
                      >
                        <RotateCcw size={14} /> Reset
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setEditingTimer((v) => !v)}
                      className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white/5 px-4 py-2.5 text-xs font-semibold text-muted hover:text-foreground transition-all"
                    >
                      <Pencil size={14} />
                      {editingTimer ? "Hide Alarm Editor" : "Edit Alarm Timer"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {editingTimer && (
                      <TimerEditor onDone={() => setEditingTimer(false)} />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* TAB 2: YOUTUBE BACKGROUND AUDIO */}
            {activeTab === "audio" && (
              <div>
                <BackgroundAudio />
              </div>
            )}

            {/* TAB 3: FOCUS & POMODORO TASKS */}
            {activeTab === "pomodoro" && (
              <div>
                <PomodoroTaskPanel />
              </div>
            )}

            {/* TAB 4: THEME & POSTER PALETTE GENERATOR */}
            {activeTab === "theme" && (
              <div className="space-y-5">
                {/* Theme Mode Selector */}
                <div className="flex gap-2 p-1 rounded-2xl border border-[var(--border)] bg-black/20">
                  <button
                    type="button"
                    onClick={() => theme.setTheme({ mode: "default" })}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                      theme.mode === "default"
                        ? "bg-accent text-black shadow-md"
                        : "text-muted hover:text-foreground"
                    )}
                  >
                    <span>Default Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => theme.setTheme({ mode: "custom" })}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                      theme.mode === "custom"
                        ? "bg-accent text-black shadow-md"
                        : "text-muted hover:text-foreground"
                    )}
                  >
                    <Sparkles size={14} />
                    <span>Custom Poster Mode</span>
                  </button>
                </div>

                {/* Custom Poster Color Extraction Section */}
                <div className="rounded-2xl border border-[var(--border)] bg-white/[0.02] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                      <ImageIcon size={16} />
                      <span>Event Poster Palette Extractor</span>
                    </div>
                    <span className="text-[11px] text-muted">Canvas AI Extraction</span>
                  </div>

                  <p className="text-xs text-muted leading-relaxed">
                    Upload your event poster or paste its URL. The engine automatically extracts the poster&apos;s dominant color combinations to theme the entire app!
                  </p>

                  {/* Upload File Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-foreground">
                      Upload Poster Image File:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-accent file:text-black hover:file:bg-accent/90 cursor-pointer"
                    />
                  </div>

                  {/* Poster URL Form */}
                  <form onSubmit={handlePosterUrlSubmit} className="flex gap-2">
                    <input
                      type="url"
                      value={posterUrlInput}
                      onChange={(e) => setPosterUrlInput(e.target.value)}
                      placeholder="Or paste poster image URL..."
                      className="admin-input flex-1"
                    />
                    <button
                      type="submit"
                      disabled={extracting}
                      className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-black hover:bg-accent/90 transition-all shrink-0"
                    >
                      {extracting ? "Extracting..." : "Extract Theme"}
                    </button>
                  </form>

                  {/* Accent Color Swatch & Manual Override */}
                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted">
                        Extracted Accent Color:
                      </span>
                      <div
                        className="h-6 w-6 rounded-full border border-white/20 shadow-md"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                      <span className="font-mono text-xs font-bold text-foreground">
                        {theme.accentColor}
                      </span>
                    </div>

                    <input
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) =>
                        theme.setTheme({ mode: "custom", accentColor: e.target.value })
                      }
                      className="h-8 w-12 cursor-pointer rounded-lg border border-[var(--border)] bg-transparent p-0.5"
                    />
                  </div>

                  {/* Optional Gemini API Key Input */}
                  <div className="pt-3 border-t border-[var(--border)] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                      <Key size={13} className="text-accent" />
                      <span>Optional Gemini API Key (For AI Palette Styling):</span>
                    </div>
                    <input
                      type="password"
                      value={geminiKeyInput}
                      onChange={(e) => {
                        setGeminiKeyInput(e.target.value);
                        theme.setTheme({ geminiApiKey: e.target.value });
                      }}
                      placeholder="AIzaSy..."
                      className="admin-input text-xs"
                    />
                    <p className="text-[11px] text-muted/70">
                      If provided, Gemini API enhances poster color palette classification.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: ADD LAUNCH */}
            {activeTab === "launch" && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Field label="Builder Name">
                  <input
                    ref={firstFieldRef}
                    value={form.builder}
                    onChange={updateForm("builder")}
                    placeholder="Harkirat"
                    className="admin-input"
                  />
                </Field>
                <Field label="Product">
                  <input
                    value={form.product}
                    onChange={updateForm("product")}
                    placeholder="My product"
                    className="admin-input"
                  />
                </Field>
                <Field label="Launch URL">
                  <input
                    value={form.url}
                    onChange={updateForm("url")}
                    placeholder="example.com"
                    className="admin-input"
                  />
                </Field>

                {error && <p className="text-xs text-[#ff6b78]">{error}</p>}

                <button
                  type="submit"
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-black transition-transform active:scale-[0.98] hover:bg-accent/90"
                >
                  <Rocket size={17} />
                  {justAdded ? "Launched! Add another" : "Submit Launch"}
                </button>
              </form>
            )}

            <p className="pt-2 text-center text-xs text-muted">
              Press <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">Esc</kbd> to close
            </p>
          </motion.div>

          <style jsx global>{`
            .admin-input {
              width: 100%;
              border-radius: 0.75rem;
              border: 1px solid var(--border);
              background: rgba(255, 255, 255, 0.03);
              padding: 0.7rem 0.9rem;
              font-size: 0.95rem;
              color: var(--foreground);
              outline: none;
              transition: border-color 0.15s, box-shadow 0.15s;
            }
            .admin-input::placeholder {
              color: rgba(255, 255, 255, 0.28);
            }
            .admin-input:focus {
              border-color: var(--accent);
              box-shadow: 0 0 0 3px var(--accent-soft);
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
