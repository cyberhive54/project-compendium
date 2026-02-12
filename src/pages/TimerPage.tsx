import { useState, useEffect } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { useTimerSessions } from "@/hooks/useTimerSessions";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { PomodoroIndicator } from "@/components/timer/PomodoroIndicator";
import { PomodoroSettings } from "@/components/timer/PomodoroSettings";
import { TaskSelectDialog } from "@/components/timer/TaskSelectDialog";
import { TimerSessionHistory } from "@/components/timer/TimerSessionHistory";
import { TimerHistorySection } from "@/components/timer/TimerHistorySection";
import { FullscreenTimerModal } from "@/components/timer/FullscreenTimerModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  Timer,
  Play,
  Minimize2,
  BookOpen,
  Zap,
  Maximize2,
} from "lucide-react";

export default function TimerPage() {
  const {
    status,
    taskId,
    taskName,
    isPomodoroMode,
    isFullscreen,
    setFullscreen,
    setMinimized,
    startTimer,
    stopTimer,
  } = useTimerStore();

  const { user } = useAuth();
  const { saveSession } = useTimerSessions(taskId ?? undefined);
  const [taskSelectOpen, setTaskSelectOpen] = useState(false);
  const location = useLocation();

  // Auto-start timer if navigated with taskId in state
  useEffect(() => {
    const state = location.state as { taskId?: string; taskName?: string; mode?: string } | null;
    if (state?.taskId && status === "idle") {
      const isPomodoro = state.mode === 'pomodoro';

      // Look up the task name if not provided
      if (state.taskName) {
        startTimer(state.taskId, state.taskName, isPomodoro);
      } else {
        // Fetch task name from database
        supabase
          .from("tasks")
          .select("name")
          .eq("task_id", state.taskId)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              startTimer(state.taskId!, data.name, isPomodoro);
            } else {
              toast({
                title: "Task not found",
                description: "The selected task could not be found. Please select a task manually.",
              });
              setTaskSelectOpen(true);
            }
          });
      }
      // Clear the location state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Don't auto-fullscreen when navigating to timer page
  // User can manually enter fullscreen with button

  // Auto-minimize when navigating AWAY from timer page
  useEffect(() => {
    return () => {
      const currentStatus = useTimerStore.getState().status;
      if (currentStatus !== "idle") {
        useTimerStore.getState().setMinimized(true);
      }
    };
  }, []);

  const handleStartTimer = (selectedTaskId: string, selectedTaskName: string, pomodoro: boolean) => {
    // If a timer is already running, stop and save it first
    if (status !== "idle") {
      const result = stopTimer();
      if (result) {
        saveSession.mutate(result);
      }
    }
    startTimer(selectedTaskId, selectedTaskName, pomodoro);
  };

  const handleStop = () => {
    const result = stopTimer();
    if (result) {
      saveSession.mutate(result, {
        onSuccess: () =>
          toast({
            title: "Session saved!",
            description: `Recorded ${Math.floor(result.durationSeconds / 60)} min ${result.durationSeconds % 60}s of study time.`,
          }),
        onError: () =>
          toast({ title: "Failed to save session", variant: "destructive" }),
      });
    } else {
      toast({ title: "Session too short (< 60s), discarded." });
    }
  };

  const handleMinimize = () => {
    setMinimized(true);
  };

  const handleFullscreen = () => {
    setFullscreen(true);
  };

  // ── Fullscreen Focus Mode ──
  if (status !== "idle" && isFullscreen) {
    return (
      <FullscreenTimerModal
        onStop={handleStop}
        onMinimize={handleMinimize}
      />
    );
  }

  // ── Active Timer (Running/Paused on Page) ──
  if (status !== "idle") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Study Timer</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleFullscreen}
              title="Fullscreen Focus Mode"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleMinimize}
              title="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-8">
              <TimerDisplay />
              {isPomodoroMode && <PomodoroIndicator />}
              <div className="flex flex-col items-center gap-2">
                <p className="text-lg font-medium">{taskName}</p>
                <Badge variant="outline" className="text-xs">
                  {isPomodoroMode ? "Pomodoro Mode" : "Focus Mode"}
                </Badge>
              </div>
              <TimerControls onStop={handleStop} />
            </div>
          </CardContent>
        </Card>

        <TimerSessionHistory taskId={taskId ?? undefined} />
      </div>
    );
  }

  // ── Idle State (Start Screen) ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Study Timer</h1>
        <PomodoroSettings />
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Ready to Study?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pb-8">
          <div className="rounded-full bg-primary/10 p-6">
            <Timer className="h-16 w-16 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Select a task and start the timer. Your study sessions are automatically
            saved and tracked.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              onClick={() => setTaskSelectOpen(true)}
              className="gap-2"
            >
              <Play className="h-5 w-5" />
              Start Focus Session
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>⏱ Sessions under 60 seconds are automatically discarded</p>
            <p>🌙 Sessions crossing midnight are auto-split by date</p>
            <p>⚡ Use Pomodoro mode for structured focus/break cycles</p>
          </div>
        </CardContent>
      </Card>

      <TaskSelectDialog
        open={taskSelectOpen}
        onOpenChange={setTaskSelectOpen}
        onSelect={handleStartTimer}
      />

      <div className="pt-8">
        <TimerHistorySection />
      </div>
    </div>
  );
}
