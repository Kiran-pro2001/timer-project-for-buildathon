"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Coffee,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLaunchEnd } from "@/hooks/useLaunchEnd";
import { useTimerStatus } from "@/hooks/useTimerStatus";
import { cn } from "@/lib/utils";

interface FocusTask {
  id: string;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = "lh:focus-tasks";

export function PomodoroTaskPanel() {
  const { setTime } = useLaunchEnd();
  const { startTimer } = useTimerStatus();

  const [activeMode, setActiveMode] = useState<string>("custom");
  const [minimized, setMinimized] = useState(false);
  const [tasks, setTasks] = useState<FocusTask[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setTasks(parsed);
      } else {
        setTasks([
          { id: "task-1", text: "Set up project repository & timer", completed: true },
          { id: "task-2", text: "Implement core features & UI components", completed: false },
          { id: "task-3", text: "Final testing & ship to live feed", completed: false },
        ]);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const saveTasks = (updated: FocusTask[]) => {
    setTasks(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
    }
  };

  const handleSetMode = (mode: string, durationMinutes: number) => {
    setActiveMode(mode);
    const end = new Date(Date.now() + durationMinutes * 60 * 1000);
    setTime(end.getHours(), end.getMinutes());
    startTimer();
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskText.trim();
    if (!trimmed) return;
    const newTask: FocusTask = {
      id: `task-${Date.now()}`,
      text: trimmed,
      completed: false,
    };
    saveTasks([...tasks, newTask]);
    setNewTaskText("");
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  if (!mounted) return null;

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--card)] backdrop-blur-md shadow-xl transition-all overflow-hidden">
      {/* Panel Control Header */}
      <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent shrink-0">
            <Target size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Focus & Pomodoro Modes
            </h3>
            <p className="text-xs text-muted">
              {completedCount} of {tasks.length} tasks completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
            {completedCount}/{tasks.length} Done
          </span>
          <button
            type="button"
            onClick={() => setMinimized((m) => !m)}
            className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-white/5 px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
          >
            {minimized ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            <span>{minimized ? "Expand" : "Minimize"}</span>
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      <AnimatePresence initial={false}>
        {!minimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden p-6 space-y-6"
          >
            {/* Section 1: Mode Presets */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Select Timer Mode
                </span>
                <span className="text-xs text-muted">Click mode to start timer</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSetMode("pomo-25", 25)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-all",
                    activeMode === "pomo-25"
                      ? "border-accent bg-accent/15 text-accent shadow-md"
                      : "border-[var(--border)] bg-white/[0.02] hover:border-accent/40 hover:bg-white/[0.04] text-muted hover:text-foreground"
                  )}
                >
                  <Zap size={18} className="mb-1 text-amber-400" />
                  <span className="text-xs font-bold">25m Focus</span>
                  <span className="text-[10px] text-muted">Pomodoro Session</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetMode("break-5", 5)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-all",
                    activeMode === "break-5"
                      ? "border-accent bg-accent/15 text-accent shadow-md"
                      : "border-[var(--border)] bg-white/[0.02] hover:border-accent/40 hover:bg-white/[0.04] text-muted hover:text-foreground"
                  )}
                >
                  <Coffee size={18} className="mb-1 text-emerald-400" />
                  <span className="text-xs font-bold">5m Break</span>
                  <span className="text-[10px] text-muted">Short Reset</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetMode("sprint-30", 30)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-all",
                    activeMode === "sprint-30"
                      ? "border-accent bg-accent/15 text-accent shadow-md"
                      : "border-[var(--border)] bg-white/[0.02] hover:border-accent/40 hover:bg-white/[0.04] text-muted hover:text-foreground"
                  )}
                >
                  <Sparkles size={18} className="mb-1 text-sky-400" />
                  <span className="text-xs font-bold">30m Sprint</span>
                  <span className="text-[10px] text-muted">Quick Build</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetMode("hackathon-120", 120)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-all",
                    activeMode === "hackathon-120"
                      ? "border-accent bg-accent/15 text-accent shadow-md"
                      : "border-[var(--border)] bg-white/[0.02] hover:border-accent/40 hover:bg-white/[0.04] text-muted hover:text-foreground"
                  )}
                >
                  <Target size={18} className="mb-1 text-purple-400" />
                  <span className="text-xs font-bold">2h Hackathon</span>
                  <span className="text-[10px] text-muted">Deep Build</span>
                </button>
              </div>
            </div>

            {/* Section 2: Editable Focus Tasks Checklist */}
            <div className="pt-4 border-t border-[var(--border)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
                  <CheckCircle2 size={16} className="text-accent" />
                  Focus Tasks Checklist
                </div>
              </div>

              {/* Add Task Input */}
              <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="What are you focusing on right now?"
                  className="flex-1 rounded-xl border border-[var(--border)] bg-black/20 px-3.5 py-2 text-sm text-foreground placeholder:text-muted/60 outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black transition-transform active:scale-[0.98] hover:bg-accent/90"
                >
                  <Plus size={16} /> Add Task
                </button>
              </form>

              {/* Task List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={cn(
                        "group flex items-center justify-between rounded-xl border p-3 transition-all",
                        task.completed
                          ? "border-[var(--border)] bg-white/[0.01] opacity-60"
                          : "border-[var(--border)] bg-white/[0.03] hover:border-accent/40"
                      )}
                    >
                      <div
                        onClick={() => toggleTask(task.id)}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <button
                          type="button"
                          className="text-muted hover:text-accent transition-colors shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 size={18} className="text-accent" />
                          ) : (
                            <Circle size={18} />
                          )}
                        </button>
                        <span
                          className={cn(
                            "text-sm text-foreground truncate transition-all",
                            task.completed && "line-through text-muted"
                          )}
                        >
                          {task.text}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                        className="text-muted hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {tasks.length === 0 && (
                  <div className="py-6 text-center text-xs text-muted rounded-xl border border-dashed border-[var(--border)]">
                    No tasks added yet. Add a task above to focus on during your session!
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
