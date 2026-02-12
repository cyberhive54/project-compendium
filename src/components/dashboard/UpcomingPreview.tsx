import { useMemo } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpcomingTasks } from "@/hooks/useDashboardStats";

export function UpcomingPreview() {
    const { data: tasks, isLoading } = useUpcomingTasks();
    const navigate = useNavigate();

    // Group by date — must be above all early returns to satisfy Rules of Hooks
    const grouped = useMemo(() => {
        if (!tasks?.length) return [];
        const map = new Map<string, typeof tasks>();
        tasks.slice(0, 8).forEach((t) => {
            const date = t.scheduled_date ?? "Unscheduled";
            if (!map.has(date)) map.set(date, []);
            map.get(date)!.push(t);
        });
        return Array.from(map.entries());
    }, [tasks]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                        Upcoming
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-16" />
                </CardContent>
            </Card>
        );
    }

    if (!grouped.length) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                        Upcoming
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground text-center py-3">No upcoming tasks this week</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-blue-500" />
                    Upcoming
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/calendar")}>
                    Calendar <ArrowRight className="h-3 w-3" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-3">
                {grouped.map(([date, dateTasks]) => (
                    <div key={date}>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                            {date !== "Unscheduled" ? format(new Date(date + "T00:00:00"), "EEE, MMM d") : "Unscheduled"}
                        </p>
                        <div className="space-y-1">
                            {dateTasks!.map((t) => (
                                <div
                                    key={t.task_id}
                                    className="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-accent/50 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/tasks/${t.task_id}`)}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                                    <span className="truncate flex-1">{t.name}</span>
                                    <span className="text-[10px] text-muted-foreground capitalize shrink-0">{t.task_type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
