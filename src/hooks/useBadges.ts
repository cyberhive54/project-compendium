import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface BadgeLevel {
  level: number;
  threshold: number;
  count: number;
  xp_reward: number;
}

export interface BadgeDefinition {
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  xp_reward: number;
  unlock_condition: Record<string, unknown>;
  is_default: boolean;
  levels: BadgeLevel[];
  created_at?: string;
}

export interface UserBadge {
  badge_id: string;
  unlocked_at: string;
  badge_level: number;
}

export function useBadges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", user.id)
        .order("unlocked_at", { ascending: false });
      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!user,
  });

  const create = useMutation({
    mutationFn: async (badge: Partial<BadgeDefinition>) => {
      const { data, error } = await supabase
        .from("badges")
        .insert([badge])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success("Badge created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create badge: ${error.message}`);
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, ...badge }: Partial<BadgeDefinition> & { id: string }) => {
      const { data, error } = await supabase
        .from("badges")
        .update(badge)
        .eq("badge_id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success("Badge updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update badge: ${error.message}`);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("badges").delete().eq("badge_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success("Badge deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete badge: ${error.message}`);
    },
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
    create,
    update,
    remove,
  };
}
