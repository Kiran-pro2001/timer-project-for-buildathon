"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, Rocket, Type, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NewLaunch } from "@/types/launch";
import { useEventTitle } from "@/hooks/useEventTitle";
import { useLaunchEnd } from "@/hooks/useLaunchEnd";
import { DURATION_PRESETS_HOURS } from "@/lib/config";
import { pad } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (launch: NewLaunch) => Promise<unknown> | void;
}

const empty = { builder: "", product: "", url: "" };

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function AdminPanel({ open, onClose, onSubmit }: Props) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const { time, label, setTime } = useLaunchEnd();
  const { title, setTitle } = useEventTitle();
  const [titleDraft, setTitleDraft] = useState(title);

  useEffect(() => {
    if (open) setTitleDraft(title);
  }, [open, title]);

  const onTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(":").map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) setTime(h, m);
  };

  const setDurationHours = (hours: number) => {
    const end = new Date(Date.now() + hours * 60 * 60 * 1000);
    setTime(end.getHours(), end.getMinutes());
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => firstFieldRef.current?.focus(), 120);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  const update = (key: keyof typeof empty) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.builder.trim() || !form.product.trim()) {
      setError("Builder and product names are required.");
      return;
    }
    const url = normalizeUrl(form.url);
    try {
      new URL(url);
    } catch {
      setError("Enter a valid launch URL.");
      return;
    }

    await onSubmit({ builder: form.builder, product: form.product, url });
    setForm(empty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    firstFieldRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Build Hour admin"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[var(--border)] bg-[#0c0c0f]/95 p-7 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
                  <Clock size={18} className="text-accent" />
                  Admin Panel
                </div>
                <p className="mt-1 text-sm text-muted">
                  Name the event, set the timer, and ship to the live feed.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-foreground"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Event title */}
            <div className="mb-5 rounded-2xl border border-[var(--border)] bg-white/[0.02] p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted">
                <Type size={15} className="text-accent" />
                Event name
              </div>
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={() => setTitle(titleDraft)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setTitle(titleDraft);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder="Build Hour"
                className="admin-input"
              />
              <p className="mt-2 text-xs text-muted">
                Shown on the hero and footer. Use any name for any event.
              </p>
            </div>

            {/* Timer editor */}
            <div className="mb-5 rounded-2xl border border-[var(--border)] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted">
                  <Clock size={15} className="text-accent" />
                  End time
                </div>
                <input
                  type="time"
                  value={`${pad(time.hour)}:${pad(time.minute)}`}
                  onChange={onTimeChange}
                  className="admin-input !w-auto !py-1.5 !text-base"
                  style={{ colorScheme: "dark" }}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {DURATION_PRESETS_HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDurationHours(h)}
                    className="rounded-lg border border-[var(--border)] bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-foreground"
                  >
                    {h}h from now
                  </button>
                ))}
              </div>

              <p className="mt-2 text-xs text-muted">
                Countdown runs to{" "}
                <span className="font-semibold text-accent">{label}</span>{" "}
                today. Pick an end clock time or a duration. Changes apply
                instantly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Builder Name">
                <input
                  ref={firstFieldRef}
                  value={form.builder}
                  onChange={update("builder")}
                  placeholder="Harkirat"
                  className="admin-input"
                />
              </Field>
              <Field label="Product">
                <input
                  value={form.product}
                  onChange={update("product")}
                  placeholder="My product"
                  className="admin-input"
                />
              </Field>
              <Field label="Launch URL">
                <input
                  value={form.url}
                  onChange={update("url")}
                  placeholder="example.com"
                  className="admin-input"
                />
              </Field>

              {error && (
                <p className="text-sm text-[#ff6b78]">{error}</p>
              )}

              <button
                type="submit"
                className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-base font-semibold text-black transition-transform active:scale-[0.98]"
              >
                <Rocket size={17} />
                {justAdded ? "Launched! Add another" : "Submit Launch"}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-muted">
              Press{" "}
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">
                Esc
              </kbd>{" "}
              to close
            </p>
          </motion.div>

          <style jsx global>{`
            .admin-input {
              width: 100%;
              border-radius: 0.75rem;
              border: 1px solid var(--border);
              background: rgba(255, 255, 255, 0.03);
              padding: 0.7rem 0.9rem;
              font-size: 0.95rem;
              color: var(--foreground);
              outline: none;
              transition: border-color 0.15s, box-shadow 0.15s;
            }
            .admin-input::placeholder {
              color: rgba(255, 255, 255, 0.28);
            }
            .admin-input:focus {
              border-color: var(--accent);
              box-shadow: 0 0 0 3px var(--accent-soft);
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
