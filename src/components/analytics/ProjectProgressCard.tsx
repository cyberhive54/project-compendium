import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { FolderKanban, CheckCircle2, Clock } from "lucide-react";
import { useProjectsProgress } from "@/hooks/useAnalyticsData";

export function ProjectProgressCard() {
    const { data, isLoading } = useProjectsProgress();

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-primary" />
                    Project Progress
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-lg" />
                    ))
                ) : !data?.length ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No projects yet</p>
                ) : (
                    data.map((p) => (
                        <div key={p.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-base">{p.icon}</span>
                                    <span className="text-sm font-medium truncate">{p.name}</span>
                                    {p.completed && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground ml-2 shrink-0">
                                    {p.progress}%
                                </span>
                            </div>
                            <Progress value={p.progress} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{p.doneTasks}/{p.totalTasks} tasks</span>
                                {p.daysLeft !== null && (
                                    <span className={`flex items-center gap-1 ${p.daysLeft < 0 ? "text-destructive" : ""}`}>
                                        <Clock className="h-3 w-3" />
                                        {p.daysLeft < 0 ? `${Math.abs(p.daysLeft)}d overdue` : `${p.daysLeft}d left`}
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
