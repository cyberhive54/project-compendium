import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Timer, RotateCcw, Percent, Clock } from "lucide-react";
import { usePomodoroStats, type TimePeriod } from "@/hooks/useAnalyticsData";

interface Props {
    period: TimePeriod;
}

export function PomodoroStatsCard({ period }: Props) {
    const { data, isLoading } = usePomodoroStats(period);

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Timer className="h-4 w-4 text-red-500" />
                        Pomodoro
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-20" />
                </CardContent>
            </Card>
        );
    }

    const stats = [
        {
            label: "Sessions",
            value: data?.totalPomoSessions?.toString() ?? "0",
            icon: Timer,
            color: "text-red-500",
            bg: "bg-red-500/10",
        },
        {
            label: "Cycles",
            value: data?.totalCycles?.toString() ?? "0",
            icon: RotateCcw,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        {
            label: "Avg Cycles",
            value: data?.avgCyclesPerSession?.toString() ?? "0",
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
        },
        {
            label: "Pomo Rate",
            value: `${data?.pomoRate ?? 0}%`,
            icon: Percent,
            color: "text-pink-500",
            bg: "bg-pink-500/10",
        },
    ];

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Timer className="h-4 w-4 text-red-500" />
                        Pomodoro
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                        {formatDur(data?.totalPomoMinutes ?? 0)} total
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30">
                            <div className={`p-1.5 rounded ${stat.bg}`}>
                                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-lg font-bold leading-tight">{stat.value}</p>
                                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function formatDur(minutes: number): string {
    if (minutes === 0) return "0m";
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
