import { useEffect } from "react";
import { useGamificationStore } from "@/stores/gamificationStore";
import { toast } from "sonner";

const TIER_COLORS: Record<string, string> = {
  bronze: "text-amber-600",
  silver: "text-slate-400",
  gold: "text-yellow-500",
  platinum: "text-cyan-400",
};

export function BadgeUnlockToast() {
  const { pendingBadges, popBadge } = useGamificationStore();

  useEffect(() => {
    if (pendingBadges.length === 0) return;

    const badge = popBadge();
    if (!badge) return;

    toast(
      <div className="flex items-center gap-3">
        <span className="text-3xl">{badge.icon}</span>
        <div>
          <p className="font-semibold">
            Badge Unlocked!{" "}
            <span className={TIER_COLORS[badge.tier] ?? ""}>
              ({badge.tier})
            </span>
          </p>
          <p className="text-sm font-medium">{badge.name}</p>
          <p className="text-xs text-muted-foreground">{badge.description}</p>
          {badge.xp_reward > 0 && (
            <p className="text-xs text-primary mt-0.5">
              +{badge.xp_reward} XP bonus!
            </p>
          )}
        </div>
      </div>,
      { duration: 5000 }
    );
  }, [pendingBadges.length, popBadge]);

  return null;
}
