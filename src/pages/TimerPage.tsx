import { useState, useEffect } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { useTimerSessions } from "@/hooks/useTimerSessions";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { PomodoroIndicator } from "@/components/timer/PomodoroIndicator";
import { PomodoroSettings } from "@/components/timer/PomodoroSettings";
import { TaskSelectDialog } from "@/components/timer/TaskSelectDialog";
import { TimerSessionHistory } from "@/components/timer/TimerSessionHistory";
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
    const state = location.state as { taskId?: string; taskName?: string } | null;
    if (state?.taskId && status === "idle") {
      // Look up the task name if not provided
      if (state.taskName) {
        startTimer(state.taskId, state.taskName, false);
      } else {
        // Fetch task name from database
        supabase
          .from("tasks")
          .select("name")
          .eq("task_id", state.taskId)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              startTimer(state.taskId!, data.name, false);
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

  // When navigating to timer page while timer is running, show fullscreen
  useEffect(() => {
    if (status !== "idle") {
      setFullscreen(true);
    }
  }, []);

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

  // ── Fullscreen Focus Mode ──
  if (status !== "idle" && isFullscreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-8">
        {/* Task Info */}
        <div className="flex items-center gap-2 text-center">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-lg font-medium">{taskName}</span>
          {isPomodoroMode && (
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" /> Pomodoro
            </Badge>
          )}
        </div>

        {/* Timer */}
        <TimerDisplay size="lg" />

        {/* Pomodoro Indicator */}
        <PomodoroIndicator />

        {/* Controls */}
        <TimerControls onStop={handleStop} size="lg" />

        {/* Minimize button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMinimize}
          className="gap-1.5 text-muted-foreground"
        >
          <Minimize2 className="h-4 w-4" />
          Minimize
        </Button>

        {/* Session History */}
        {taskId && (
          <Card className="w-full max-w-md">
            <CardContent className="pt-4">
              <TimerSessionHistory taskId={taskId} />
            </CardContent>
          </Card>
        )}
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
    </div>
  );
}
