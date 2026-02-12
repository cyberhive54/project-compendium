import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Star, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function StreakLevelCard() {
    const { profile } = useAuth();

    if (!profile) return null;

    // XP needed per level: 100 * level
    const xpPerLevel = 100 * profile.current_level;
    const xpInLevel = profile.total_xp % xpPerLevel || 0;
    const progressPercent = Math.round((xpInLevel / xpPerLevel) * 100);

    return (
        <Card>
            <CardContent className="pt-4 pb-4 space-y-3">
                {/* Streak row */}
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                        <Flame className="h-4.5 w-4.5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Streak</span>
                            <span className="text-sm font-bold text-orange-500">{profile.current_streak}d</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Best: {profile.longest_streak}d
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t" />

                {/* Level & XP */}
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Trophy className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">Level {profile.current_level}</span>
                            <span className="text-[10px] text-muted-foreground">{xpInLevel}/{xpPerLevel} XP</span>
                        </div>
                        <Progress value={progressPercent} className="h-1.5" />
                    </div>
                </div>

                {/* Total XP */}
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground justify-end">
                    <Star className="h-3 w-3" />
                    <span>{profile.total_xp.toLocaleString()} lifetime XP</span>
                </div>
            </CardContent>
        </Card>
    );
}
