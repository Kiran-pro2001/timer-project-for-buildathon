"use client";

import { motion } from "framer-motion";
import { Pencil, Check } from "lucide-react";
import { useState } from "react";
import { BRANDING } from "@/lib/config";
import { useEventTitle } from "@/hooks/useEventTitle";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  const { title, setTitle } = useEventTitle();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  const saveTitle = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      setTitle(trimmed);
    } else {
      setDraft(title);
    }
    setEditing(false);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="text-center"
    >
      <motion.div variants={item} className="inline-flex items-center gap-3">
        {editing ? (
          <div className="flex items-center gap-2">
            <span className="text-4xl sm:text-6xl lg:text-7xl">⏱</span>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitle();
                if (e.key === "Escape") {
                  setDraft(title);
                  setEditing(false);
                }
              }}
              autoFocus
              className="rounded-2xl border border-accent bg-black/40 px-4 py-2 text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground outline-none shadow-xl text-center"
            />
            <button
              type="button"
              onClick={saveTitle}
              className="rounded-xl bg-accent p-3 text-black hover:bg-accent/90 transition-transform active:scale-95"
              aria-label="Save title"
            >
              <Check size={24} />
            </button>
          </div>
        ) : (
          <h1
            onClick={() => {
              setDraft(title);
              setEditing(true);
            }}
            title="Click to edit event title"
            className="group cursor-pointer text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl xl:text-9xl inline-flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <span className="inline-block">⏱</span>{" "}
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              {title}
            </span>
            <Pencil
              size={24}
              className="text-muted/40 transition-colors group-hover:text-accent"
            />
          </h1>
        )}
      </motion.div>

      <motion.p
        variants={item}
        className="mx-auto mt-6 max-w-2xl text-xl font-medium leading-relaxed text-muted sm:text-2xl lg:text-3xl"
      >
        {BRANDING.tagline}
      </motion.p>
    </motion.div>
  );
}
