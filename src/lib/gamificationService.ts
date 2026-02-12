import { supabase } from "./supabase";
import {
  calculateTaskXP,
  calculateTimerXP,
  calculateLevel,
} from "./xpCalculator";
import { useGamificationStore } from "@/stores/gamificationStore";
import { EXAM_TASK_TYPES } from "@/types/database";

// ─── Award XP for completing a task ─────────────────────────────

export async function awardTaskXP(
  userId: string,
  task: {
    task_type: string;
    actual_duration: number;
    accuracy_percentage: number | null;
  }
) {
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("total_xp, current_streak, current_level")
    .eq("user_id", userId)
    .single();

  if (!profile) return;

  const { data: taskType } = await supabase
    .from("user_task_types")
    .select("base_xp")
    .eq("user_id", userId)
    .eq("name", task.task_type)
    .maybeSingle();

  const isExamType = EXAM_TASK_TYPES.includes(task.task_type);

  const breakdown = calculateTaskXP({
    taskType: task.task_type,
    customBaseXP: taskType?.base_xp,
    durationMinutes: task.actual_duration / 60,
    currentStreak: profile.current_streak,
    accuracyPercentage: task.accuracy_percentage,
    isExamType,
  });

  const newTotalXP = (profile.total_xp || 0) + breakdown.total;
  const newLevel = calculateLevel(newTotalXP);

  await supabase
    .from("user_profiles")
    .update({ total_xp: newTotalXP, lifetime_xp: newTotalXP })
    .eq("user_id", userId);

  const store = useGamificationStore.getState();
  store.setLastXPGain({
    total: breakdown.total,
    breakdown: {
      "Base XP": breakdown.baseXP,
      ...(breakdown.durationBonus > 0
        ? { "Duration Bonus": breakdown.durationBonus }
        : {}),
      ...(breakdown.streakBonus > 0
        ? { "Streak Bonus": breakdown.streakBonus }
        : {}),
      ...(breakdown.examAccuracyBonus > 0
        ? { "Accuracy Bonus": breakdown.examAccuracyBonus }
        : {}),
    },
  });

  if (newLevel > profile.current_level) {
    store.triggerLevelUp(newLevel);
  }

  await checkBadges(userId, newTotalXP);
  return breakdown;
}

// ─── Award XP for timer sessions ────────────────────────────────

export async function awardTimerXP(
  userId: string,
  durationSeconds: number
) {
  if (durationSeconds < 60) return;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("total_xp, current_streak, current_level")
    .eq("user_id", userId)
    .single();

  if (!profile) return;

  const breakdown = calculateTimerXP(durationSeconds, profile.current_streak);
  const newTotalXP = (profile.total_xp || 0) + breakdown.total;
  const newLevel = calculateLevel(newTotalXP);

  await supabase
    .from("user_profiles")
    .update({ total_xp: newTotalXP, lifetime_xp: newTotalXP })
    .eq("user_id", userId);

  const store = useGamificationStore.getState();
  store.setLastXPGain({
    total: breakdown.total,
    breakdown: {
      "Focus XP": breakdown.baseXP,
      ...(breakdown.streakBonus > 0
        ? { "Streak Bonus": breakdown.streakBonus }
        : {}),
    },
  });

  if (newLevel > profile.current_level) {
    store.triggerLevelUp(newLevel);
  }

  return breakdown;
}

// ─── Badge checking engine ──────────────────────────────────────

