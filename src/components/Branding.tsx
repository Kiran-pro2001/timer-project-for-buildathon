"use client";

import { useEventTitle } from "@/hooks/useEventTitle";

export function BrandingBottom() {
  const { title } = useEventTitle();

  return (
    <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-muted sm:text-sm">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
      {title}
    </div>
  );
}
