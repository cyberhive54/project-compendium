import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart } from "lucide-react";
import { useTaskCompletionRate, type TimePeriod } from "@/hooks/useAnalyticsData";

interface Props {
    period: TimePeriod;
}

export function TaskCompletionRateCard({ period }: Props) {
    const { data, isLoading } = useTaskCompletionRate(period);

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-teal-500" />
                        Task Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-32" />
                </CardContent>
            </Card>
        );
    }

    const total = data?.total ?? 0;
    const segments = data?.segments ?? [];

    // SVG donut chart
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    let cumulativeOffset = 0;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-teal-500" />
                        Task Status
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">{total} total</span>
                </div>
            </CardHeader>
            <CardContent>
                {total === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No tasks yet</p>
                ) : (
                    <div className="flex items-center gap-6">
                        {/* Donut */}
                        <div className="relative shrink-0">
                            <svg width="96" height="96" className="-rotate-90">
                                <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                                {segments.map((seg) => {
                                    const dash = (seg.value / total) * circumference;
                                    const offset = circumference - cumulativeOffset;
                                    cumulativeOffset += dash;
                                    return (
                                        <circle
                                            key={seg.label}
                                            cx="48" cy="48" r={radius} fill="none"
                                            stroke={seg.color}
                                            strokeWidth="8" strokeLinecap="butt"
                                            strokeDasharray={`${dash} ${circumference - dash}`}
                                            strokeDashoffset={offset}
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-lg font-bold">{segments.find((s) => s.label === "done")?.value ?? 0}</p>
                                    <p className="text-[9px] text-muted-foreground">Done</p>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-1.5 text-xs flex-1">
                            {segments.map((seg) => (
                                <div key={seg.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: seg.color }} />
                                        <span className="capitalize">{seg.label}</span>
                                    </div>
                                    <span className="font-medium">{seg.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
