import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import { useDailyStudyBreakdown } from "@/hooks/useAnalyticsData";

export function DailyStudyBreakdown() {
    const { data, isLoading } = useDailyStudyBreakdown();

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Sun className="h-4 w-4 text-amber-500" />
                        Today's Study
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40" />
                </CardContent>
            </Card>
        );
    }

    const maxMinutes = Math.max(1, ...((data?.hourlyMinutes ?? []).filter(Boolean)));

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Sun className="h-4 w-4 text-amber-500" />
                        Today's Study
                    </CardTitle>
                    <div className="flex items-center gap-1 text-xs">
                        {data && data.changePercent !== 0 && (
                            <span className={`flex items-center gap-0.5 ${data.changePercent > 0 ? "text-green-500" : "text-red-500"}`}>
                                {data.changePercent > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {Math.abs(data.changePercent)}%
                            </span>
                        )}
                        <span className="text-muted-foreground">vs yesterday</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                        <p className="text-xl font-bold">{formatDuration(data?.todayTotal ?? 0)}</p>
                        <p className="text-[11px] text-muted-foreground">Study Time</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold">{data?.tasksToday ?? 0}</p>
                        <p className="text-[11px] text-muted-foreground">Tasks Done</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold">{formatDuration(data?.yesterdayTotal ?? 0)}</p>
                        <p className="text-[11px] text-muted-foreground">Yesterday</p>
                    </div>
                </div>

                {/* Hour-by-hour bar chart */}
                <div>
                    <p className="text-xs text-muted-foreground mb-2">Hourly Breakdown</p>
                    <div className="flex items-end gap-[2px] h-20">
                        {(data?.hourlyMinutes ?? Array(24).fill(0)).map((minutes, hour) => (
                            <div key={hour} className="flex-1 flex flex-col items-center group relative">
                                <div
                                    className="w-full rounded-t transition-all bg-primary/70 hover:bg-primary min-h-[1px]"
                                    style={{ height: minutes > 0 ? `${Math.max(4, (minutes / maxMinutes) * 76)}px` : "1px", opacity: minutes > 0 ? 1 : 0.15 }}
                                />
                                {/* Tooltip */}
                                {minutes > 0 && (
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border rounded px-1.5 py-0.5 text-[10px] font-medium opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-sm z-10">
                                        {hour}:00 — {minutes}m
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                        <span>12am</span>
                        <span>6am</span>
                        <span>12pm</span>
                        <span>6pm</span>
                        <span>11pm</span>
                    </div>
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
