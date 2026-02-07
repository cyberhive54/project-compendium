// XP Calculation Logic
// baseXP (by task type) + duration bonus + streak bonus + exam accuracy bonus

export interface XPBreakdown {
  baseXP: number;
  durationBonus: number;
  streakBonus: number;
  examAccuracyBonus: number;
  total: number;
}

const DEFAULT_BASE_XP: Record<string, number> = {
  notes: 30,
  lecture: 40,
  revision: 50,
  practice: 60,
  test: 80,
  mocktest: 100,
  exam: 120,
};

export function calculateTaskXP(params: {
  taskType: string;
  customBaseXP?: number;
  durationMinutes?: number;
  currentStreak?: number;
  accuracyPercentage?: number | null;
  isExamType?: boolean;
}): XPBreakdown {
  const {
    taskType,
    customBaseXP,
    durationMinutes = 0,
    currentStreak = 0,
    accuracyPercentage,
    isExamType = false,
  } = params;

  const baseXP = customBaseXP ?? DEFAULT_BASE_XP[taskType] ?? 50;

  // Duration bonus: 1 XP per minute studied (capped at 120)
  const durationBonus = Math.min(Math.round(durationMinutes), 120);

  // Streak bonus: 5% per streak day (capped at 100% = 20 days)
  const streakMultiplier = Math.min(currentStreak * 0.05, 1.0);
  const streakBonus = Math.round(baseXP * streakMultiplier);

  // Exam accuracy bonus (only for exam types)
  let examAccuracyBonus = 0;
  if (isExamType && accuracyPercentage != null) {
    if (accuracyPercentage >= 90) examAccuracyBonus = 100;
    else if (accuracyPercentage >= 75) examAccuracyBonus = 60;
    else if (accuracyPercentage >= 50) examAccuracyBonus = 30;
    else examAccuracyBonus = 10;
  }

  const total = baseXP + durationBonus + streakBonus + examAccuracyBonus;

  return { baseXP, durationBonus, streakBonus, examAccuracyBonus, total };
}

export function calculateTimerXP(
  durationSeconds: number,
  currentStreak: number = 0
): XPBreakdown {
  const minutes = durationSeconds / 60;
  const baseXP = Math.round(minutes);
  const streakMultiplier = Math.min(currentStreak * 0.05, 1.0);
  const streakBonus = Math.round(baseXP * streakMultiplier);

  return {
    baseXP,
    durationBonus: 0,
    streakBonus,
    examAccuracyBonus: 0,
    total: baseXP + streakBonus,
  };
}

export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}
