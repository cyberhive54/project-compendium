import { cn } from "@/lib/utils";
import type { BadgeDefinition } from "@/hooks/useBadges";
import { format } from "date-fns";

interface BadgeCardProps {
  badge: BadgeDefinition;
  earned: boolean;
  unlockedAt?: string;
}

const TIER_STYLES: Record<string, string> = {
  bronze:
    "border-amber-600/30 bg-gradient-to-br from-amber-900/10 to-amber-700/5",
  silver:
    "border-slate-400/30 bg-gradient-to-br from-slate-400/10 to-slate-300/5",
  gold: "border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-400/5",
  platinum:
    "border-cyan-400/30 bg-gradient-to-br from-cyan-400/10 to-cyan-300/5",
};

const TIER_LABEL_STYLES: Record<string, string> = {
  bronze: "text-amber-600",
  silver: "text-slate-400",
  gold: "text-yellow-500",
  platinum: "text-cyan-400",
};

export function BadgeCard({ badge, earned, unlockedAt }: BadgeCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border-2 p-4 transition-all duration-200",
        earned
          ? TIER_STYLES[badge.tier] ?? "border-border"
          : "border-border/50 bg-muted/30 opacity-60 grayscale"
      )}
    >
      {/* Tier label */}
      <span
        className={cn(
          "absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider",
          TIER_LABEL_STYLES[badge.tier] ?? "text-muted-foreground"
        )}
      >
        {badge.tier}
      </span>

      <div className="flex flex-col items-center text-center gap-2">
        <span className="text-4xl">{badge.icon}</span>
        <div>
          <p className="font-semibold text-sm leading-tight">{badge.name}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">
            {badge.description}
          </p>
        </div>

        {earned && unlockedAt && (
          <p className="text-[10px] text-muted-foreground mt-1">
            Earned {format(new Date(unlockedAt), "MMM d, yyyy")}
          </p>
        )}

        {badge.xp_reward > 0 && (
          <span className="text-xs font-medium text-primary">
            +{badge.xp_reward} XP
          </span>
        )}

        {!earned && (
          <span className="text-xs text-muted-foreground italic">🔒 Locked</span>
        )}
      </div>
    </div>
  );
}
