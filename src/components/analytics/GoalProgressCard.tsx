import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle2, Clock } from "lucide-react";
import { useGoalsProgress } from "@/hooks/useAnalyticsData";

export function GoalProgressCard() {
    const { data, isLoading } = useGoalsProgress();

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-500" />
                    Goal Progress
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[320px] overflow-y-auto">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-lg" />
                    ))
                ) : !data?.length ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No goals yet</p>
                ) : (
                    data.map((g) => (
                        <div key={g.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-base">{g.icon}</span>
                                    <span className="text-sm font-medium truncate">{g.name}</span>
                                    {g.completed && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground ml-2 shrink-0">
                                    {g.progress}%
                                </span>
                            </div>
                            <Progress value={g.progress} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span>{g.doneTasks}/{g.totalTasks} tasks</span>
                                    <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] uppercase tracking-wide">{g.goalType}</span>
                                </div>
                                {g.daysLeft !== null && (
                                    <span className={`flex items-center gap-1 ${g.daysLeft < 0 ? "text-destructive" : ""}`}>
                                        <Clock className="h-3 w-3" />
                                        {g.daysLeft < 0 ? `${Math.abs(g.daysLeft)}d overdue` : `${g.daysLeft}d left`}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
