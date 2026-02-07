import { useEffect, useState } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  size?: "sm" | "lg";
  className?: string;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TimerDisplay({ size = "lg", className }: TimerDisplayProps) {
  const { status, getElapsedSeconds, isPomodoroMode, pomodoroTargetSeconds, mode } =
    useTimerStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (status === "idle") {
      setElapsed(0);
      return;
    }
    const tick = () => setElapsed(getElapsedSeconds());
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [status, getElapsedSeconds]);

  // For pomodoro, show countdown
  const display = isPomodoroMode && pomodoroTargetSeconds
    ? Math.max(0, pomodoroTargetSeconds - elapsed)
    : elapsed;

  const isOvertime = isPomodoroMode && pomodoroTargetSeconds && elapsed >= pomodoroTargetSeconds;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <span
        className={cn(
          "font-mono tabular-nums tracking-wider",
          size === "lg" ? "text-7xl md:text-8xl" : "text-lg",
          isOvertime && "text-destructive animate-pulse"
        )}
      >
        {formatTime(display)}
      </span>
      {isPomodoroMode && (
        <span className={cn(
          "text-xs uppercase font-semibold tracking-widest",
          mode === "focus" ? "text-primary" : "text-success"
        )}>
          {mode === "focus" ? "Focus" : "Break"}
        </span>
      )}
    </div>
  );
}

export { formatTime };
