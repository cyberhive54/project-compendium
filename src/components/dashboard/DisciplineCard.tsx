import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function DisciplineCard() {
    const { profile } = useAuth();

    if (!profile) return null;

    const levelProgress = (profile.total_xp % 100); // Simplified calculation

    return (
        <Card className="bg-gradient-to-br from-card to-accent/10 border-accent/20">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    Discipline Score
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Level & XP */}
                <div>
                    <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">Level {profile.current_level}</span>
                        <span className="text-muted-foreground">{levelProgress}/100 XP</span>
                    </div>
                    <Progress value={levelProgress} className="h-2" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-background/50 p-3 rounded-lg border flex flex-col items-center justify-center text-center">
                        <Flame className="h-5 w-5 text-orange-500 mb-1" />
                        <div className="text-2xl font-bold">{profile.current_streak}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Day Streak</div>
                    </div>
                    <div className="bg-background/50 p-3 rounded-lg border flex flex-col items-center justify-center text-center">
                        <Target className="h-5 w-5 text-blue-500 mb-1" />
                        <div className="text-2xl font-bold">{profile.longest_streak}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Best Streak</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