async function checkBadges(userId: string, currentTotalXP: number) {
  const [{ data: allBadges }, { data: earnedBadges }] = await Promise.all([
    supabase.from("badges").select("*"),
    supabase
      .from("user_badges")
      .select("badge_id, badge_level")
      .eq("user_id", userId),
  ]);

  if (!allBadges) return;

  const earnedIds = new Set(earnedBadges?.map((b) => b.badge_id) ?? []);
  // Helper to get earned level safely
  const getEarnedLevel = (badgeId: string) => {
    const found = (earnedBadges as any[])?.find((b) => b.badge_id === badgeId);
    return found?.badge_level ?? 1;
  };

  const [
    { count: taskCount },
    { data: timerData },
    { data: profile },
    { data: goals },
    { data: examTasks },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "done"),
    supabase
      .from("timer_sessions")
      .select("duration_seconds")
      .eq("user_id", userId)
      .eq("session_type", "focus"),
    supabase
      .from("user_profiles")
      .select("current_streak")
      .eq("user_id", userId)
      .single(),
    supabase
      .from("goals")
      .select("goal_id")
      .eq("user_id", userId)
      .limit(1),
    supabase
      .from("tasks")
      .select("accuracy_percentage")
      .eq("user_id", userId)
      .eq("status", "done")
      .in("task_type", ["test", "mocktest", "exam"])
      .not("accuracy_percentage", "is", null),
  ]);

  const totalHours =
    (timerData ?? []).reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0) /
    3600;
  const completedTasks = taskCount ?? 0;
  const streak = profile?.current_streak ?? 0;
  const bestAccuracy = examTasks?.length
    ? Math.max(...examTasks.map((t) => t.accuracy_percentage!))
    : 0;

  const store = useGamificationStore.getState();
  let xpAccumulator = currentTotalXP;

  /* 
    Enhanced Badge Logic with Levels
  */
  for (const badge of allBadges) {
    // If not multi-level and already earned, skip
    const isMultiLevel = Array.isArray(badge.levels) && badge.levels.length > 0;
    const currentLevel = earnedIds.has(badge.badge_id)
      ? getEarnedLevel(badge.badge_id)
      : 0;

    if (!isMultiLevel && currentLevel > 0) continue;

    const condition = badge.unlock_condition as Record<string, unknown>;
    let metricValue = 0;

    switch (condition.type) {
      case "streak":
        metricValue = streak;
        break;
      case "total_time":
        metricValue = totalHours;
        break;
      case "tasks_completed":
        metricValue = completedTasks;
        break;
      case "exam_accuracy":
        metricValue = bestAccuracy;
        break;
      case "first_goal":
        metricValue = goals?.length ?? 0;
        break;
      case "first_timer_session":
        metricValue = timerData?.length ?? 0;
        break;
      case "first_exam":
        metricValue = examTasks?.length ?? 0;
        break;
    }

    let qualifiedLevel = 0;
    let xpToAward = 0;

    if (isMultiLevel) {
      // Find highest qualified level
      // Assumes levels are sorted or we sort them
      const sortedLevels = [...badge.levels].sort((a: any, b: any) => a.level - b.level);

      for (const level of sortedLevels) {
        if (metricValue >= level.threshold) {
          qualifiedLevel = level.level;
        }
      }

      if (qualifiedLevel > currentLevel) {
        // Calculate XP difference
        const previouslyAwarded = sortedLevels
          .filter((l: any) => l.level <= currentLevel)
          .reduce((sum: number, l: any) => sum + (l.xp_reward || 0), 0);

        const totalAwarded = sortedLevels
          .filter((l: any) => l.level <= qualifiedLevel)
          .reduce((sum: number, l: any) => sum + (l.xp_reward || 0), 0);

        xpToAward = totalAwarded - previouslyAwarded;
      }
    } else {
      // Single level logic
      let threshold = 0;
      // Map condition fields to a generic threshold
      if (condition.days) threshold = condition.days as number;
      else if (condition.hours) threshold = condition.hours as number;
      else if (condition.count) threshold = condition.count as number;
      else if (condition.percentage) threshold = condition.percentage as number;
      // Boolean checks (first_*) imply threshold 1
      else threshold = 1;

      if (metricValue >= threshold) {
        qualifiedLevel = 1;
        xpToAward = badge.xp_reward;
      }
    }

    if (qualifiedLevel > currentLevel) {
      if (currentLevel === 0) {
        // New badge
        const { error } = await supabase
          .from("user_badges")
          .insert({
            user_id: userId,
            badge_id: badge.badge_id,
            badge_level: qualifiedLevel
          });

        if (!error) {
          store.addBadgeUnlock({
            badge_id: badge.badge_id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            category: badge.category,
            tier: badge.tier,
            xp_reward: xpToAward,
          });
        }
      } else {
        // Update existing badge level
        const { error } = await supabase
          .from("user_badges")
          .update({ badge_level: qualifiedLevel, unlocked_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("badge_id", badge.badge_id);

        if (!error) {
          store.addBadgeUnlock({
            badge_id: badge.badge_id,
            name: `${badge.name} (Level ${qualifiedLevel})`,
            description: badge.description,
            icon: badge.icon,
            category: badge.category,
            tier: badge.tier,
            xp_reward: xpToAward,
          });
        }
      }

      if (xpToAward > 0) {
        xpAccumulator += xpToAward;
        await supabase
          .from("user_profiles")
          .update({
            total_xp: xpAccumulator,
            lifetime_xp: xpAccumulator,
          })
          .eq("user_id", userId);
      }
    }
  }
}

// ─── Streak management ──────────────────────────────────────────

export async function updateStreak(userId: string) {
  const { data: profile } = await supabase
    .from("user_profiles")
    .select(
      "current_streak, longest_streak, last_study_date, total_study_days, streak_settings"
    )
    .eq("user_id", userId)
    .single();

  if (!profile) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  if (profile.last_study_date === todayStr) return;

  if (!profile.last_study_date) return; // first-time user, wait for study

  const lastDate = new Date(profile.last_study_date);
  lastDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 1) return; // yesterday or same day — no break

  // Check if all missed days are holidays
  const missedDates: string[] = [];
  for (let i = 1; i < diffDays; i++) {
    const d = new Date(lastDate);
    d.setDate(d.getDate() + i);
    missedDates.push(d.toISOString().split("T")[0]);
  }

  const { data: holidays } = await supabase
    .from("holidays")
    .select("date")
    .eq("user_id", userId)
    .in("date", missedDates);

  const holidayDates = new Set(holidays?.map((h) => h.date) ?? []);
  const allCovered = missedDates.every((d) => holidayDates.has(d));

  if (!allCovered) {
    await supabase
      .from("user_profiles")
      .update({ current_streak: 0 })
      .eq("user_id", userId);
  }
}

