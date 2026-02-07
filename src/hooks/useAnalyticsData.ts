import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subMonths,
} from "date-fns";

export type TimePeriod = "week" | "month" | "all";

export interface AnalyticsSummary {
  timeStudied: number; // minutes
  tasksCompleted: number;
  avgAccuracy: number | null;
  xpEarned: number;
}

export function useAnalyticsSummary(period: TimePeriod) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics-summary", user?.id, period],
    queryFn: async () => {
      const range = getDateRange(period);

      // Tasks
      let taskQ = supabase
        .from("tasks")
        .select("task_id, status, accuracy_percentage, completed_at")
        .eq("user_id", user!.id)
        .eq("status", "done");

      if (range) {
        taskQ = taskQ.gte("completed_at", range.start).lte("completed_at", range.end);
      }

      const { data: tasks } = await taskQ;
      const tasksCompleted = tasks?.length ?? 0;
      const accuracies = (tasks ?? [])
        .map((t) => t.accuracy_percentage)
        .filter((a): a is number => a !== null);
      const avgAccuracy =
        accuracies.length > 0
          ? Math.round(accuracies.reduce((s, a) => s + a, 0) / accuracies.length)
          : null;

      // Timer sessions
      let timerQ = supabase
        .from("timer_sessions")
        .select("duration_seconds")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null);

      if (range) {
        timerQ = timerQ.gte("start_time", range.start).lte("start_time", range.end);
      }

      const { data: sessions } = await timerQ;
      const timeStudied = Math.round(
        (sessions ?? []).reduce((s, t) => s + (t.duration_seconds ?? 0), 0) / 60
      );

      // XP - get from profile for all-time, else estimate
      let xpEarned = 0;
      if (period === "all") {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("total_xp")
          .eq("user_id", user!.id)
          .maybeSingle();
        xpEarned = profile?.total_xp ?? 0;
      } else {
        // Estimate: tasks completed * average 50 XP
        xpEarned = tasksCompleted * 50 + Math.round(timeStudied * 2);
      }

      return { timeStudied, tasksCompleted, avgAccuracy, xpEarned } as AnalyticsSummary;
    },
    enabled: !!user,
  });
}

export function useScoreTrend(period: TimePeriod) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["score-trend", user?.id, period],
    queryFn: async () => {
      const range = getDateRange(period);

      let q = supabase
        .from("tasks")
        .select("completed_at, accuracy_percentage, marks_obtained, total_marks, task_type")
        .eq("user_id", user!.id)
        .eq("status", "done")
        .not("accuracy_percentage", "is", null)
        .order("completed_at", { ascending: true });

      if (range) {
        q = q.gte("completed_at", range.start).lte("completed_at", range.end);
      }

      const { data } = await q;
      return (data ?? []).map((t) => ({
        date: t.completed_at ? format(new Date(t.completed_at), "MMM d") : "",
        accuracy: t.accuracy_percentage ?? 0,
        score: t.marks_obtained ?? 0,
        maxScore: t.total_marks ?? 0,
        type: t.task_type,
      }));
    },
    enabled: !!user,
  });
}

export function useSubjectPerformance(period: TimePeriod) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["subject-performance", user?.id, period],
    queryFn: async () => {
      const range = getDateRange(period);

      let q = supabase
        .from("timer_sessions")
        .select("duration_seconds, task_id, tasks!inner(subject_id, subjects:subject_id(name, color))")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null);

      if (range) {
        q = q.gte("start_time", range.start).lte("start_time", range.end);
      }

      const { data } = await q;
      const bySubject: Record<string, { name: string; color: string; minutes: number }> = {};

      for (const s of data ?? []) {
        const task = (s as any).tasks;
        const subject = task?.subjects;
        if (!subject) continue;
        const key = subject.name;
        if (!bySubject[key]) {
          bySubject[key] = { name: subject.name, color: subject.color || "#3B82F6", minutes: 0 };
        }
        bySubject[key].minutes += Math.round((s.duration_seconds ?? 0) / 60);
      }

      return Object.values(bySubject).sort((a, b) => b.minutes - a.minutes);
    },
    enabled: !!user,
  });
}

