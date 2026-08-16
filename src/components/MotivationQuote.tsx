"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { MOTIVATION_QUOTES, QUOTE_ROTATION_MS } from "@/lib/config";

export function MotivationQuote() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % MOTIVATION_QUOTES.length),
      QUOTE_ROTATION_MS,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-[3.5rem] items-center justify-center gap-3 text-center">
      <Quote size={20} className="shrink-0 text-accent/70" />
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-xl font-semibold tracking-tight sm:text-2xl"
        >
          {MOTIVATION_QUOTES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
