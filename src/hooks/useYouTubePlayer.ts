"use client";

import { useEffect, useRef, useState } from "react";
import type { YTPlayer } from "@/types/audio";

let apiLoadingPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject("Window undefined");

  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }

  if (apiLoadingPromise) {
    return apiLoadingPromise;
  }

  apiLoadingPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousReady) previousReady();
      resolve();
    };

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  });

  return apiLoadingPromise;
}

interface UseYouTubePlayerProps {
  containerId: string;
  videoId: string | null;
  volume: number;
  enabled: boolean;
  isPlaying: boolean;
}

export function useYouTubePlayer({
  containerId,
  videoId,
  volume,
  enabled,
  isPlaying,
}: UseYouTubePlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentVideoIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !videoId) {
      if (playerRef.current) {
        try {
          playerRef.current.pauseVideo();
        } catch {
          /* ignore */
        }
      }
      return;
    }

    let isSubscribed = true;

    loadYouTubeIframeApi().then(() => {
      if (!isSubscribed || !window.YT || !window.YT.Player) return;

      const container = document.getElementById(containerId);
      if (!container) return;

      if (playerRef.current && currentVideoIdRef.current === videoId) {
        return;
      }

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          /* ignore */
        }
        playerRef.current = null;
      }

      setError(null);

      const element = document.createElement("div");
      const subContainerId = `${containerId}-node`;
      element.id = subContainerId;
      container.innerHTML = "";
      container.appendChild(element);

      try {
        currentVideoIdRef.current = videoId;
        new window.YT.Player(subContainerId, {
          height: "1",
          width: "1",
          videoId,
          playerVars: {
            autoplay: isPlaying ? 1 : 0,
            controls: 0,
            loop: 1,
            playlist: videoId,
            enablejsapi: 1,
            playsinline: 1,
            rel: 0,
            origin: typeof window !== "undefined" ? window.location.origin : undefined,
          },
          events: {
            onReady: (event) => {
              if (!isSubscribed) return;
              playerRef.current = event.target;
              try {
                event.target.setVolume(volume);
              } catch {
                /* ignore */
              }
              setIsReady(true);
              if (isPlaying) {
                try {
                  event.target.playVideo();
                } catch {
                  /* ignore */
                }
              }
            },
            onError: (errEvent) => {
              if (!isSubscribed) return;
              console.warn("YouTube Player error:", errEvent.data);
              setError("This YouTube video cannot be played (embedding disabled or video unavailable).");
            },
          },
        });
      } catch (err) {
        console.warn("Failed to create YouTube player:", err);
        if (isSubscribed) {
          setError("Could not load YouTube player.");
        }
      }
    });

    return () => {
      isSubscribed = false;
      if (playerRef.current) {
        try {
          playerRef.current.pauseVideo();
          playerRef.current.destroy();
        } catch {
          /* ignore */
        }
        playerRef.current = null;
      }
    };
  }, [containerId, videoId, enabled, volume, isPlaying]);

  useEffect(() => {
    if (playerRef.current && isReady && enabled) {
      try {
        playerRef.current.setVolume(volume);
      } catch {
        /* ignore */
      }
    }
  }, [volume, isReady, enabled]);

  useEffect(() => {
    if (!playerRef.current || !isReady || !enabled) return;

    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch {
      /* ignore */
    }
  }, [isPlaying, isReady, enabled]);

  const forcePlay = () => {
    if (playerRef.current) {
      try {
        playerRef.current.playVideo();
      } catch {
        /* ignore */
      }
    }
  };

  const forcePause = () => {
    if (playerRef.current) {
      try {
        playerRef.current.pauseVideo();
      } catch {
        /* ignore */
      }
    }
  };

  return { isReady, error, forcePlay, forcePause };
}
