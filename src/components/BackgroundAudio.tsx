"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  AlertCircle,
  Trash2,
  Music2,
  History,
  Star,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useBackgroundAudio } from "@/hooks/useBackgroundAudio";
import { useTimerStatus } from "@/hooks/useTimerStatus";
import type { YouTubeVideo } from "@/types/audio";
import {
  DEFAULT_YOUTUBE_SOUNDS,
  HARKIRAT_FAVOURITES,
  addCustomSavedSong,
  addRecentYouTubeHistory,
  clearRecentYouTubeHistory,
  deleteCustomSavedSong,
  extractYouTubeId,
  getCustomSavedSongs,
  getRecentYouTubeHistory,
  type CustomSavedSong,
  type HistoryYouTubeItem,
} from "@/lib/youtubeConfig";
import { cn } from "@/lib/utils";

function YoutubeIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function BackgroundAudio() {
  const { mounted, youtube, volume, isPlaying, setYouTube, setVolume, setPlaying, toggleMute } =
    useBackgroundAudio();
  const { status, isRunning, isPaused, startTimer, pauseTimer, resumeTimer, stopTimer } =
    useTimerStatus();

  const [minimized, setMinimized] = useState(false);

  // Form states for Quick Custom URL & Custom Favourite Song Form
  const [urlInput, setUrlInput] = useState("");
  const [favTitleInput, setFavTitleInput] = useState("");
  const [favUrlInput, setFavUrlInput] = useState("");
  const [favCategoryInput, setFavCategoryInput] = useState("Custom");

  const [validationError, setValidationError] = useState<string | null>(null);
  const [favValidationError, setFavValidationError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryYouTubeItem[]>([]);
  const [customSavedSongs, setCustomSavedSongs] = useState<CustomSavedSong[]>([]);

  useEffect(() => {
    setHistory(getRecentYouTubeHistory());
    setCustomSavedSongs(getCustomSavedSongs());
  }, []);

  const handleAddYouTubeUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMsg(null);

    const trimmed = urlInput.trim();
    if (!trimmed) {
      setValidationError("Please enter a YouTube URL.");
      return;
    }

    const extractedId = extractYouTubeId(trimmed);
    if (!extractedId) {
      setValidationError("Please enter a valid YouTube URL.");
      return;
    }

    const newVid = {
      id: `custom-${Date.now()}`,
      videoId: extractedId,
      url: trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
      title: `Custom Stream (${extractedId})`,
      category: "Custom Link",
    };

    const updatedHistory = addRecentYouTubeHistory(newVid);
    setHistory(updatedHistory);
    setYouTube(newVid, true);
    setUrlInput("");
    setSuccessMsg("✓ Custom YouTube audio added & playing in background");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSaveCustomFavourite = (e: React.FormEvent) => {
    e.preventDefault();
    setFavValidationError(null);

    const title = favTitleInput.trim();
    const url = favUrlInput.trim();

    if (!title || !url) {
      setFavValidationError("Both song name and YouTube URL are required.");
      return;
    }

    const extractedId = extractYouTubeId(url);
    if (!extractedId) {
      setFavValidationError("Please enter a valid YouTube URL.");
      return;
    }

    const updatedSaved = addCustomSavedSong({
      title,
      url: url.startsWith("http") ? url : `https://${url}`,
      videoId: extractedId,
      category: favCategoryInput.trim() || "Custom",
    });

    setCustomSavedSongs(updatedSaved);
    setFavTitleInput("");
    setFavUrlInput("");
    setFavCategoryInput("Custom");
    setSuccessMsg(`✓ Saved "${title}" to your favourite songs!`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleDeleteSavedSong = (id: string) => {
    const updated = deleteCustomSavedSong(id);
    setCustomSavedSongs(updated);
  };

  const handleTrackToggle = (sound: YouTubeVideo) => {
    setValidationError(null);
    setSuccessMsg(null);

    const isSelected = youtube?.videoId === sound.videoId;
    if (isSelected) {
      // Toggle play/pause for the currently selected track
      setPlaying(!isPlaying);
    } else {
      // Switch track and play immediately
      setYouTube(sound, true);
      setSuccessMsg(`✓ Playing ${sound.title}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const togglePlayback = () => {
    setPlaying(!isPlaying);
  };

  const handleClearHistory = () => {
    clearRecentYouTubeHistory();
    setHistory([]);
  };

  const removeSelectedYouTube = () => {
    setYouTube(null, false);
    setSuccessMsg(null);
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-3xl rounded-3xl border border-[var(--border)] bg-[var(--card)] backdrop-blur-md shadow-xl transition-all">
      {/* Minimized View Header / Control Bar */}
      <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent shrink-0">
            <Music2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                YouTube Background Audio
              </h3>
              {isPlaying && (
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 size={10} /> Active & Playing
                </span>
              )}
            </div>
            <p className="text-xs text-muted truncate max-w-[280px] sm:max-w-[380px]">
              {youtube ? youtube.title : "No YouTube video selected"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {youtube && (
            <button
              type="button"
              onClick={togglePlayback}
              className="flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs font-bold text-accent hover:bg-accent/20 transition-all active:scale-95 shadow-sm"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? "Pause Music" : "Play Music"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMinimized((m) => !m)}
            className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-white/5 px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
          >
            {minimized ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            <span>{minimized ? "Expand" : "Minimize"}</span>
          </button>
        </div>
      </div>

      {/* Expanded Content Area */}
      <AnimatePresence initial={false}>
        {!minimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Harkirat's Favourite YouTube Links */}
              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                  <Flame size={15} className="text-amber-400" />
                  <span>Favourite Links by Harkirat</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {HARKIRAT_FAVOURITES.map((sound) => {
                    const isSelected = youtube?.videoId === sound.videoId;
                    const isThisPlaying = isSelected && isPlaying;
                    return (
                      <div
                        key={sound.id}
                        className={cn(
                          "group flex items-center justify-between rounded-xl border p-3.5 text-left transition-all",
                          isThisPlaying
                            ? "border-accent bg-accent/15 shadow-md"
                            : "border-accent/30 bg-accent/[0.03] hover:border-accent hover:bg-accent/[0.08]"
                        )}
                      >
                        <div className="truncate pr-2">
                          <div className="text-sm font-semibold text-foreground truncate">
                            {sound.title}
                          </div>
                          <div className="text-[11px] text-accent flex items-center gap-1 mt-0.5 font-mono">
                            <YoutubeIcon size={11} className="text-red-400" />
                            <span>Harkirat&apos;s Pick</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleTrackToggle(sound)}
                          className={cn(
                            "flex items-center gap-1.5 shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95",
                            isThisPlaying
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30"
                              : isSelected
                              ? "bg-accent text-black hover:bg-accent/90"
                              : "bg-accent/20 text-accent hover:bg-accent hover:text-black"
                          )}
                        >
                          {isThisPlaying ? (
                            <>
                              <Pause size={13} /> Pause
                            </>
                          ) : (
                            <>
                              <Play size={13} /> {isSelected ? "Play" : "Select"}
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MY CUSTOM SAVED SONGS SECTION */}
              {customSavedSongs.length > 0 && (
                <div className="rounded-2xl border border-accent/40 bg-accent/[0.04] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                      <Star size={15} className="text-amber-400 fill-amber-400" />
                      <span>My Custom Saved Songs ({customSavedSongs.length})</span>
                    </div>
                    <span className="text-[10px] text-muted">Saved Favourites</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {customSavedSongs.map((song) => {
                      const isSelected = youtube?.videoId === song.videoId;
                      const isThisPlaying = isSelected && isPlaying;
                      return (
                        <div
                          key={song.id}
                          className={cn(
                            "group flex items-center justify-between rounded-xl border p-3 text-left transition-all",
                            isThisPlaying
                              ? "border-accent bg-accent/15 shadow-md"
                              : "border-white/10 bg-white/[0.03] hover:border-accent/50 hover:bg-white/[0.06]"
                          )}
                        >
                          <div className="truncate pr-2">
                            <div className="text-sm font-bold text-foreground truncate">
                              {song.title}
                            </div>
                            <div className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                              <span className="rounded bg-white/10 px-1.5 py-0.2 font-mono">
                                {song.category}
                              </span>
                              <span className="truncate">{song.url}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleTrackToggle(song)}
                              className={cn(
                                "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all active:scale-95",
                                isThisPlaying
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30"
                                  : "bg-white/10 text-foreground hover:bg-accent hover:text-black"
                              )}
                            >
                              {isThisPlaying ? (
                                <>
                                  <Pause size={12} /> Pause
                                </>
                              ) : (
                                <>
                                  <Play size={12} /> Play
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSavedSong(song.id)}
                              title="Remove favourite"
                              className="rounded-lg p-1 text-muted hover:text-red-400 hover:bg-white/5 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SAVE CUSTOM FAVOURITE SONG FORM */}
              <div className="rounded-2xl border border-[var(--border)] bg-black/30 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                  <Plus size={14} />
                  <span>Save Song as Favourite</span>
                </div>

                <form onSubmit={handleSaveCustomFavourite} className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={favTitleInput}
                      onChange={(e) => setFavTitleInput(e.target.value)}
                      placeholder="Song / Stream Name (e.g. My Coding Lofi)"
                      className="rounded-xl border border-[var(--border)] bg-black/20 px-3.5 py-2 text-xs text-foreground placeholder:text-muted/60 outline-none focus:border-accent"
                    />
                    <input
                      type="text"
                      value={favCategoryInput}
                      onChange={(e) => setFavCategoryInput(e.target.value)}
                      placeholder="Category Tag (e.g. Lofi, Chill, Focus)"
                      className="rounded-xl border border-[var(--border)] bg-black/20 px-3.5 py-2 text-xs text-foreground placeholder:text-muted/60 outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={favUrlInput}
                      onChange={(e) => setFavUrlInput(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      className="flex-1 rounded-xl border border-[var(--border)] bg-black/20 px-3.5 py-2 text-xs text-foreground placeholder:text-muted/60 outline-none focus:border-accent"
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-black hover:bg-accent/90 transition-transform active:scale-95 shrink-0"
                    >
                      <Star size={13} className="fill-black" /> Save Favourite
                    </button>
                  </div>

                  {favValidationError && (
                    <div className="flex items-center gap-1.5 text-xs text-[#ff6b78]">
                      <AlertCircle size={13} />
                      <span>{favValidationError}</span>
                    </div>
                  )}
                </form>
              </div>

              {/* General Focus Streams */}
              <div>
                <div className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
                  Focus Streams
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DEFAULT_YOUTUBE_SOUNDS.filter((s) => !s.id.startsWith("harkirat")).map(
                    (sound) => {
                      const isSelected = youtube?.videoId === sound.videoId;
                      const isThisPlaying = isSelected && isPlaying;
                      return (
                        <div
                          key={sound.id}
                          className={cn(
                            "group flex items-center justify-between rounded-xl border p-3.5 text-left transition-all",
                            isThisPlaying
                              ? "border-accent bg-accent/10 shadow-sm"
                              : "border-[var(--border)] bg-white/[0.02] hover:border-accent/40 hover:bg-white/[0.04]"
                          )}
                        >
                          <div className="truncate pr-2">
                            <div className="text-sm font-medium text-foreground truncate">
                              {sound.title}
                            </div>
                            <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                              <YoutubeIcon size={11} className="text-red-400" />
                              <span>{sound.category || "YouTube"}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTrackToggle(sound)}
                            className={cn(
                              "flex items-center gap-1 shrink-0 rounded-lg px-3 py-1 text-xs font-medium transition-all active:scale-95",
                              isThisPlaying
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                : "bg-white/5 text-muted hover:text-foreground hover:bg-accent hover:text-black font-semibold"
                            )}
                          >
                            {isThisPlaying ? (
                              <>
                                <Pause size={12} /> Pause
                              </>
                            ) : (
                              <>
                                <Play size={12} /> Play
                              </>
                            )}
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Quick Add Custom YouTube Link Form */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  Quick Play YouTube Link
                </div>
                <form onSubmit={handleAddYouTubeUrl} className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    aria-label="YouTube Video URL"
                    className="flex-1 rounded-xl border border-[var(--border)] bg-black/20 px-3.5 py-2 text-sm text-foreground placeholder:text-muted/60 outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black transition-transform active:scale-[0.98] hover:bg-accent/90"
                  >
                    Play Link
                  </button>
                </form>

                {validationError && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[#ff6b78]">
                    <AlertCircle size={13} />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>

              {/* Recent YouTube Links History Section */}
              {history.length > 0 && (
                <div className="rounded-2xl border border-[var(--border)] bg-black/20 p-4">
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                      <History size={13} className="text-accent" />
                      <span>Recent Custom Links History</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-[11px] text-muted hover:text-red-400 transition-colors"
                    >
                      Clear History
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {history.map((item) => {
                      const isSelected = youtube?.videoId === item.videoId;
                      const isThisPlaying = isSelected && isPlaying;
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-center justify-between rounded-xl p-2.5 border transition-all text-xs",
                            isThisPlaying
                              ? "border-accent bg-accent/10"
                              : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                          )}
                        >
                          <div className="truncate pr-2">
                            <div className="font-semibold text-foreground truncate">
                              {item.title}
                            </div>
                            <div className="text-[10px] text-muted truncate">
                              {item.url}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTrackToggle(item)}
                            className={cn(
                              "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all shrink-0 active:scale-95",
                              isThisPlaying
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                : "bg-white/10 text-foreground hover:bg-accent hover:text-black"
                            )}
                          >
                            {isThisPlaying ? (
                              <>
                                <Pause size={11} /> Pause
                              </>
                            ) : (
                              <>
                                <Play size={11} /> Replay
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Selected Video Card */}
              {youtube && (
                <div className="rounded-2xl border border-accent/30 bg-accent/[0.04] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 text-accent shrink-0">
                        <YoutubeIcon size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                          <span>{youtube.title}</span>
                        </div>
                        <div className="text-xs text-muted truncate max-w-[280px]">
                          {youtube.url}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={togglePlayback}
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-white/10 transition-colors"
                      >
                        {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                        {isPlaying ? "Pause Music" : "Play Music"}
                      </button>
                      <button
                        type="button"
                        onClick={removeSelectedYouTube}
                        aria-label="Remove video"
                        className="rounded-lg p-1.5 text-muted hover:text-[#ff6b78] hover:bg-white/5 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium"
                >
                  <CheckCircle2 size={13} />
                  <span>{successMsg}</span>
                </motion.div>
              )}

              {/* Volume Slider Section */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center gap-4">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={volume === 0 ? "Unmute volume" : "Mute volume"}
                  className="text-muted hover:text-foreground transition-colors"
                >
                  {volume === 0 ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className="text-accent" />}
                </button>

                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    aria-label="Background audio volume"
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-accent"
                  />
                  <span className="w-9 text-right text-xs font-mono font-medium text-muted">
                    {volume}%
                  </span>
                </div>
              </div>

              {/* Timer Synchronization Bar */}
              <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-muted flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span>
                    Timer:{" "}
                    <strong className="uppercase text-foreground font-mono">{status}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isRunning ? (
                    <button
                      type="button"
                      onClick={pauseTimer}
                      className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-all"
                    >
                      <Pause size={14} /> Pause Timer
                    </button>
                  ) : isPaused ? (
                    <button
                      type="button"
                      onClick={resumeTimer}
                      className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-black hover:bg-accent/90 transition-all"
                    >
                      <Play size={14} /> Resume Timer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startTimer}
                      className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-black hover:bg-accent/90 transition-all"
                    >
                      <Play size={14} /> Start Timer
                    </button>
                  )}

                  {(isRunning || isPaused) && (
                    <button
                      type="button"
                      onClick={stopTimer}
                      className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white/5 px-3 py-2 text-xs font-medium text-muted hover:text-foreground transition-all"
                    >
                      <RotateCcw size={13} /> Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
