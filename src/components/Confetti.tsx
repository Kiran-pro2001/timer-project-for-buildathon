"use client";

import { useEffect, useRef } from "react";

interface Props {
  /** Increment to fire a burst. */
  fire: number;
}

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vrot: number;
  color: string;
}

const COLORS = ["#22e6a0", "#ffb020", "#ff4d5e", "#38bdf8", "#a78bfa", "#ffffff"];

/** Dependency-free canvas confetti. Fires a burst whenever `fire` changes. */
export function Confetti({ fire }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const piecesRef = useRef<Piece[]>([]);

  useEffect(() => {
    if (fire <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    // Spawn from two lower corners + center for a stage-cannon feel.
    const origins = [
      { x: W * 0.5, y: H * 0.5 },
      { x: 0, y: H },
      { x: W, y: H },
    ];
    const pieces: Piece[] = [];
    origins.forEach((o, oi) => {
      const count = oi === 0 ? 120 : 80;
      for (let i = 0; i < count; i++) {
        const angle =
          oi === 0
            ? Math.random() * Math.PI * 2
            : (oi === 1 ? -Math.PI / 4 : (-3 * Math.PI) / 4) +
              (Math.random() - 0.5) * 0.9;
        const speed = 6 + Math.random() * 9;
        pieces.push({
          x: o.x,
          y: o.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (oi === 0 ? 2 : 4),
          size: 5 + Math.random() * 7,
          rot: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 0.3,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    });
    piecesRef.current = pieces;

    let frames = 0;
    const render = () => {
      frames++;
      ctx.clearRect(0, 0, W, H);
      const alive = piecesRef.current.filter((p) => p.y < H + 40);
      alive.forEach((p) => {
        p.vy += 0.22; // gravity
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - frames / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      piecesRef.current = alive;
      if (alive.length > 0 && frames < 200) {
        rafRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    };
    render();

    return () => cancelAnimationFrame(rafRef.current);
  }, [fire]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
