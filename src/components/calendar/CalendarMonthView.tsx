import { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Palmtree } from "lucide-react";
import type { DaySummary } from "@/hooks/useCalendarData";

interface MonthViewProps {
  currentDate: Date;
  summaries: Record<string, DaySummary>;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export function CalendarMonthView({
  currentDate,
  summaries,
  selectedDate,
  onSelectDate,
}: MonthViewProps) {
  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows: Date[][] = [];
    let day = calStart;
    let week: Date[] = [];

    while (day <= calEnd) {
      week.push(day);
      if (week.length === 7) {
        rows.push(week);
        week = [];
      }
      day = addDays(day, 1);
    }
    return rows;
  }, [currentDate]);

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {dayLabels.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 divide-x border-b last:border-b-0">
          {week.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const summary = summaries[key];
            const inMonth = isSameMonth(day, currentDate);
            const today = isToday(day);
            const selected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={key}
                onClick={() => onSelectDate(day)}
                className={cn(
                  "min-h-[80px] md:min-h-[100px] p-1.5 text-left transition-colors hover:bg-accent/50 relative",
                  !inMonth && "bg-muted/30 text-muted-foreground/50",
                  selected && "ring-2 ring-primary ring-inset",
                  summary?.isHoliday && "bg-info-light/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                      today && "bg-primary text-primary-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {summary?.isHoliday && (
                    <Palmtree className="h-3 w-3 text-info" />
                  )}
                </div>

                {summary && inMonth && (
                  <div className="mt-1 space-y-0.5">
                    {summary.taskCount > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">
                          {summary.doneTasks}/{summary.taskCount}
                        </span>
                      </div>
                    )}
                    {summary.timeStudiedMinutes > 0 && (
                      <p className="text-[10px] text-muted-foreground truncate">
                        {summary.timeStudiedMinutes}m
                      </p>
                    )}
                    {/* Subject color dots */}
                    {summary.subjectColors.length > 0 && (
                      <div className="flex gap-0.5 flex-wrap">
                        {summary.subjectColors.slice(0, 4).map((color, i) => (
                          <span
                            key={i}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        {summary.subjectColors.length > 4 && (
                          <span className="text-[8px] text-muted-foreground">
                            +{summary.subjectColors.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
