"use client";

import { useEffect, useRef } from "react";

interface Props {
  /** Increment to launch a fireworks show. */
  fire: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  trail: [number, number][];
}

interface Shell {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
  exploded: boolean;
}

const PALETTE = [
  "#22e6a0",
  "#ffb020",
  "#ff4d5e",
  "#38bdf8",
  "#a78bfa",
  "#f472b6",
  "#ffffff",
];

/** Dependency-free canvas fireworks: rising shells that burst into sparks. */
export function Fireworks({ fire }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

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

    const sparks: Spark[] = [];
    const shells: Shell[] = [];

    // Launch a handful of shells at staggered times.
    const shellCount = 6;
    let launched = 0;
    const launchTimer = setInterval(() => {
      if (launched >= shellCount) {
        clearInterval(launchTimer);
        return;
      }
      launched++;
      const x = W * (0.15 + Math.random() * 0.7);
      shells.push({
        x,
        y: H,
        vy: -(9 + Math.random() * 3),
        targetY: H * (0.15 + Math.random() * 0.35),
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        exploded: false,
      });
    }, 220);

    function explode(shell: Shell) {
      const count = 46 + Math.floor(Math.random() * 24);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const speed = 2.5 + Math.random() * 4.5;
        const maxLife = 55 + Math.random() * 30;
        sparks.push({
          x: shell.x,
          y: shell.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: maxLife,
          maxLife,
          color: shell.color,
          trail: [],
        });
      }
    }

    let frame = 0;
    const maxFrames = 360;
    const render = () => {
      frame++;
      // Transparent clear each frame so the page underneath stays bright.
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      // Rising shells.
      for (const s of shells) {
        if (s.exploded) continue;
        s.y += s.vy;
        s.vy += 0.06;
        ctx.beginPath();
        ctx.fillStyle = s.color;
        ctx.globalAlpha = 1;
        ctx.arc(s.x, s.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        if (s.y <= s.targetY || s.vy >= 0) {
          s.exploded = true;
          explode(s);
        }
      }

      // Sparks with short glowing trails.
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.vy += 0.05; // gravity
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.trail.push([p.x, p.y]);
        if (p.trail.length > 6) p.trail.shift();
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        const alpha = Math.max(0, p.life / p.maxLife);

        if (p.trail.length > 1) {
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = alpha * 0.5;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.trail[0][0], p.trail[0][1]);
          for (const [tx, ty] of p.trail) ctx.lineTo(tx, ty);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.arc(p.x, p.y, 2.1, 0, Math.PI * 2);
        ctx.fill();
        if (p.life <= 0) sparks.splice(i, 1);
      }
      ctx.globalAlpha = 1;

      const busy = sparks.length > 0 || launched < shellCount || shells.some((s) => !s.exploded);
      if (busy && frame < maxFrames) {
        rafRef.current = requestAnimationFrame(render);
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, W, H);
      }
    };
    render();

    return () => {
      clearInterval(launchTimer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [fire]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
