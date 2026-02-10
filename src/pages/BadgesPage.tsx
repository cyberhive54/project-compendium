import { useBadges } from "@/hooks/useBadges";
import { useAuth } from "@/hooks/useAuth";
import { BadgeCard } from "@/components/gamification/BadgeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Award, Trophy } from "lucide-react";
import { useState } from "react";

const BADGE_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "streak", label: "🔥 Streak" },
  { value: "time", label: "⏱️ Time" },
  { value: "task", label: "✅ Tasks" },
  { value: "exam", label: "🏆 Exams" },
  { value: "milestone", label: "🎯 Milestones" },
];

export default function BadgesPage() {
  const { profile } = useAuth();
  const { allBadges, earnedBadgeIds, earnedMap, isLoading } = useBadges();
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredBadges =
    categoryFilter === "all"
      ? allBadges
      : allBadges.filter((b) => b.category === categoryFilter);

  const earnedCount = allBadges.filter((b) => earnedBadgeIds.has(b.badge_id)).length;
  const totalCount = allBadges.length;


  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Achievements
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {earnedCount} / {totalCount} badges earned · Level{" "}
            {profile?.current_level ?? 1} · {profile?.total_xp ?? 0} XP
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            {BADGE_CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={categoryFilter === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">
                {totalCount > 0
                  ? Math.round((earnedCount / totalCount) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{
                  width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Badge grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-xl" />
              ))}
            </div>
          ) : filteredBadges.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No badges in this category yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Earned first, then locked */}
              {[...filteredBadges]
                .sort((a, b) => {
                  const aEarned = earnedBadgeIds.has(a.badge_id) ? 0 : 1;
                  const bEarned = earnedBadgeIds.has(b.badge_id) ? 0 : 1;
                  return aEarned - bEarned;
                })
                .map((badge) => (
                  <BadgeCard
                    key={badge.badge_id}
                    badge={badge}
                    earned={earnedBadgeIds.has(badge.badge_id)}
                    unlockedAt={earnedMap.get(badge.badge_id)}
                  />
                ))}
            </div>
          )}
      </div>
    </div>
  );
}
