import { useTimerStore } from "@/stores/timerStore";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTimerSessions } from "@/hooks/useTimerSessions";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function FloatingTimer() {
  const { status, taskName, isMinimized, setFullscreen, stopTimer, taskId } =
    useTimerStore();
  const { saveSession } = useTimerSessions();
  const navigate = useNavigate();

  if (status === "idle" || !isMinimized) return null;

  const handleStop = () => {
    const result = stopTimer();
    if (result) {
      saveSession.mutate(result, {
        onSuccess: () => toast({ title: "Session saved!" }),
        onError: () => toast({ title: "Failed to save session", variant: "destructive" }),
      });
    } else {
      toast({ title: "Session too short (< 60s), discarded." });
    }
  };

  const handleExpand = () => {
    setFullscreen(true);
    navigate("/timer");
  };

  return (
    <div
      className={cn(
        "fixed bottom-20 right-4 md:bottom-6 md:right-6 z-floating-timer",
        "flex items-center gap-3 rounded-xl border bg-card p-3 shadow-lg",
        "animate-in slide-in-from-bottom-2 fade-in"
      )}
    >
      <button
        onClick={handleExpand}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0"
      >
        <TimerDisplay size="sm" />
        {taskName && (
          <span className="text-xs text-muted-foreground truncate max-w-[100px] hidden sm:inline">
            {taskName}
          </span>
        )}
      </button>
      <div className="flex items-center gap-1">
        <TimerControls onStop={handleStop} size="sm" />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={handleExpand}
          aria-label="Expand timer"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
