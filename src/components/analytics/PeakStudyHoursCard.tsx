import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock3 } from "lucide-react";
import { usePeakStudyHours, type TimePeriod } from "@/hooks/useAnalyticsData";

interface Props {
    period: TimePeriod;
}

export function PeakStudyHoursCard({ period }: Props) {
    const { data, isLoading } = usePeakStudyHours(period);

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-rose-500" />
                        Peak Study Hours
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-32" />
                </CardContent>
            </Card>
        );
    }

    const maxMinutes = Math.max(1, ...(data?.hourlyMinutes ?? []).filter(Boolean));
    const totalMinutes = (data?.hourlyMinutes ?? []).reduce((a, b) => a + b, 0);

    // Derive intensity for color
    const getColor = (minutes: number) => {
        if (minutes === 0) return "bg-muted/30";
        const ratio = minutes / maxMinutes;
        if (ratio > 0.75) return "bg-primary";
        if (ratio > 0.5) return "bg-primary/80";
        if (ratio > 0.25) return "bg-primary/50";
        return "bg-primary/30";
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-rose-500" />
                        Peak Study Hours
                    </CardTitle>
                    {totalMinutes > 0 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            Peak: {data?.peakLabel}
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {/* 24-hour grid (4 rows x 6 cols) */}
                <div className="grid grid-cols-6 gap-1.5">
                    {(data?.hourlyMinutes ?? Array(24).fill(0)).map((minutes, hour) => (
                        <div key={hour} className="group relative">
                            <div
                                className={`aspect-square rounded-sm ${getColor(minutes)} transition-all hover:ring-2 hover:ring-primary/50`}
                            />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border rounded px-1.5 py-0.5 text-[10px] font-medium opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-sm z-10">
                                {hour}:00 — {minutes}m
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground mt-2">
                    <span>12am</span>
                    <span>6am</span>
                    <span>12pm</span>
                    <span>6pm</span>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 mt-3 justify-end">
                    <span className="text-[9px] text-muted-foreground">Less</span>
                    <div className="w-3 h-3 rounded-sm bg-muted/30" />
                    <div className="w-3 h-3 rounded-sm bg-primary/30" />
                    <div className="w-3 h-3 rounded-sm bg-primary/50" />
                    <div className="w-3 h-3 rounded-sm bg-primary/80" />
                    <div className="w-3 h-3 rounded-sm bg-primary" />
                    <span className="text-[9px] text-muted-foreground">More</span>
                </div>
            </CardContent>
        </Card>
    );
}
