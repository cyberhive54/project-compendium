import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { useSubjectsProgress } from "@/hooks/useAnalyticsData";

export function SubjectProgressCard() {
    const { data, isLoading } = useSubjectsProgress();

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-violet-500" />
                    Subject Progress
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[320px] overflow-y-auto">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 rounded-lg" />
                    ))
                ) : !data?.length ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No subjects yet</p>
                ) : (
                    data.map((s) => (
                        <div key={s.id} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-base">{s.icon}</span>
                                    <div className="min-w-0">
                                        <span className="text-sm font-medium truncate block">{s.name}</span>
                                        <span className="text-[11px] text-muted-foreground truncate block">{s.goalName}</span>
                                    </div>
                                    {s.completed && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground ml-2 shrink-0">
                                    {s.progress}%
                                </span>
                            </div>
                            <Progress value={s.progress} className="h-1.5" />
                            <div className="text-xs text-muted-foreground">
                                {s.completedChapters}/{s.totalChapters} chapters
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
