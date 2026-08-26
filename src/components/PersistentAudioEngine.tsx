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
  const { status, isRunning } = useTimerStatus();

  // Play audio when timer is active OR when user requested music playback manually
  const shouldPlayAudio =
    (isRunning || isPlaying) && status !== "stopped" && status !== "completed";
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
