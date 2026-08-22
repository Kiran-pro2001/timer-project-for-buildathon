"use client";

import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 1 + Math.random() * 2.5,
    delay: Math.random() * 12,
    duration: 14 + Math.random() * 16,
    drift: (Math.random() - 0.5) * 40,
  }));
}

export function Background() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [rockets, setRockets] = useState<Particle[]>([]);
  const [windowH, setWindowH] = useState(900);

  useEffect(() => {
    setMounted(true);
    setParticles(generateParticles(28));
    setRockets(generateParticles(3));
    setWindowH(window.innerHeight + 40);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Base vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-10%,rgba(255,255,255,0.06),transparent_60%)]" />

      {/* Subtle grid */}
      <div className="bg-grid absolute inset-0" />

      {/* Moving gradient aurora */}
      <div className="bg-aurora absolute inset-0 opacity-70" />

      {/* Floating particles (Rendered client-side after mount to prevent hydration mismatch) */}
      {mounted &&
        particles.map((p) => (
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
              y: [0, -windowH],
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
      {mounted &&
        rockets.map((r) => (
          <motion.div
            key={`rocket-${r.id}`}
            className="absolute text-white/10"
            style={{ left: `${r.left}%`, bottom: -40 }}
            initial={{ y: 0, opacity: 0, rotate: -45 }}
            animate={{ y: [0, -windowH - 80], opacity: [0, 0.5, 0.5, 0] }}
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
