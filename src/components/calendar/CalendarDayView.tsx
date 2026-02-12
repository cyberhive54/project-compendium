import { useRef, useEffect, useMemo } from "react";
import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Play, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types/database";
import type { StudySessionConfig } from "@/types/database";
import type { DaySummary } from "@/hooks/useCalendarData";

interface DayViewProps {
  currentDate: Date;
  tasks: (Task & { subjects?: { color: string; name: string } | null })[];
  summary: DaySummary | undefined;
  sessions: StudySessionConfig[];
  onMarkDone: (taskId: string) => void;
  onStartTimer: (taskId: string) => void;
  onPostpone?: (taskId: string) => void;
  /** If true, trim hours outside content range */
  compact?: boolean;
  /** Start-of-day hour from user settings (default 0) */
  startOfDayHour?: number;
}

function getHourForTask(task: Task): number {
  if (task.scheduled_time_slot) {
    const slots: Record<string, number> = {
      Morning: 8,
      Afternoon: 13,
      Evening: 17,
      Night: 21,
    };
    return slots[task.scheduled_time_slot] ?? 9;
  }
  return 9;
}

function parseTimeToHour(t: string): number {
  return parseInt(t.split(":")[0], 10);
}

export function CalendarDayView({
  currentDate,
  tasks,
  summary,
  sessions,
  onMarkDone,
  onStartTimer,
  onPostpone,
  compact = false,
  startOfDayHour = 0,
}: DayViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dayKey = format(currentDate, "yyyy-MM-dd");
  const today = isToday(currentDate);
  const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay();

  // Map tasks to their hour slots
  const tasksByHour: Record<number, typeof tasks> = {};
  for (const task of tasks) {
    const h = getHourForTask(task);
    if (!tasksByHour[h]) tasksByHour[h] = [];
    tasksByHour[h].push(task);
  }

  // Determine which hours have active sessions
  const sessionHours: Record<number, StudySessionConfig> = {};
  for (const session of sessions) {
    if (!session.days_of_week?.includes(dayOfWeek)) continue;
    const startH = parseTimeToHour(session.start_time);
    const endH = parseTimeToHour(session.end_time);
    if (session.is_overnight) {
      for (let h = startH; h < 24; h++) sessionHours[h] = session;
      for (let h = 0; h <= endH; h++) sessionHours[h] = session;
    } else {
      for (let h = startH; h < endH; h++) sessionHours[h] = session;
    }
  }

  // Compute visible hour range
  const visibleHours = useMemo(() => {
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    if (!compact) return allHours;

    // In compact mode, only show hours that have tasks (not full session ranges)
    let lastHour = startOfDayHour;
    for (const h of Object.keys(tasksByHour)) lastHour = Math.max(lastHour, Number(h));
    // Include current hour if today
    if (today) lastHour = Math.max(lastHour, new Date().getHours());

    const endHour = Math.min(23, lastHour + 1);
    return allHours.filter((h) => h >= startOfDayHour && h <= endHour);
  }, [compact, startOfDayHour, tasks, today]);

  // Auto-scroll to current hour on mount
  useEffect(() => {
    if (!scrollRef.current || !today) return;
    const currentHour = new Date().getHours();
    const hourIdx = visibleHours.indexOf(currentHour);
    if (hourIdx >= 0) {
      const rowHeight = 48;
      scrollRef.current.scrollTop = Math.max(0, hourIdx * rowHeight - 48);
    }
  }, [today, visibleHours]);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Day header */}
      <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </h3>
          {summary && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {summary.taskCount} tasks · {summary.timeStudiedMinutes}m studied
              {summary.isHoliday && " · 🌴 Holiday"}
            </p>
          )}
        </div>
        {today && (
          <Badge variant="default" className="bg-primary">Today</Badge>
        )}
      </div>

      {/* Hourly grid */}
      <div ref={scrollRef} className={cn("divide-y overflow-y-auto", compact ? "max-h-[400px]" : "max-h-[600px]")}>
        {visibleHours.map((hour) => {
          const hourTasks = tasksByHour[hour] ?? [];
          const session = sessionHours[hour];
          const hourLabel = format(new Date(2000, 0, 1, hour), "h a");

          return (
            <div
              key={hour}
              className={cn(
                "grid grid-cols-[60px_1fr] min-h-[48px]",
                session && "bg-accent/20"
              )}
              style={
                session
                  ? { borderLeft: `3px solid ${session.color}` }
                  : undefined
              }
            >
              <div className="p-2 text-xs text-muted-foreground text-right pr-3 border-r">
                {hourLabel}
              </div>
              <div className="p-1.5 space-y-1">
                {hourTasks.map((task) => (
                  <div
                    key={task.task_id}
                    className={cn(
                      "flex items-center gap-2 rounded px-2 py-1.5 text-sm border-l-2",
                      task.status === "done"
                        ? "bg-muted/50 text-muted-foreground"
                        : "bg-card border shadow-sm"
                    )}
                    style={{
                      borderLeftColor: task.subjects?.color ?? "hsl(var(--primary))",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={cn("truncate font-medium text-xs", task.status === "done" && "line-through")}>
                        {task.name}
                      </p>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {task.task_type}
                        {task.subjects?.name && ` · ${task.subjects.name}`}
                      </span>
                    </div>
                    {task.status !== "done" && (
                      <div className="flex gap-0.5 shrink-0">
                        {onPostpone && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onPostpone(task.task_id)}
                            title="Postpone"
                          >
                            <CalendarClock className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onStartTimer(task.task_id)}
                          title="Start Timer"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-success hover:text-success"
                          onClick={() => onMarkDone(task.task_id)}
                          title="Mark Done"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {task.status === "done" && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
