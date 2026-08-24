"use client";

import { useSyncExternalStore } from "react";
import type { YouTubeVideo } from "@/types/audio";
import {
  getAudioState,
  setVolume,
  setYouTubeVideo,
  subscribeAudioState,
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
    setYouTube: (video: YouTubeVideo | null) => setYouTubeVideo(video),
    setVolume: (vol: number) => setVolume(vol),
  };
}