export function useTimeDistribution(period: TimePeriod) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["time-distribution", user?.id, period],
    queryFn: async () => {
      const range = getDateRange(period);

      let q = supabase
        .from("tasks")
        .select("task_type, actual_duration")
        .eq("user_id", user!.id)
        .eq("status", "done");

      if (range) {
        q = q.gte("completed_at", range.start).lte("completed_at", range.end);
      }

      const { data } = await q;
      const byType: Record<string, number> = {};

      for (const t of data ?? []) {
        const key = t.task_type || "other";
        byType[key] = (byType[key] ?? 0) + (t.actual_duration ?? 0);
      }

      const colors = ["#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#EC4899"];
      return Object.entries(byType).map(([type, minutes], i) => ({
        name: type,
        value: Math.round(minutes / 60),
        fill: colors[i % colors.length],
      }));
    },
    enabled: !!user,
  });
}

export function useStudyHeatmap() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["study-heatmap", user?.id],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subMonths(endDate, 6);

      const { data } = await supabase
        .from("timer_sessions")
        .select("start_time, duration_seconds")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString());

      const dailyMap: Record<string, number> = {};
      for (const s of data ?? []) {
        const day = format(new Date(s.start_time), "yyyy-MM-dd");
        dailyMap[day] = (dailyMap[day] ?? 0) + Math.round((s.duration_seconds ?? 0) / 60);
      }

      const allDays = eachDayOfInterval({ start: startDate, end: endDate });
      return allDays.map((d) => {
        const key = format(d, "yyyy-MM-dd");
        return {
          date: key,
          day: format(d, "EEE"),
          week: Math.floor((d.getTime() - startDate.getTime()) / (7 * 86400000)),
          minutes: dailyMap[key] ?? 0,
        };
      });
    },
    enabled: !!user,
  });
}

export function useStreakHistory() {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ["streak-history", user?.id],
    queryFn: async () => {
      // Get daily study data for last 30 days
      const days: { date: string; studied: boolean; minutes: number }[] = [];
      const endDate = new Date();

      const { data: sessions } = await supabase
        .from("timer_sessions")
        .select("start_time, duration_seconds")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null)
        .gte("start_time", subDays(endDate, 30).toISOString())
        .lte("start_time", endDate.toISOString());

      const dailyMinutes: Record<string, number> = {};
      for (const s of sessions ?? []) {
        const day = format(new Date(s.start_time), "yyyy-MM-dd");
        dailyMinutes[day] = (dailyMinutes[day] ?? 0) + Math.round((s.duration_seconds ?? 0) / 60);
      }

      for (let i = 30; i >= 0; i--) {
        const d = subDays(endDate, i);
        const key = format(d, "yyyy-MM-dd");
        const mins = dailyMinutes[key] ?? 0;
        days.push({
          date: format(d, "MMM d"),
          studied: mins > 0,
          minutes: mins,
        });
      }

      return {
        currentStreak: profile?.current_streak ?? 0,
        longestStreak: profile?.longest_streak ?? 0,
        days,
      };
    },
    enabled: !!user,
  });
}

export function useSessionPerformance(period: TimePeriod) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["session-performance", user?.id, period],
    queryFn: async () => {
      const range = getDateRange(period);

      // Get study session configs
      const { data: configs } = await supabase
        .from("study_sessions_config")
        .select("*")
        .eq("user_id", user!.id);

      if (!configs?.length) return { avgBySession: [], tasksBySession: [] };

      // Get tasks with preferred_session_id
      let taskQ = supabase
        .from("tasks")
        .select("task_id, status, preferred_session_id")
        .eq("user_id", user!.id)
        .eq("status", "done")
        .not("preferred_session_id", "is", null);

      if (range) {
        taskQ = taskQ.gte("completed_at", range.start).lte("completed_at", range.end);
      }

      const { data: tasks } = await taskQ;

      const tasksBySession = configs.map((c) => {
        const count = (tasks ?? []).filter((t) => t.preferred_session_id === c.session_config_id).length;
        return { name: c.name, value: count, color: c.color };
      });

      return { avgBySession: [], tasksBySession };
    },
    enabled: !!user,
  });
}

function getDateRange(period: TimePeriod): { start: string; end: string } | null {
  const now = new Date();
  switch (period) {
    case "week":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        end: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      };
    case "month":
      return {
        start: startOfMonth(now).toISOString(),
        end: endOfMonth(now).toISOString(),
      };
    case "all":
      return null;
  }
}
