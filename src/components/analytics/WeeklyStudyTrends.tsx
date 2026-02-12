import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";
import { useWeeklyStudyTrends } from "@/hooks/useAnalyticsData";

export function WeeklyStudyTrends() {
    const { data, isLoading } = useWeeklyStudyTrends();

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                        This Week
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40" />
                </CardContent>
            </Card>
        );
    }

    const maxMinutes = Math.max(1, ...(data ?? []).map((d) => d.minutes));
    const totalWeekMinutes = (data ?? []).reduce((s, d) => s + d.minutes, 0);
    const totalWeekTasks = (data ?? []).reduce((s, d) => s + d.tasks, 0);
    const today = new Date().toISOString().split("T")[0];

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                        This Week
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">
                        {formatDuration(totalWeekMinutes)} · {totalWeekTasks} tasks
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-end gap-2 h-28">
                    {(data ?? []).map((d) => {
                        const isToday = d.date === today;
                        return (
                            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                                <div
                                    className={`w-full rounded-t transition-all min-h-[2px] ${isToday ? "bg-primary" : "bg-primary/50"}`}
                                    style={{ height: d.minutes > 0 ? `${Math.max(6, (d.minutes / maxMinutes) * 100)}px` : "2px" }}
                                />
                                <span className={`text-[10px] ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                                    {d.day}
                                </span>
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover border rounded px-2 py-1 text-[10px] opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-sm z-10">
                                    <span className="font-medium">{formatDuration(d.minutes)}</span> · {d.tasks} tasks
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function formatDuration(minutes: number): string {
    if (minutes === 0) return "0m";
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
