"use client";

import { useBackgroundAudio } from "@/hooks/useBackgroundAudio";
import { useTimerStatus } from "@/hooks/useTimerStatus";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";

const PLAYER_CONTAINER_ID = "youtube-bg-audio-container";

/**
 * Persistent YouTube Audio Host.
 * Mounts at root layout level so closing dialog boxes / switching tabs
 * NEVER unmounts the YouTube iframe or stops background music!
 */
export function PersistentAudioEngine() {
  const { mounted, youtube, volume } = useBackgroundAudio();
  const { status, isRunning } = useTimerStatus();

  // Play audio when timer is active or music is selected
  const shouldPlayAudio = isRunning && status !== "stopped" && status !== "completed";
  const activeVideoId = youtube?.videoId ?? null;

  useYouTubePlayer({
    containerId: PLAYER_CONTAINER_ID,
    videoId: activeVideoId,
    volume,
    enabled: true,
    isPlaying: shouldPlayAudio,
  });

  if (!mounted) return null;

  return (
    <div id={PLAYER_CONTAINER_ID} className="hidden" aria-hidden="true" />
  );
}
