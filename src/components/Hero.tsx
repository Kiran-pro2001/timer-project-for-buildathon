"use client";

import { motion } from "framer-motion";
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
  const { title } = useEventTitle();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="text-center"
    >
      <motion.h1
        variants={item}
        className="text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl xl:text-9xl"
      >
        <span className="inline-block">⏱</span>{" "}
        <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          {title}
        </span>
      </motion.h1>

      <motion.p
        variants={item}
        className="mx-auto mt-6 max-w-2xl text-xl font-medium leading-relaxed text-muted sm:text-2xl lg:text-3xl"
      >
        {BRANDING.tagline}
      </motion.p>
    </motion.div>
  );
}
