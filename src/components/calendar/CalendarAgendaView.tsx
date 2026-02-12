import { useMemo } from "react";
import { format, isToday, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Play, Palmtree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types/database";
import type { DaySummary } from "@/hooks/useCalendarData";

interface AgendaViewProps {
  tasks: (Task & { subjects?: { color: string; name: string } | null })[];
  summaries: Record<string, DaySummary>;
  onMarkDone: (taskId: string) => void;
  onStartTimer: (taskId: string) => void;
  onSelectDate: (date: Date) => void;
  onTaskClick: (taskId: string) => void;
  onPostpone: (taskId: string, newDate: string) => void;
}

export function CalendarAgendaView({
  tasks,
  summaries,
  onMarkDone,
  onStartTimer,
  onSelectDate,
  onTaskClick,
  onPostpone,
}: AgendaViewProps) {
  const grouped = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    for (const task of tasks) {
      if (!task.scheduled_date) continue;
      if (!map[task.scheduled_date]) map[task.scheduled_date] = [];
      map[task.scheduled_date].push(task);
    }
    // Sort keys ascending
    const sorted = Object.keys(map).sort();
    return sorted.map((date) => ({ date, tasks: map[date] }));
  }, [tasks]);

  if (grouped.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">No tasks in this period</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {grouped.map(({ date, tasks: dayTasks }) => {
        const d = new Date(date + "T00:00:00");
        const today = isToday(d);
        const past = isBefore(d, startOfDay(new Date())) && !today;
        const summary = summaries[date];

        return (
          <div
            key={date}
            className={cn(
              "rounded-lg border bg-card overflow-hidden",
              summary?.isHoliday && "border-info/50"
            )}
          >
            {/* Date header */}
            <button
              onClick={() => onSelectDate(d)}
              className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-semibold text-sm",
                    today && "text-primary",
                    past && "text-muted-foreground"
                  )}
                >
                  {format(d, "EEE, MMM d")}
                </span>
                {today && <Badge variant="default" className="text-[10px] h-5 bg-primary">Today</Badge>}
                {summary?.isHoliday && (
                  <span className="flex items-center gap-1 text-[10px] text-info">
                    <Palmtree className="h-3 w-3" />
                    Holiday
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {summary?.doneTasks ?? 0}/{dayTasks.length} done
                {summary && summary.timeStudiedMinutes > 0 && ` · ${summary.timeStudiedMinutes}m`}
              </span>
            </button>

            {/* Tasks */}
            <div className="divide-y">
              {dayTasks.map((task) => {
                const isDone = task.status === "done";
                return (
                  <div
                    key={task.task_id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors",
                      isDone && "opacity-60"
                    )}
                    onClick={() => onTaskClick(task.task_id)}
                  >
                    <div
                      className="w-1 self-stretch rounded-full shrink-0"
                      style={{ backgroundColor: task.subjects?.color ?? "hsl(var(--primary))" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium truncate", isDone && "line-through")}>
                        {task.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground capitalize">{task.task_type}</span>
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
                    <div className="flex items-center gap-0.5 shrink-0">
                      {!isDone && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartTimer(task.task_id);
                            }}
                          >
                            <Play className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-success hover:text-success"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkDone(task.task_id);
                            }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      {isDone && <CheckCircle2 className="h-4 w-4 text-success" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
