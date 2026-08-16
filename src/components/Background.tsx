"use client";

import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { useMemo } from "react";

/** Deterministic-ish particles generated once per mount. */
function useParticles(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        delay: Math.random() * 12,
        duration: 14 + Math.random() * 16,
        drift: (Math.random() - 0.5) * 40,
      })),
    [count],
  );
}

export function Background() {
  const particles = useParticles(28);
  const rockets = useParticles(3);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Base vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-10%,rgba(255,255,255,0.06),transparent_60%)]" />

      {/* Subtle grid */}
      <div className="bg-grid absolute inset-0" />

      {/* Moving gradient aurora */}
      <div className="bg-aurora absolute inset-0 opacity-70" />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-white/40"
          style={{
            left: `${p.left}%`,
            bottom: -10,
            width: p.size,
            height: p.size,
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: [0, -window_h()],
            x: [0, p.drift],
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Occasional floating rockets */}
      {rockets.map((r) => (
        <motion.div
          key={`rocket-${r.id}`}
          className="absolute text-white/10"
          style={{ left: `${r.left}%`, bottom: -40 }}
          initial={{ y: 0, opacity: 0, rotate: -45 }}
          animate={{ y: [0, -window_h() - 80], opacity: [0, 0.5, 0.5, 0] }}
          transition={{
            duration: r.duration + 10,
            delay: r.delay + 6,
            repeat: Infinity,
            repeatDelay: 8,
            ease: "linear",
          }}
        >
          <Rocket size={28} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
}

// Guard against SSR where `window` is undefined.
function window_h() {
  if (typeof window === "undefined") return 900;
  return window.innerHeight + 40;
}
