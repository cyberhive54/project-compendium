import { format } from "date-fns";
import { BookOpen, CheckCircle2, Clock, Play, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTodayTasks } from "@/hooks/useDashboardStats";
import { useTasks } from "@/hooks/useTasks";
import { useNavigate } from "react-router-dom";
import type { Task } from "@/types/database";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  scheduled: { label: "Scheduled", variant: "outline" },
  pending: { label: "Pending", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "default" },
  done: { label: "Done", variant: "default" },
  postponed: { label: "Postponed", variant: "destructive" },
};

export function TodaysTasks() {
  const { data: tasks, isLoading } = useTodayTasks();
  const { markDone } = useTasks();
  const navigate = useNavigate();

  const handleMarkDone = (taskId: string) => {
    markDone.mutate(taskId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!tasks?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No tasks scheduled for today</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Head to Goals to create and schedule tasks
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => navigate("/goals")}
            >
              Go to Goals
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const doneTasks = tasks.filter((t: Task) => t.status === "done");
  const pendingTasks = tasks.filter((t: Task) => t.status !== "done");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          Today's Tasks
          <span className="text-sm font-normal text-muted-foreground ml-2">
            {doneTasks.length}/{tasks.length} done
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Pending tasks first */}
          {pendingTasks.map((task: Task) => (
            <TaskRow
              key={task.task_id}
              task={task}
              onMarkDone={handleMarkDone}
              onStartTimer={() => navigate("/timer")}
            />
          ))}
          {/* Done tasks with muted styling */}
          {doneTasks.map((task: Task) => (
            <TaskRow key={task.task_id} task={task} onMarkDone={handleMarkDone} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TaskRow({
  task,
  onMarkDone,
  onStartTimer,
}: {
  task: Task;
  onMarkDone: (id: string) => void;
  onStartTimer?: () => void;
}) {
  const isDone = task.status === "done";
  const config = statusConfig[task.status] ?? statusConfig.pending;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
        isDone ? "bg-muted/50 opacity-60" : "hover:bg-accent/50"
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isDone ? "line-through" : ""}`}>
          {task.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={config.variant} className="text-xs">
            {config.label}
          </Badge>
          {task.estimated_duration && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.estimated_duration}m
            </span>
          )}
          <span className="text-xs text-muted-foreground capitalize">{task.task_type}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!isDone && (
          <>
            {onStartTimer && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onStartTimer}>
                <Play className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-success hover:text-success"
              onClick={() => onMarkDone(task.task_id)}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </>
        )}
        {isDone && <CheckCircle2 className="h-4 w-4 text-success" />}
      </div>
    </div>
  );
}
