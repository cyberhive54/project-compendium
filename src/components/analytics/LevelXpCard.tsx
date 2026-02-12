import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Star } from "lucide-react";
import { useLevelProgress } from "@/hooks/useAnalyticsData";

export function LevelXpCard() {
    const { data, isLoading } = useLevelProgress();

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        Level & XP
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-28" />
                </CardContent>
            </Card>
        );
    }

    const tierColors: Record<string, string> = {
        bronze: "text-orange-600",
        silver: "text-slate-400",
        gold: "text-yellow-500",
        platinum: "text-cyan-400",
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Level & XP
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Level display */}
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">{data?.currentLevel ?? 1}</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Level {data?.currentLevel ?? 1}</span>
                            <span className="text-muted-foreground">Level {(data?.currentLevel ?? 1) + 1}</span>
                        </div>
                        <Progress value={data?.progressPercent ?? 0} className="h-2.5" />
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            {data?.xpInLevel?.toLocaleString() ?? 0} / {data?.xpNeeded?.toLocaleString() ?? 0} XP
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Star className="h-3 w-3" />
                    <span>Total XP: <span className="font-semibold text-foreground">{data?.totalXp?.toLocaleString() ?? 0}</span></span>
                </div>

                {/* Recent badges */}
                {data?.recentBadges && data.recentBadges.length > 0 && (
                    <div>
                        <p className="text-[10px] text-muted-foreground mb-1.5">Recent Badges</p>
                        <div className="flex flex-wrap gap-1.5">
                            {data.recentBadges.map((b) => (
                                <div
                                    key={b.id}
                                    className={`text-xs px-2 py-0.5 rounded-full bg-muted flex items-center gap-1 ${tierColors[b.tier] ?? ""}`}
                                    title={b.name}
                                >
                                    <span>{b.icon}</span>
                                    <span className="truncate max-w-[80px]">{b.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
