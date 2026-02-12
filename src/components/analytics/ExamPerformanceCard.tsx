import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, TrendingUp, TrendingDown } from "lucide-react";
import { useExamPerformance, type TimePeriod } from "@/hooks/useAnalyticsData";

interface Props {
    period: TimePeriod;
}

export function ExamPerformanceCard({ period }: Props) {
    const { data, isLoading } = useExamPerformance(period);

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-purple-500" />
                        Exam Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40" />
                </CardContent>
            </Card>
        );
    }

    if (!data?.length) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-purple-500" />
                        Exam Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-6">No exam data yet</p>
                </CardContent>
            </Card>
        );
    }

    // Average accuracy across exams
    const accuracies = data.filter((e) => e.accuracy !== null).map((e) => e.accuracy!);
    const avgAccuracy = accuracies.length > 0
        ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length)
        : null;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-purple-500" />
                        Exam Performance
                    </CardTitle>
                    {avgAccuracy !== null && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500">
                            Avg: {avgAccuracy}%
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                    {data.slice(0, 10).map((exam, idx) => {
                        const prev = idx < data.length - 1 ? data[idx + 1] : null;
                        const trend = prev?.accuracy != null && exam.accuracy != null
                            ? exam.accuracy - prev.accuracy
                            : null;

                        return (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 text-sm">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{exam.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{exam.date} · {exam.type}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {exam.accuracy !== null && (
                                        <div className="text-center">
                                            <p className={`text-sm font-bold ${exam.accuracy >= 80 ? "text-green-500" : exam.accuracy >= 50 ? "text-amber-500" : "text-red-500"}`}>
                                                {exam.accuracy}%
                                            </p>
                                            <p className="text-[9px] text-muted-foreground">Accuracy</p>
                                        </div>
                                    )}
                                    {exam.marksObtained !== null && (
                                        <div className="text-center">
                                            <p className="text-sm font-bold">{exam.marksObtained}/{exam.totalMarks}</p>
                                            <p className="text-[9px] text-muted-foreground">Marks</p>
                                        </div>
                                    )}
                                    {exam.speed !== null && (
                                        <div className="text-center">
                                            <p className="text-sm font-bold">{exam.speed}</p>
                                            <p className="text-[9px] text-muted-foreground">QPM</p>
                                        </div>
                                    )}
                                    {trend !== null && (
                                        <div className={`${trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                                            {trend > 0 ? <TrendingUp className="h-4 w-4" /> : trend < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