export async function recordStudyDay(userId: string) {
  const todayStr = new Date().toISOString().split("T")[0];

  const { data: profile } = await supabase
    .from("user_profiles")
    .select(
      "current_streak, longest_streak, last_study_date, total_study_days, streak_settings"
    )
    .eq("user_id", userId)
    .single();

  if (!profile) return;
  if (profile.last_study_date === todayStr) return;

  const settings = (profile.streak_settings as Record<string, unknown>) ?? {
    min_minutes: 30,
    min_tasks: 1,
    require_all_tasks: false,
    streak_mode: "any",
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [{ data: timerData }, { data: doneTasks }, { data: allTodayTasks }] =
    await Promise.all([
      supabase
        .from("timer_sessions")
        .select("duration_seconds")
        .eq("user_id", userId)
        .eq("session_type", "focus")
        .gte("start_time", todayStart.toISOString())
        .lte("start_time", todayEnd.toISOString()),
      supabase
        .from("tasks")
        .select("task_id")
        .eq("user_id", userId)
        .eq("scheduled_date", todayStr)
        .eq("status", "done"),
      supabase
        .from("tasks")
        .select("task_id")
        .eq("user_id", userId)
        .eq("scheduled_date", todayStr)
        .eq("archived", false),
    ]);

  const totalMinutes =
    (timerData ?? []).reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0) /
    60;
  const tasksCompleted = doneTasks?.length ?? 0;
  const allTasksDone =
    (allTodayTasks?.length ?? 0) > 0 &&
    tasksCompleted >= (allTodayTasks?.length ?? 0);

  let conditionMet = false;
  const minMinutes = (settings.min_minutes as number) ?? 30;
  const minTasks = (settings.min_tasks as number) ?? 1;

  if (settings.streak_mode === "all") {
    conditionMet =
      totalMinutes >= minMinutes && tasksCompleted >= minTasks;
    if (settings.require_all_tasks) conditionMet = conditionMet && allTasksDone;
  } else {
    conditionMet =
      totalMinutes >= minMinutes ||
      tasksCompleted >= minTasks ||
      allTasksDone;
  }

  if (!conditionMet) return;

  const newStreak = (profile.current_streak ?? 0) + 1;
  const newLongest = Math.max(newStreak, profile.longest_streak ?? 0);

  await supabase
    .from("user_profiles")
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_study_date: todayStr,
      total_study_days: (profile.total_study_days ?? 0) + 1,
    })
    .eq("user_id", userId);

  // Streak milestones
  const milestones = [7, 30, 100, 365];
  if (milestones.includes(newStreak)) {
    useGamificationStore.getState().setStreakMilestone(newStreak);
  }

  // Re-check badges after streak update
  const { data: updatedProfile } = await supabase
    .from("user_profiles")
    .select("total_xp")
    .eq("user_id", userId)
    .single();

  if (updatedProfile) {
    await checkBadges(userId, updatedProfile.total_xp);
  }
}
