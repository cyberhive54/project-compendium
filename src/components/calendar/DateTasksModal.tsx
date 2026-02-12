import { format, isToday, isBefore, startOfDay } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Clock, Play, Plus, CalendarClock, Palmtree } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/database";
import type { DaySummary } from "@/hooks/useCalendarData";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface DateTasksModalProps {
  date: Date | null;
  tasks: (Task & { subjects?: { color: string; name: string } | null })[];
  summary: DaySummary | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkDone: (taskId: string) => void;
  onPostpone: (taskId: string, newDate: string) => void;
  onStartTimer: (taskId: string) => void;
  onAddTask: () => void;
  hideAddButton?: boolean;
}

const statusGroups: Array<{ key: string; label: string; statuses: string[] }> = [
  { key: "pending", label: "Pending", statuses: ["scheduled", "pending", "in_progress"] },
  { key: "done", label: "Completed", statuses: ["done"] },
  { key: "postponed", label: "Postponed", statuses: ["postponed"] },
];

export function DateTasksModal({
  date,
  tasks,
  summary,
  open,
  onOpenChange,
  onMarkDone,
  onPostpone,
  onStartTimer,
  onAddTask,
  hideAddButton,
}: DateTasksModalProps) {
  const [postponeTaskId, setPostponeTaskId] = useState<string | null>(null);

  if (!date) return null;

  const isDateToday = isToday(date);
  const dayTasks = tasks.filter(
    (t) => t.scheduled_date === format(date, "yyyy-MM-dd")
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {format(date, "EEEE, MMMM d, yyyy")}
            {isDateToday && (
              <Badge variant="default" className="bg-primary text-[10px]">Today</Badge>
            )}
            {summary?.isHoliday && (
              <span className="flex items-center gap-1 text-xs text-info font-normal">
                <Palmtree className="h-3.5 w-3.5" />
                Holiday
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Stats row */}
        {summary && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{summary.taskCount} tasks</span>
            <span>{summary.doneTasks} done</span>
            {summary.timeStudiedMinutes > 0 && (
              <span>{summary.timeStudiedMinutes}m studied</span>
            )}
          </div>
        )}

        {/* Task groups */}
        {dayTasks.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No tasks for this day</p>
          </div>
        ) : (
          <div className="space-y-4">
            {statusGroups.map(({ key, label, statuses }) => {
              const groupTasks = dayTasks.filter((t) =>
                statuses.includes(t.status)
              );
              if (groupTasks.length === 0) return null;

              return (
                <div key={key}>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    {label} ({groupTasks.length})
                  </h4>
                  <div className="space-y-1.5">
                    {groupTasks.map((task) => {
                      const isDone = task.status === "done";

                      return (
                        <div
                          key={task.task_id}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border p-2.5 transition-colors",
                            isDone && "bg-muted/50 opacity-60"
                          )}
                        >
                          <div
                            className="w-1 self-stretch rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                task.subjects?.color ?? "hsl(var(--primary))",
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm font-medium truncate",
                                isDone && "line-through"
                              )}
                            >
                              {task.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted-foreground capitalize">
                                {task.task_type}
                              </span>
                              {task.subjects?.name && (
                                <span className="text-[10px] text-muted-foreground">
                                  · {task.subjects.name}
                                </span>
                              )}
                              {task.estimated_duration && (
                                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                  <Clock className="h-2.5 w-2.5" />
                                  {task.estimated_duration}m
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            {!isDone && task.status !== "postponed" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => onStartTimer(task.task_id)}
                                  title="Start Timer"
                                >
                                  <Play className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-success hover:text-success"
                                  onClick={() => onMarkDone(task.task_id)}
                                  title="Mark Done"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </Button>
                                <Popover
                                  open={postponeTaskId === task.task_id}
                                  onOpenChange={(o) =>
                                    setPostponeTaskId(o ? task.task_id : null)
                                  }
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      title="Postpone"
                                    >
                                      <CalendarClock className="h-3.5 w-3.5" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                      mode="single"
                                      selected={undefined}
                                      onSelect={(d) => {
                                        if (d) {
                                          onPostpone(
                                            task.task_id,
                                            format(d, "yyyy-MM-dd")
                                          );
                                          setPostponeTaskId(null);
                                        }
                                      }}
                                      disabled={(d) =>
                                        isBefore(d, startOfDay(new Date()))
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </>
                            )}
                            {isDone && (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add task CTA */}
        {!hideAddButton && (
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task for {format(date, "MMM d")}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
