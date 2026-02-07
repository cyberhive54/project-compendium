import { useMemo } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock } from "lucide-react";
import type { Task } from "@/types/database";
import type { DaySummary } from "@/hooks/useCalendarData";

interface WeekViewProps {
  currentDate: Date;
  tasks: (Task & { subjects?: { color: string; name: string } | null })[];
  summaries: Record<string, DaySummary>;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

const TIME_SLOTS = ["Morning", "Afternoon", "Evening", "Night"];

function getSlot(task: Task): string {
  if (task.scheduled_time_slot) return task.scheduled_time_slot;
  return "Morning";
}

export function CalendarWeekView({
  currentDate,
  tasks,
  summaries,
  selectedDate,
  onSelectDate,
}: WeekViewProps) {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  const tasksByDaySlot = useMemo(() => {
    const map: Record<string, Record<string, typeof tasks>> = {};
    for (const day of weekDays) {
      const key = format(day, "yyyy-MM-dd");
      map[key] = {};
      TIME_SLOTS.forEach((s) => (map[key][s] = []));
    }
    for (const task of tasks) {
      if (!task.scheduled_date) continue;
      const slot = getSlot(task);
      if (map[task.scheduled_date]?.[slot]) {
        map[task.scheduled_date][slot].push(task);
      }
    }
    return map;
  }, [weekDays, tasks]);

  return (
    <div className="rounded-lg border bg-card overflow-auto">
      <div className="min-w-[700px]">
        {/* Header */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b bg-muted/50">
          <div className="p-2" />
          {weekDays.map((day) => {
            const today = isToday(day);
            const selected = selectedDate && isSameDay(day, selectedDate);
            const summary = summaries[format(day, "yyyy-MM-dd")];

            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                className={cn(
                  "p-2 text-center border-l transition-colors hover:bg-accent/50",
                  selected && "bg-accent",
                  summary?.isHoliday && "bg-info-light/50"
                )}
              >
                <p className="text-xs text-muted-foreground">{format(day, "EEE")}</p>
                <p
                  className={cn(
                    "text-sm font-medium mt-0.5",
                    today && "bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center"
                  )}
                >
                  {format(day, "d")}
                </p>
              </button>
            );
          })}
        </div>

        {/* Time slots */}
        {TIME_SLOTS.map((slot) => (
          <div
            key={slot}
            className="grid grid-cols-[80px_repeat(7,1fr)] border-b last:border-b-0"
          >
            <div className="p-2 text-xs font-medium text-muted-foreground flex items-start justify-center border-r">
              {slot}
            </div>
            {weekDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const slotTasks = tasksByDaySlot[key]?.[slot] ?? [];

              return (
                <div
                  key={`${key}-${slot}`}
                  className="p-1 border-l min-h-[60px]"
                >
                  {slotTasks.map((task) => (
                    <div
                      key={task.task_id}
                      className={cn(
                        "text-[10px] leading-tight px-1.5 py-1 rounded mb-0.5 truncate border-l-2",
                        task.status === "done"
                          ? "bg-muted/50 text-muted-foreground line-through"
                          : "bg-accent/50"
                      )}
                      style={{
                        borderLeftColor: task.subjects?.color ?? "hsl(var(--primary))",
                      }}
                    >
                      <span className="flex items-center gap-1">
                        {task.status === "done" && <CheckCircle2 className="h-2.5 w-2.5 text-success shrink-0" />}
                        {task.name}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
