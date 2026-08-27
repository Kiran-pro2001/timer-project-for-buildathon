"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Clock,
  ExternalLink,
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
  Timer,
  Type,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NewLaunch } from "@/types/launch";
import { useBackgroundAudio } from "@/hooks/useBackgroundAudio";
import { useEventTitle } from "@/hooks/useEventTitle";
import { useThemeConfig } from "@/hooks/useThemeConfig";
import { useTimerStatus } from "@/hooks/useTimerStatus";
import {
  analyzePosterCanvas,
  analyzePosterGemini,
  type DesignSense,
} from "@/lib/themeStore";
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
  const [activeTab, setActiveTab] = useState<"timer" | "audio" | "pomodoro" | "theme" | "launch" | "focustimer">("timer");

  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const { title, setTitle } = useEventTitle();
  const [titleDraft, setTitleDraft] = useState(title);
  const [editingTimer, setEditingTimer] = useState(false);

  const { status, isRunning, isPaused, startTimer, pauseTimer, resumeTimer, stopTimer } =
    useTimerStatus();
  const { youtube, setYouTube, setPlaying } = useBackgroundAudio();

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
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open, onClose]);

  const handleStartTimer = () => {
    if (!youtube) {
      setYouTube(HARKIRAT_FAVOURITES[0], true);
    } else {
      setPlaying(true);
    }
    startTimer();
  };

  const processPosterImage = async (imageUrl: string) => {
    setExtracting(true);
    let senses: DesignSense[] = [];
    if (geminiKeyInput.trim()) {
      senses = await analyzePosterGemini(imageUrl, geminiKeyInput.trim());
    } else {
      senses = await analyzePosterCanvas(imageUrl);
    }
    setExtracting(false);

    const firstSense = senses[0];
    theme.setTheme({
      mode: "custom",
      posterUrl: imageUrl,
      designSenses: senses,
      selectedSenseId: firstSense?.id || null,
      accentColor: firstSense?.primaryColor || "#FFD700",
      secondaryColor: firstSense?.secondaryColor || "#1A1A24",
      fontStyle: firstSense?.fontStyle || "sans",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      setPosterUrlInput(dataUrl);
      await processPosterImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handlePosterUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posterUrlInput.trim()) return;
    await processPosterImage(posterUrlInput.trim());
  };

  const selectSense = (sense: DesignSense) => {
    theme.setTheme({
      mode: "custom",
      selectedSenseId: sense.id,
      accentColor: sense.primaryColor,
      secondaryColor: sense.secondaryColor,
      fontStyle: sense.fontStyle,
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
            className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[var(--border)] bg-[#0c0c0f]/95 p-6 sm:p-7 shadow-2xl space-y-6"
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

            {/* Admin Tabs - All 6 tabs strictly in 1 single horizontal line */}
            <div className="grid grid-cols-6 gap-1 sm:gap-1.5 rounded-2xl border border-[var(--border)] bg-black/30 p-1.5 whitespace-nowrap overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("timer")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-semibold transition-all shrink-0 min-w-0",
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
                  "flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-semibold transition-all shrink-0 min-w-0",
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
                  "flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-semibold transition-all shrink-0 min-w-0",
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
                  "flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-semibold transition-all shrink-0 min-w-0",
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
                  "flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-semibold transition-all shrink-0 min-w-0",
                  activeTab === "launch"
                    ? "bg-accent text-black shadow-sm"
                    : "text-muted hover:text-foreground"
                )}
              >
                <Rocket size={14} /> Launch
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("focustimer")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-semibold transition-all shrink-0 min-w-0",
                  activeTab === "focustimer"
                    ? "bg-accent text-black shadow-sm"
                    : "text-muted hover:text-foreground"
                )}
              >
                <Timer size={14} /> Focus App
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

            {/* TAB 4: THEME & POSTER 3 DESIGN SENSES GENERATOR */}
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

                {/* Poster Analysis & Upload */}
                <div className="rounded-2xl border border-[var(--border)] bg-white/[0.02] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                      <ImageIcon size={16} />
                      <span>Poster AI Design Senses Generator</span>
                    </div>
                    <span className="text-[11px] text-muted">3 Design Senses</span>
                  </div>

                  <p className="text-xs text-muted leading-relaxed">
                    Upload your event poster. The AI engine classifies colors and font styles to generate 3 design senses for you to choose from!
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
                      {extracting ? "Analyzing AI..." : "Generate 3 Senses"}
                    </button>
                  </form>

                  {/* Gemini API Key Optional Input */}
                  <div className="pt-2 flex items-center gap-2">
                    <Key size={13} className="text-accent shrink-0" />
                    <input
                      type="password"
                      value={geminiKeyInput}
                      onChange={(e) => {
                        setGeminiKeyInput(e.target.value);
                        theme.setTheme({ geminiApiKey: e.target.value });
                      }}
                      placeholder="Enter Gemini API Key (Optional for Gemini 1.5 AI)"
                      className="admin-input !py-1 text-xs"
                    />
                  </div>
                </div>

                {/* 3 Design Senses Output Cards */}
                {theme.designSenses.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                      <Sparkles size={14} className="text-accent" />
                      <span>Select 1 of 3 Generated Design Senses:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {theme.designSenses.map((sense) => {
                        const isSelected = theme.selectedSenseId === sense.id;
                        return (
                          <div
                            key={sense.id}
                            className={cn(
                              "rounded-2xl border p-4 transition-all flex flex-col justify-between space-y-3",
                              isSelected
                                ? "border-accent bg-accent/10 shadow-lg ring-1 ring-accent"
                                : "border-[var(--border)] bg-black/20 hover:border-accent/40"
                            )}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-foreground">
                                  {sense.name}
                                </h4>
                                {isSelected && (
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-black">
                                    <Check size={12} />
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted mt-1 leading-normal">
                                {sense.description}
                              </p>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-muted">Primary:</span>
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className="h-4 w-4 rounded-full border border-white/20"
                                    style={{ backgroundColor: sense.primaryColor }}
                                  />
                                  <span className="font-mono text-[10px] text-foreground">
                                    {sense.primaryColor}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-muted">Font Style:</span>
                                <span className="font-mono uppercase font-semibold text-accent text-[10px]">
                                  {sense.fontStyle}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => selectSense(sense)}
                                className={cn(
                                  "w-full py-1.5 rounded-xl text-xs font-bold transition-all mt-2",
                                  isSelected
                                    ? "bg-accent text-black"
                                    : "bg-white/10 text-foreground hover:bg-accent hover:text-black"
                                )}
                              >
                                {isSelected ? "Active Theme" : "Apply Sense"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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

            {/* TAB 6: FOCUS TIMER APP REDIRECT */}
            {activeTab === "focustimer" && (
              <div className="space-y-5 rounded-2xl border border-accent/40 bg-accent/[0.04] p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20 text-accent shadow-md">
                  <Timer size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">
                    Mellow Minute Focus Timer App
                  </h3>
                  <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                    Opens the external Mellow Minute Focus Timer app (<code className="font-mono text-accent">https://mellow-minute-timer.lovable.app/</code>) directly.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = "https://mellow-minute-timer.lovable.app/";
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs font-bold text-black hover:bg-accent/90 transition-transform active:scale-95 shadow-lg"
                  >
                    <ExternalLink size={15} />
                    Open Focus Timer App (Full Page)
                  </button>
                </div>
              </div>
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
