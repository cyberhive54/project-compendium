import { format, addHours, startOfDay, isSameDay, subHours, differenceInMinutes, areIntervalsOverlapping } from "date-fns";
import { cn } from "@/lib/utils";
import { type Task } from "@/types/database";
import { type DaySummary } from "@/hooks/useCalendarData";
import { type StudySessionConfig as StudySession } from "@/types/database";
import { CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarDayGridProps {
    currentDate: Date;
    tasks: (Task & { subjects?: { color: string; name: string } | null })[];
    summary: DaySummary | undefined;
    sessions: StudySession[];
    onMarkDone: (taskId: string) => void;
    onStartTimer: (taskId: string) => void;
    onTaskClick: (taskId: string) => void;
    onSlotClick: (date: Date) => void;
}

export function CalendarDayGrid({
    currentDate,
    tasks,
    summary,
    sessions,
    onMarkDone,
    onStartTimer,
    onTaskClick,
    onSlotClick,
}: CalendarDayGridProps) {
    // Grid configuration: 6 columns x 5 rows = 30 cells
    // We need to span 30 hours: Prev 3h + Current 24h + Next 3h = 30h
    // Start from: currentDate 00:00 - 3h = Previous Day 21:00

    const startOfCurrentDay = startOfDay(currentDate);
    const startTime = subHours(startOfCurrentDay, 3); // 9 PM previous day
    const totalHours = 30;

    const hours = Array.from({ length: totalHours }, (_, i) => addHours(startTime, i));

    // Helper to determine cell background based on session
    const getSessionForHour = (hourDate: Date) => {
        // This is simple time matching against StudySessionConfig
        // We need to convert hourDate to minutes from midnight or similar to match session config
        // Actually sessions have start_time/end_time strings like "09:00", "17:00"

        // For simplicity, let's just use the hour string "HH:mm"
        const timeStr = format(hourDate, "HH:mm");

        // Find active session covering this hour
        // Note: This needs robust overlapping logic, effectively "is timeStr within session range"
        // Since sessions are properly defined in DB with days_of_week, we should check that too.
        // For now, let's assume 'sessions' passed here are relevant for the day or generic.
        // The useStudySessions hook returns all configured sessions.

        // Check day of week
        const dayOfWeek = hourDate.getDay(); // 0=Sun, 6=Sat
        // Adjust for Supabase (usually 1-7 or 0-6 match). 
        // Let's rely on a simpler visual for now: 
        // If we have a task in this hour, color by its subject? 
        // User asked: "Bg color of the cells are the color codes of the sessions for that hour"

        // Let's try to match generic sessions
        const activeSession = sessions.find(s => {
            if (!s.days_of_week.includes(dayOfWeek === 0 ? 7 : dayOfWeek)) return false;
            // Simple string comparison for range
            return timeStr >= s.start_time && timeStr < s.end_time;
        });

        return activeSession;
    };

    const getTasksForHour = (hourDate: Date) => {
        return tasks.filter(t => {
            // Parse scheduled_date
            if (!t.scheduled_date || t.scheduled_date !== format(hourDate, "yyyy-MM-dd")) return false;

            // If time slot exists, strict match
            if (t.scheduled_time_slot) {
                const taskStart = new Date(`${t.scheduled_date}T${t.scheduled_time_slot}`);
                const taskEnd = addHours(taskStart, (t.estimated_duration || 60) / 60);
                const hourEnd = addHours(hourDate, 1);

                return areIntervalsOverlapping(
                    { start: taskStart, end: taskEnd },
                    { start: hourDate, end: hourEnd }
                );
            }

            // If no time slot, show at 9 AM default for visibility
            if (hourDate.getHours() === 9) return true;

            return false;
        });
    };

    return (
        <div className="border rounded-md bg-background overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b flex justify-between items-center bg-muted/40">
                <h3 className="font-semibold text-lg">
                    {format(currentDate, "EEEE, MMMM d")}
                </h3>
                <div className="text-sm text-muted-foreground">
                    30-Hour View
                </div>
            </div>

            <div className="grid grid-cols-6 grid-rows-5 gap-[1px] bg-border p-[1px] flex-1 min-h-[600px]">
                {hours.map((hourDate) => {
                    const session = getSessionForHour(hourDate);
                    const hourTasks = getTasksForHour(hourDate);
                    const isCurrentHour = isSameDay(hourDate, new Date()) && new Date().getHours() === hourDate.getHours();

                    return (
                        <div
                            key={hourDate.toISOString()}
                            className={cn(
                                "bg-card relative flex flex-col p-1 min-h-[100px] cursor-pointer hover:bg-muted/5 transition-colors",
                                isCurrentHour && "ring-2 ring-inset ring-primary z-10"
                            )}
                            style={{
                                backgroundColor: session ? `${session.color}15` : undefined // 15 = ~10% opacity hex
                            }}
                            onClick={() => onSlotClick(hourDate)}
                        >
                            {/* Time Label */}
                            <div className="text-[10px] text-muted-foreground font-mono mb-1">
                                {format(hourDate, "h a")}
                            </div>

                            {/* Task Bars */}
                            <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                                {hourTasks.map(task => (
                                    <div
                                        key={task.task_id}
                                        className={cn(
                                            "text-[10px] px-1 py-0.5 rounded border truncate cursor-pointer hover:opacity-80 flex items-center gap-1",
                                            task.status === 'done' ? "bg-muted text-muted-foreground line-through" : "bg-primary/10 border-primary/20 text-foreground"
                                        )}
                                        style={{
                                            borderLeftColor: task.subjects?.color || "currentColor",
                                            borderLeftWidth: "3px"
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTaskClick(task.task_id);
                                        }}
                                        title={task.name}
                                    >
                                        <span className="truncate flex-1">{task.name}</span>
                                        {task.status === 'done' && <CheckCircle2 className="h-2 w-2" />}
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
