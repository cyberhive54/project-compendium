import { Pause, Play, Square, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/stores/timerStore";

interface TimerControlsProps {
  onStop: () => void;
  size?: "sm" | "lg";
}

export function TimerControls({ onStop, size = "lg" }: TimerControlsProps) {
  const { status, pauseTimer, resumeTimer, isPomodoroMode, advancePomodoroPhase } =
    useTimerStore();

  const iconSize = size === "lg" ? "h-8 w-8" : "h-4 w-4";
  const btnSize = size === "lg" ? "h-16 w-16" : "h-9 w-9";

  return (
    <div className="flex items-center gap-3">
      {status === "running" ? (
        <Button
          variant="outline"
          size="icon"
          className={btnSize}
          onClick={pauseTimer}
          aria-label="Pause timer"
        >
          <Pause className={iconSize} />
        </Button>
      ) : status === "paused" ? (
        <Button
          variant="outline"
          size="icon"
          className={btnSize}
          onClick={resumeTimer}
          aria-label="Resume timer"
        >
          <Play className={iconSize} />
        </Button>
      ) : null}

      <Button
        variant="destructive"
        size="icon"
        className={btnSize}
        onClick={onStop}
        aria-label="Stop timer"
      >
        <Square className={iconSize} />
      </Button>

      {isPomodoroMode && (
        <Button
          variant="secondary"
          size="icon"
          className={btnSize}
          onClick={advancePomodoroPhase}
          aria-label="Skip to next phase"
        >
          <SkipForward className={iconSize} />
        </Button>
      )}
    </div>
  );
}
