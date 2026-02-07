import { create } from "zustand";

export interface UnlockedBadge {
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  xp_reward: number;
}

interface GamificationState {
  // Level up celebration
  showLevelUp: boolean;
  newLevel: number;

  // Badge unlock queue
  pendingBadges: UnlockedBadge[];

  // XP gain display
  lastXPGain: { total: number; breakdown: Record<string, number> } | null;

  // Streak milestone
  streakMilestone: number | null;

  // Actions
  triggerLevelUp: (level: number) => void;
  dismissLevelUp: () => void;
  addBadgeUnlock: (badge: UnlockedBadge) => void;
  popBadge: () => UnlockedBadge | undefined;
  setLastXPGain: (
    gain: { total: number; breakdown: Record<string, number> } | null
  ) => void;
  setStreakMilestone: (days: number | null) => void;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  showLevelUp: false,
  newLevel: 1,
  pendingBadges: [],
  lastXPGain: null,
  streakMilestone: null,

  triggerLevelUp: (level) => set({ showLevelUp: true, newLevel: level }),
  dismissLevelUp: () => set({ showLevelUp: false }),

  addBadgeUnlock: (badge) =>
    set((s) => ({ pendingBadges: [...s.pendingBadges, badge] })),
  popBadge: () => {
    const state = get();
    if (state.pendingBadges.length === 0) return undefined;
    const [first, ...rest] = state.pendingBadges;
    set({ pendingBadges: rest });
    return first;
  },

  setLastXPGain: (gain) => set({ lastXPGain: gain }),
  setStreakMilestone: (days) => set({ streakMilestone: days }),
}));
