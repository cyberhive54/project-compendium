import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { type Task } from "@/types/database";
import { type DaySummary } from "@/hooks/useCalendarData";
import { CheckCircle2 } from "lucide-react";

interface CalendarWeekViewV2Props {
    currentDate: Date;
    tasks: (Task & { subjects?: { color: string; name: string } | null })[];
    summaries: Record<string, DaySummary>;
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
    onTaskClick: (taskId: string) => void;
}

const SESSIONS = [
    { id: "morning", label: "Morning", time: "6AM - 12PM" },
    { id: "afternoon", label: "Afternoon", time: "12PM - 5PM" },
    { id: "evening", label: "Evening", time: "5PM - 9PM" },
    { id: "night", label: "Night", time: "9PM - 2AM" },
];

export function CalendarWeekViewV2({
    currentDate,
    tasks,
    summaries,
    selectedDate,
    onSelectDate,
    onTaskClick,
}: CalendarWeekViewV2Props) {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Helper to categorize tasks into sessions
    const getTasksForCell = (dateKey: string, sessionId: string) => {
        return tasks.filter((t) => {
            if (t.scheduled_date !== dateKey) return false;

            const hour = t.scheduled_time_slot
                ? parseInt(t.scheduled_time_slot.split(':')[0])
                : 9; // Default to morning if no time

            // Match Session
            if (sessionId === "morning") return hour >= 5 && hour < 12;
            if (sessionId === "afternoon") return hour >= 12 && hour < 17;
            if (sessionId === "evening") return hour >= 17 && hour < 21;
            if (sessionId === "night") return hour >= 21 || hour < 5;
            return false;
        });
    };

    return (
        <div className="border rounded-md bg-background overflow-hidden flex flex-col h-full">
            {/* Header Row: Days */}
            <div className="grid grid-cols-[100px_repeat(7,minmax(0,1fr))] border-b bg-muted/40">
                <div className="p-3 font-medium text-xs text-muted-foreground border-r flex items-center justify-center">
                    Session
                </div>
                {weekDays.map((day) => {
                    const isToday = isSameDay(day, new Date());
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "p-2 text-center border-r last:border-r-0 cursor-pointer hover:bg-muted/50 transition-colors",
                                isSelected && "bg-primary/10"
                            )}
                            onClick={() => onSelectDate(day)}
                        >
                            <div className="text-xs font-medium text-muted-foreground uppercase">
                                {format(day, "EEE")}
                            </div>
                            <div
                                className={cn(
                                    "mx-auto text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center mt-1",
                                    isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                                )}
                            >
                                {format(day, "d")}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Rows: Sessions */}
            <div className="flex-1 overflow-auto">
                {SESSIONS.map((session) => (
                    <div
                        key={session.id}
                        className="grid grid-cols-[100px_repeat(7,minmax(0,1fr))] border-b last:border-b-0 min-h-[120px]"
                    >
                        {/* Session Label Column */}
                        <div className="p-3 border-r flex flex-col items-center justify-center gap-1 bg-muted/10">
                            <span className="font-semibold text-sm">{session.label}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider text-center">
                                {session.time}
                            </span>
                        </div>

                        {/* Day Cells for this Session */}
                        {weekDays.map((day) => {
                            const dateKey = format(day, "yyyy-MM-dd");
                            const cellTasks = getTasksForCell(dateKey, session.id);
                            const isToday = isSameDay(day, new Date());

                            return (
                                <div
                                    key={`${dateKey}-${session.id}`}
                                    className={cn(
                                        "p-2 border-r last:border-r-0 flex flex-col gap-2 relative group",
                                        isToday && "bg-primary/5"
                                    )}
                                >
                                    {cellTasks.map(task => (
                                        <div
                                            key={task.task_id}
                                            className={cn(
                                                "text-xs p-2 rounded border bg-card shadow-sm hover:shadow-md transition-all group/task flex flex-col gap-1",
                                                task.status === 'done' && "opacity-60 bg-muted"
                                            )}
                                            style={{
                                                borderLeftColor: task.subjects?.color || "transparent",
                                                borderLeftWidth: "3px"
                                            }}
                                        >
                                            <div className="font-medium truncate" title={task.name}>{task.name}</div>
                                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                                <span className="truncate max-w-[80px]">{task.subjects?.name}</span>
                                                {task.status === 'done' && <CheckCircle2 className="h-3 w-3 text-success shrink-0" />}
                                            </div>
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
