"use client";

import { animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  className?: string;
}

/**
 * Counts up to `value` on mount, and re-animates smoothly from the previous
 * value whenever it changes (e.g. when a new launch lands). No scroll gating —
 * on a projected dashboard the numbers should animate as soon as they render.
 */
export function AnimatedCounter({ value, className }: Props) {
  const [display, setDisplay] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const controls = animate(from.current, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    from.current = value;
    return () => controls.stop();
  }, [value]);

  return <span className={`tnum ${className ?? ""}`}>{display}</span>;
}
