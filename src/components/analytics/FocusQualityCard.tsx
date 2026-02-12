import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Focus, Timer, Zap, Pause, Coffee } from "lucide-react";
import { useFocusQuality, type TimePeriod } from "@/hooks/useAnalyticsData";

interface Props {
    period: TimePeriod;
}

export function FocusQualityCard({ period }: Props) {
    const { data, isLoading } = useFocusQuality(period);

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Focus className="h-4 w-4 text-orange-500" />
                        Focus Quality
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-32" />
                </CardContent>
            </Card>
        );
    }

    const stats = [
        {
            label: "Avg Session",
            value: `${data?.avgSessionMinutes ?? 0}m`,
            icon: Timer,
            color: "text-blue-500",
        },
        {
            label: "Longest",
            value: `${data?.longestSessionMinutes ?? 0}m`,
            icon: Zap,
            color: "text-yellow-500",
        },
        {
            label: "Focus:Break",
            value: data?.focusBreakRatio === Infinity ? "∞" : `${data?.focusBreakRatio ?? 0}:1`,
            icon: Coffee,
            color: "text-emerald-500",
        },
        {
            label: "Avg Paused",
            value: `${data?.avgPausedMinutes ?? 0}m`,
            icon: Pause,
            color: "text-muted-foreground",
        },
    ];

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Focus className="h-4 w-4 text-orange-500" />
                        Focus Quality
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                        {data?.totalSessions ?? 0} sessions
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                {/* Focus/Break bar */}
                <div className="mb-4">
                    <div className="flex rounded-full h-3 overflow-hidden bg-muted">
                        {(data?.totalFocusMinutes ?? 0) + (data?.totalBreakMinutes ?? 0) > 0 && (
                            <>
                                <div
                                    className="bg-primary transition-all"
                                    style={{
                                        width: `${((data?.totalFocusMinutes ?? 0) / ((data?.totalFocusMinutes ?? 0) + (data?.totalBreakMinutes ?? 0))) * 100}%`,
                                    }}
                                />
                                <div
                                    className="bg-muted-foreground/30 transition-all"
                                    style={{
                                        width: `${((data?.totalBreakMinutes ?? 0) / ((data?.totalFocusMinutes ?? 0) + (data?.totalBreakMinutes ?? 0))) * 100}%`,
                                    }}
                                />
                            </>
                        )}
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>Focus: {formatDuration(data?.totalFocusMinutes ?? 0)}</span>
                        <span>Break: {formatDuration(data?.totalBreakMinutes ?? 0)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex items-center gap-2">
                            <stat.icon className={`h-4 w-4 ${stat.color} shrink-0`} />
                            <div>
                                <p className="text-base font-bold leading-tight">{stat.value}</p>
                                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                            </div>
                        </div>
                    ))}
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
