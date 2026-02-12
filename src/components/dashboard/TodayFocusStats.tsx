import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Timer, Coffee, Zap, Clock } from "lucide-react";
import { useFocusQuality } from "@/hooks/useAnalyticsData";
import type { DashboardStats } from "@/hooks/useDashboardStats";

interface Props {
    stats: DashboardStats | undefined;
    isLoading: boolean;
}

export function TodayFocusStats({ stats, isLoading }: Props) {
    // Fetch today's focus data (period = "week" but we only show today slice)
    const { data: focusData, isLoading: focusLoading } = useFocusQuality("week");

    const loading = isLoading || focusLoading;

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" />
                        Today's Focus
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-20" />
                </CardContent>
            </Card>
        );
    }

    const items = [
        {
            label: "Studied",
            value: formatTime(stats?.timeStudiedToday ?? 0),
            icon: Clock,
            color: "text-primary",
        },
        {
            label: "Tasks",
            value: `${stats?.tasksDoneToday ?? 0}/${stats?.totalTasksToday ?? 0}`,
            icon: Timer,
            color: "text-emerald-500",
        },
        {
            label: "Sessions",
            value: (focusData?.totalSessions ?? 0).toString(),
            icon: Zap,
            color: "text-amber-500",
        },
        {
            label: "F:B Ratio",
            value: focusData?.focusBreakRatio === Infinity
                ? "∞"
                : `${focusData?.focusBreakRatio ?? 0}:1`,
            icon: Coffee,
            color: "text-violet-500",
        },
    ];

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Today's Focus
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-2.5">
                    {items.map((item) => (
                        <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                            <item.icon className={`h-3.5 w-3.5 ${item.color} shrink-0`} />
                            <div className="min-w-0">
                                <p className="text-sm font-bold leading-tight">{item.value}</p>
                                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function formatTime(minutes: number): string {
    if (minutes === 0) return "0m";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
