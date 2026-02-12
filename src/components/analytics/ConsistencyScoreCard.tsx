import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";
import { useConsistencyScore, type TimePeriod } from "@/hooks/useAnalyticsData";

interface Props {
    period: TimePeriod;
}

export function ConsistencyScoreCard({ period }: Props) {
    const { data, isLoading } = useConsistencyScore(period);

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4 text-cyan-500" />
                        Consistency
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-28" />
                </CardContent>
            </Card>
        );
    }

    const score = data?.score ?? 0;
    const circumference = 2 * Math.PI * 40;
    const dashOffset = circumference - (score / 100) * circumference;

    const getScoreColor = (s: number) => {
        if (s >= 80) return "text-green-500";
        if (s >= 50) return "text-amber-500";
        return "text-red-500";
    };

    const getStrokeColor = (s: number) => {
        if (s >= 80) return "#22C55E";
        if (s >= 50) return "#F59E0B";
        return "#EF4444";
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-500" />
                    Consistency
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6">
                    {/* Circular gauge */}
                    <div className="relative shrink-0">
                        <svg width="96" height="96" className="-rotate-90">
                            <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                            <circle
                                cx="48" cy="48" r="40" fill="none"
                                stroke={getStrokeColor(score)}
                                strokeWidth="6" strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={dashOffset}
                                className="transition-all duration-700"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-xl font-bold ${getScoreColor(score)}`}>{score}%</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className="text-muted-foreground">Days studied</span>
                            <p className="font-semibold text-lg">{data?.studiedDays ?? 0}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Days missed</span>
                            <p className="font-semibold text-lg text-muted-foreground">{data?.missedDays ?? 0}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            out of {data?.totalDays ?? 0} days
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
