import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Scale, Clock, Gauge } from "lucide-react";
import { useEstimatedVsActual, type TimePeriod } from "@/hooks/useAnalyticsData";

interface Props {
    period: TimePeriod;
}

export function EstimatedVsActualCard({ period }: Props) {
    const { data, isLoading } = useEstimatedVsActual(period);

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Scale className="h-4 w-4 text-sky-500" />
                        Estimated vs Actual
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-32" />
                </CardContent>
            </Card>
        );
    }

    const byType = data?.byType ?? [];

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Scale className="h-4 w-4 text-sky-500" />
                        Estimated vs Actual
                    </CardTitle>
                    {(data?.accuracyPercent ?? 0) > 0 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-500">
                            {data?.accuracyPercent}% accurate
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {byType.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
                ) : (
                    <div className="space-y-3">
                        {/* Summary */}
                        <div className="flex gap-4 text-center">
                            <div className="flex-1 p-2 rounded-lg bg-muted/30">
                                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-[10px] text-muted-foreground">Estimated</span>
                                </div>
                                <p className="text-base font-bold">{formatDur(data?.totalEstimated ?? 0)}</p>
                            </div>
                            <div className="flex-1 p-2 rounded-lg bg-muted/30">
                                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                    <Gauge className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-[10px] text-muted-foreground">Actual</span>
                                </div>
                                <p className="text-base font-bold">{formatDur(data?.totalActual ?? 0)}</p>
                            </div>
                        </div>

                        {/* Per-type bars */}
                        <div className="space-y-2">
                            {byType.map((item) => {
                                const maxVal = Math.max(item.avgEstimated, item.avgActual, 1);
                                return (
                                    <div key={item.type}>
                                        <p className="text-[10px] text-muted-foreground capitalize mb-1">{item.type}</p>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 text-[9px] text-muted-foreground">Est</div>
                                                <div className="flex-1 h-3 bg-muted/30 rounded-full overflow-hidden">
                                                    <div className="h-full bg-sky-500/60 rounded-full" style={{ width: `${(item.avgEstimated / maxVal) * 100}%` }} />
                                                </div>
                                                <span className="w-10 text-[10px] font-medium text-right">{item.avgEstimated}m</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 text-[9px] text-muted-foreground">Act</div>
                                                <div className="flex-1 h-3 bg-muted/30 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${item.avgActual > item.avgEstimated ? "bg-red-500/60" : "bg-green-500/60"}`}
                                                        style={{ width: `${(item.avgActual / maxVal) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="w-10 text-[10px] font-medium text-right">{item.avgActual}m</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
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
