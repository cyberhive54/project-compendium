import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, AlertTriangle, Clock, CheckCircle2, ArrowRightLeft } from "lucide-react";
import { useTaskDiscipline, type TimePeriod } from "@/hooks/useAnalyticsData";

interface Props {
    period: TimePeriod;
}

export function TaskDisciplineCard({ period }: Props) {
    const { data, isLoading } = useTaskDiscipline(period);

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-indigo-500" />
                        Discipline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-28" />
                </CardContent>
            </Card>
        );
    }

    const stats = [
        {
            label: "On-Time Rate",
            value: `${data?.onTimeRate ?? 0}%`,
            icon: CheckCircle2,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            label: "Postpone Rate",
            value: `${data?.postponeRate ?? 0}%`,
            icon: ArrowRightLeft,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
        },
        {
            label: "Overdue",
            value: data?.overdueTasks?.toString() ?? "0",
            icon: AlertTriangle,
            color: "text-red-500",
            bg: "bg-red-500/10",
        },
        {
            label: "Completed",
            value: `${data?.completedTasks ?? 0}/${data?.totalTasks ?? 0}`,
            icon: Clock,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
    ];

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-indigo-500" />
                    Discipline
                </CardTitle>
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
