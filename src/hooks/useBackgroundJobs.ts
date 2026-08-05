import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { format, subDays, startOfDay, addDays } from "date-fns";
import { useTimerStore } from "@/stores/timerStore";
import { useTimerSessions } from "@/hooks/useTimerSessions";
import { useQueryClient } from "@tanstack/react-query";

const BG_JOBS_KEY = "studytracker-bg-jobs";

interface BgJobState {
  lastTaskTransitionDate: string | null;
  lastStreakCheckDate: string | null;
}

function getBgState(): BgJobState {
  try {
    const raw = localStorage.getItem(BG_JOBS_KEY);
    return raw ? JSON.parse(raw) : { lastTaskTransitionDate: null, lastStreakCheckDate: null };
  } catch {
    return { lastTaskTransitionDate: null, lastStreakCheckDate: null };
  }
}

function setBgState(state: Partial<BgJobState>) {
  const current = getBgState();
  localStorage.setItem(BG_JOBS_KEY, JSON.stringify({ ...current, ...state }));
}

/**
 * Background automation hook — runs on login/app open and at midnight.
 * - Transitions scheduled tasks (scheduled_date ≤ today) to 'pending'
 * - Checks and updates streak
 * - Detects midnight and splits active timer sessions
 */
export function useBackgroundJobs() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const timerStore = useTimerStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On login / app open
  useEffect(() => {
    if (!user) return;

    const today = format(new Date(), "yyyy-MM-dd");
    const bgState = getBgState();

    // Task transitions: scheduled → pending
    if (bgState.lastTaskTransitionDate !== today) {
      transitionScheduledTasks(user.id, today).then(() => {
        setBgState({ lastTaskTransitionDate: today });
        qc.invalidateQueries({ queryKey: ["tasks"] });
        qc.invalidateQueries({ queryKey: ["today-tasks"] });
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      });
    }

    // Schedule midnight handler using setTimeout (no polling)
    scheduleMidnightHandler(user.id);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user]);

  const scheduleMidnightHandler = (userId: string) => {
    const now = new Date();
    const tomorrow = startOfDay(addDays(now, 1));
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    // Clear any existing timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Schedule the midnight handler
    timeoutRef.current = setTimeout(() => {
      const newDate = format(new Date(), "yyyy-MM-dd");
      handleMidnight(userId, newDate);
      // Schedule next midnight
      scheduleMidnightHandler(userId);
    }, msUntilMidnight);
  };

  const handleMidnight = async (userId: string, newDate: string) => {
    // Transition today's tasks
    await transitionScheduledTasks(userId, newDate);
    setBgState({ lastTaskTransitionDate: newDate });
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["today-tasks"] });
    qc.invalidateQueries({ queryKey: ["dashboard-stats"] });

    // If timer is running, the timer engine handles midnight splitting via useTimerEngine
  };
}

async function transitionScheduledTasks(userId: string, today: string) {
  try {
    await supabase
      .from("tasks")
      .update({ status: "pending" })
      .eq("user_id", userId)
      .eq("status", "scheduled")
      .lte("scheduled_date", today)
      .eq("archived", false);
  } catch (err) {
    console.error("Failed to transition scheduled tasks:", err);
  }
}
