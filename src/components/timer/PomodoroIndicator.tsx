import { useTimerStore } from "@/stores/timerStore";
import { cn } from "@/lib/utils";

export function PomodoroIndicator() {
  const { isPomodoroMode, currentCycle, pomodoroConfig, mode } = useTimerStore();

  if (!isPomodoroMode) return null;

  const total = pomodoroConfig.cyclesBeforeLongBreak;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        Cycle {currentCycle} of {total}
      </span>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              i < currentCycle - 1
                ? "bg-primary"
                : i === currentCycle - 1
                  ? mode === "focus"
                    ? "bg-primary animate-pulse"
                    : "bg-success animate-pulse"
                  : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}
