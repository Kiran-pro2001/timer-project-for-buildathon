export type AudioSourceType = "none" | "mp3" | "youtube";

export interface YouTubeVideo {
  id: string;
  videoId: string;
  url: string;
  title: string;
  category?: string;
}

export interface AudioState {
  source: AudioSourceType;
  youtube: YouTubeVideo | null;
  volume: number; // 0 to 100
}

// Minimal YouTube IFrame API declarations for TypeScript
export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  setVolume(volume: number): void;
  getVolume(): number;
  getPlayerState(): number;
  destroy(): void;
}

export interface YTPlayerEvent {
  target: YTPlayer;
  data?: number;
}

export interface YTPlayerOptions {
  height?: string | number;
  width?: string | number;
  videoId?: string;
  playerVars?: {
    autoplay?: 0 | 1;
    controls?: 0 | 1;
    loop?: 0 | 1;
    playlist?: string;
    origin?: string;
    enablejsapi?: 0 | 1;
    playsinline?: 0 | 1;
    rel?: 0 | 1;
  };
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerEvent) => void;
    onError?: (event: { target: YTPlayer; data: number }) => void;
  };
}

declare global {
  interface Window {
    YT?: {
      Player: new (elementId: string | HTMLElement, options: YTPlayerOptions) => YTPlayer;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}
