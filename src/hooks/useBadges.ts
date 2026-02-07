import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export interface BadgeDefinition {
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  xp_reward: number;
  unlock_condition: Record<string, unknown>;
}

export interface UserBadge {
  badge_id: string;
  unlocked_at: string;
}

export interface BadgeProgress {
  badge: BadgeDefinition;
  earned: boolean;
  unlockedAt?: string;
  progressPercent: number;
  progressLabel: string;
}

export function useBadges() {
  const { user } = useAuth();

  const allBadgesQuery = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("category")
        .order("tier");
      if (error) throw error;
      return data as BadgeDefinition[];
    },
  });

  const userBadgesQuery = useQuery({
    queryKey: ["user-badges", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", user!.id)
        .order("unlocked_at", { ascending: false });
      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!user,
  });

  const earnedBadgeIds = new Set(
    userBadgesQuery.data?.map((b) => b.badge_id) ?? []
  );
  const earnedMap = new Map(
    userBadgesQuery.data?.map((b) => [b.badge_id, b.unlocked_at]) ?? []
  );

  return {
    allBadges: allBadgesQuery.data ?? [],
    userBadges: userBadgesQuery.data ?? [],
    earnedBadgeIds,
    earnedMap,
    isLoading: allBadgesQuery.isLoading || userBadgesQuery.isLoading,
  };
}
