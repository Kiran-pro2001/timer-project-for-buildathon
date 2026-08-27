"use client";

import { useBackgroundAudio } from "@/hooks/useBackgroundAudio";
import { useTimerStatus } from "@/hooks/useTimerStatus";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";

const PLAYER_CONTAINER_ID = "youtube-bg-audio-container";

/**
 * Persistent YouTube Audio Host.
 * Mounts permanently at root layout level so closing dialog boxes,
 * clicking mouse X, or switching tabs NEVER unmounts the YouTube player!
 */
export function PersistentAudioEngine() {
  const { mounted, youtube, volume, isPlaying } = useBackgroundAudio();
  const { status } = useTimerStatus();

  // Explicitly controlled by isPlaying state; stopped/completed timers silence audio
  const shouldPlayAudio =
    Boolean(isPlaying) && status !== "stopped" && status !== "completed";
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
