import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimerMode = "focus" | "break";
export type TimerStatus = "idle" | "running" | "paused";

export interface PomodoroConfig {
  focusDuration: number; // minutes (5–120)
  shortBreak: number; // minutes (1–30)
  longBreak: number; // minutes (5–60)
  cyclesBeforeLongBreak: number; // (1–10)
  autoStartBreak: boolean;
  autoStartFocus: boolean;
}

export interface TimerState {
  // Core state
  status: TimerStatus;
  taskId: string | null;
  taskName: string | null;
  startTime: number | null; // epoch ms
  pausedAt: number | null;
  totalPausedMs: number;
  mode: TimerMode;

  // Pomodoro
  isPomodoroMode: boolean;
  pomodoroConfig: PomodoroConfig;
  currentCycle: number;
  pomodoroTargetSeconds: number | null;

  // UI
  isFullscreen: boolean;
  isMinimized: boolean;

  // Actions
  startTimer: (taskId: string, taskName: string, pomodoro?: boolean) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => { taskId: string; startTime: number; endTime: number; durationSeconds: number; mode: TimerMode; isPomodoroMode: boolean; cycle: number; pausedDurationSeconds: number } | null;
  resetTimer: () => void;
  setFullscreen: (v: boolean) => void;
  setMinimized: (v: boolean) => void;
  setPomodoroConfig: (config: Partial<PomodoroConfig>) => void;
  advancePomodoroPhase: () => void;
  getElapsedSeconds: () => number;
}

const DEFAULT_POMODORO: PomodoroConfig = {
  focusDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreak: false,
  autoStartFocus: false,
};

const MAX_TIMER_SECONDS = 12 * 60 * 60; // 12 hours
const MIN_SESSION_SECONDS = 60;

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      status: "idle",
      taskId: null,
      taskName: null,
      startTime: null,
      pausedAt: null,
      totalPausedMs: 0,
      mode: "focus",
      isPomodoroMode: false,
      pomodoroConfig: DEFAULT_POMODORO,
      currentCycle: 1,
      pomodoroTargetSeconds: null,
      isFullscreen: false,
      isMinimized: false,

      startTimer: (taskId, taskName, pomodoro = false) => {
        const state = get();
        // If another timer is running, stop it first (single active timer enforced)
        if (state.status !== "idle") {
          // silently discard (caller should handle saving if needed)
        }
        const config = state.pomodoroConfig;
        set({
          status: "running",
          taskId,
          taskName,
          startTime: Date.now(),
          pausedAt: null,
          totalPausedMs: 0,
          mode: "focus",
          isPomodoroMode: pomodoro,
          currentCycle: 1,
          pomodoroTargetSeconds: pomodoro ? config.focusDuration * 60 : null,
          isMinimized: false,
          isFullscreen: true,
        });
      },

      pauseTimer: () => {
        if (get().status !== "running") return;
        set({ status: "paused", pausedAt: Date.now() });
      },

      resumeTimer: () => {
        const state = get();
        if (state.status !== "paused" || !state.pausedAt) return;
        const additionalPaused = Date.now() - state.pausedAt;
        set({
          status: "running",
          pausedAt: null,
          totalPausedMs: state.totalPausedMs + additionalPaused,
        });
      },

      stopTimer: () => {
        const state = get();
        if (!state.startTime || !state.taskId) return null;

        const endTime = Date.now();
        let totalPausedMs = state.totalPausedMs;
        if (state.pausedAt) {
          totalPausedMs += endTime - state.pausedAt;
        }
        const durationMs = endTime - state.startTime - totalPausedMs;
        const durationSeconds = Math.max(0, Math.floor(durationMs / 1000));

        const result = {
          taskId: state.taskId,
          startTime: state.startTime,
          endTime,
          durationSeconds,
          mode: state.mode,
          isPomodoroMode: state.isPomodoroMode,
          cycle: state.currentCycle,
          pausedDurationSeconds: Math.floor(totalPausedMs / 1000),
        };

        // Reset state
        set({
          status: "idle",
          taskId: null,
          taskName: null,
          startTime: null,
          pausedAt: null,
          totalPausedMs: 0,
          mode: "focus",
          currentCycle: 1,
          pomodoroTargetSeconds: null,
          isFullscreen: false,
          isMinimized: false,
        });

        // Discard sessions under 60 seconds
        if (durationSeconds < MIN_SESSION_SECONDS) return null;

        return result;
      },

      resetTimer: () => {
        set({
          status: "idle",
          taskId: null,
          taskName: null,
          startTime: null,
          pausedAt: null,
          totalPausedMs: 0,
          mode: "focus",
          isPomodoroMode: false,
          currentCycle: 1,
          pomodoroTargetSeconds: null,
          isFullscreen: false,
          isMinimized: false,
        });
      },

      setFullscreen: (v) => set({ isFullscreen: v, isMinimized: !v && get().status !== "idle" }),
      setMinimized: (v) => set({ isMinimized: v, isFullscreen: false }),

      setPomodoroConfig: (config) =>
        set((s) => ({
          pomodoroConfig: { ...s.pomodoroConfig, ...config },
        })),

      advancePomodoroPhase: () => {
        const state = get();
        const config = state.pomodoroConfig;
        if (state.mode === "focus") {
          // Move to break
          const isLongBreak = state.currentCycle >= config.cyclesBeforeLongBreak;
          const breakDuration = isLongBreak ? config.longBreak : config.shortBreak;
          set({
            mode: "break",
            startTime: Date.now(),
            pausedAt: null,
            totalPausedMs: 0,
            pomodoroTargetSeconds: breakDuration * 60,
            status: config.autoStartBreak ? "running" : "paused",
          });
        } else {
          // Move to next focus
          const wasLongBreak = state.currentCycle >= config.cyclesBeforeLongBreak;
          const nextCycle = wasLongBreak ? 1 : state.currentCycle + 1;
          set({
            mode: "focus",
            currentCycle: nextCycle,
            startTime: Date.now(),
            pausedAt: null,
            totalPausedMs: 0,
            pomodoroTargetSeconds: config.focusDuration * 60,
            status: config.autoStartFocus ? "running" : "paused",
          });
        }
      },

      getElapsedSeconds: () => {
        const state = get();
        if (!state.startTime) return 0;
        const now = state.pausedAt ?? Date.now();
        const elapsed = now - state.startTime - state.totalPausedMs;
        const seconds = Math.max(0, Math.floor(elapsed / 1000));
        return Math.min(seconds, MAX_TIMER_SECONDS);
      },
    }),
    {
      name: "studytracker-timer",
      partialize: (state) => ({
        status: state.status,
        taskId: state.taskId,
        taskName: state.taskName,
        startTime: state.startTime,
        pausedAt: state.pausedAt,
        totalPausedMs: state.totalPausedMs,
        mode: state.mode,
        isPomodoroMode: state.isPomodoroMode,
        pomodoroConfig: state.pomodoroConfig,
        currentCycle: state.currentCycle,
        pomodoroTargetSeconds: state.pomodoroTargetSeconds,
        isMinimized: state.isMinimized,
      }),
    }
  )
);
