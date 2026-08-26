"use client";

import { useSyncExternalStore } from "react";
import type { YouTubeVideo } from "@/types/audio";
import {
  getAudioState,
  setAudioPlaying,
  setVolume,
  setYouTubeVideo,
  subscribeAudioState,
  toggleMute as toggleAudioMute,
} from "@/lib/audioStore";

export function useBackgroundAudio() {
  const state = useSyncExternalStore(
    subscribeAudioState,
    getAudioState,
    getAudioState
  );

  return {
    mounted: true,
    source: state.source,
    youtube: state.youtube,
    volume: state.volume,
    isMuted: state.volume === 0,
    isPlaying: Boolean(state.isPlaying),
    setYouTube: (video: YouTubeVideo | null, playImmediately: boolean = true) =>
      setYouTubeVideo(video, playImmediately),
    setVolume: (vol: number) => setVolume(vol),
    setPlaying: (playing: boolean) => setAudioPlaying(playing),
    toggleMute: () => toggleAudioMute(),
  };
}
