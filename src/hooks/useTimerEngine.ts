import { useEffect, useRef } from "react";
import { useTimerStore } from "@/stores/timerStore";

const MAX_TIMER_SECONDS = 12 * 60 * 60;

/**
 * Background engine that handles:
 * 1. Auto-pause after 12 hours
 * 2. Pomodoro phase completion detection
 * 3. Browser notification on Pomodoro phase end
 * 4. Resume prompt on mount (if timer was running when tab closed)
 */
export function useTimerEngine() {
  const {
    status,
    getElapsedSeconds,
    isPomodoroMode,
    pomodoroTargetSeconds,
    pauseTimer,
    advancePomodoroPhase,
    mode,
    taskName,
  } = useTimerStore();

  const notifiedPhaseRef = useRef(false);

  // Request notification permission once
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Engine tick
  useEffect(() => {
    if (status !== "running") return;

    const interval = setInterval(() => {
      const elapsed = getElapsedSeconds();

      // 12-hour auto-pause
      if (elapsed >= MAX_TIMER_SECONDS) {
        pauseTimer();
        sendNotification("Timer Auto-Paused", "You've been studying for 12 hours. Take a break!");
        return;
      }

      // Pomodoro phase completion
      if (isPomodoroMode && pomodoroTargetSeconds && elapsed >= pomodoroTargetSeconds) {
        if (!notifiedPhaseRef.current) {
          notifiedPhaseRef.current = true;
          const msg =
            mode === "focus"
              ? `Focus session complete! Time for a break.`
              : `Break is over! Ready to focus on "${taskName}"?`;
          sendNotification(mode === "focus" ? "Break Time!" : "Focus Time!", msg);
          advancePomodoroPhase();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    status,
    getElapsedSeconds,
    isPomodoroMode,
    pomodoroTargetSeconds,
    pauseTimer,
    advancePomodoroPhase,
    mode,
    taskName,
  ]);

  // Reset notification flag when phase changes
  useEffect(() => {
    notifiedPhaseRef.current = false;
  }, [mode]);
}

function sendNotification(title: string, body: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}
