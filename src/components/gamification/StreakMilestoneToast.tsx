import { useEffect } from "react";
import { useGamificationStore } from "@/stores/gamificationStore";
import { toast } from "sonner";

const MILESTONE_MESSAGES: Record<number, string> = {
  7: "🔥 One week streak! You're building great habits!",
  30: "🔥🔥 30-day streak! You're a consistency machine!",
  100: "🔥🔥🔥 100-day streak! Absolutely legendary!",
  365: "🔥🔥🔥🔥 ONE YEAR STREAK! You are unstoppable!",
};

export function StreakMilestoneToast() {
  const { streakMilestone, setStreakMilestone } = useGamificationStore();

  useEffect(() => {
    if (!streakMilestone) return;

    const message =
      MILESTONE_MESSAGES[streakMilestone] ??
      `🔥 ${streakMilestone}-day streak!`;

    toast(
      <div className="text-center">
        <p className="text-2xl mb-1">🎉</p>
        <p className="font-bold text-lg">Streak Milestone!</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>,
      { duration: 5000 }
    );

    setStreakMilestone(null);
  }, [streakMilestone, setStreakMilestone]);

  return null;
}
