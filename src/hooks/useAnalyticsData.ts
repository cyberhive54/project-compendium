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
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  subMonths,
  differenceInDays,
  getHours,
  addDays,
} from "date-fns";

export type TimePeriod = "week" | "month" | "all";

export interface AnalyticsSummary {
  timeStudied: number; // minutes
  tasksCompleted: number;
  avgAccuracy: number | null;
  xpEarned: number;
}

export interface AnalyticsFilters {
  projectId?: string | null;
  goalId?: string | null;
}

export function useAnalyticsSummary(period: TimePeriod, filters?: AnalyticsFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics-summary", user?.id, period, filters],
    queryFn: async () => {
      const range = getDateRange(period);

      // Tasks Query
      let taskQ = supabase
        .from("tasks")
        .select("task_id, status, accuracy_percentage, completed_at, goals!inner(project_id)")
        .eq("user_id", user!.id)
        .eq("status", "done");

      if (range) {
        taskQ = taskQ.gte("completed_at", range.start).lte("completed_at", range.end);
      }
      if (filters?.goalId && filters.goalId !== "all") {
        taskQ = taskQ.eq("goal_id", filters.goalId);
      }
      if (filters?.projectId && filters.projectId !== "all") {
        taskQ = taskQ.eq("goals.project_id", filters.projectId);
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

      // Timer sessions Query
      // session -> task -> goal -> project
      let timerQ = supabase
        .from("timer_sessions")
        .select("duration_seconds, tasks!inner(goal_id, goals!inner(project_id))")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null);

      if (range) {
        timerQ = timerQ.gte("start_time", range.start).lte("start_time", range.end);
      }
      if (filters?.goalId && filters.goalId !== "all") {
        timerQ = timerQ.eq("tasks.goal_id", filters.goalId);
      }
      if (filters?.projectId && filters.projectId !== "all") {
        timerQ = timerQ.eq("tasks.goals.project_id", filters.projectId);
      }

      const { data: sessions } = await timerQ;
      const timeStudied = Math.round(
        (sessions ?? []).reduce((s, t) => s + (t.duration_seconds ?? 0), 0) / 60
      );

      // XP - Only show for "all" without filters, otherwise estimate
      let xpEarned = 0;
      const hasFilters = (filters?.projectId && filters.projectId !== "all") || (filters?.goalId && filters.goalId !== "all");

      if (period === "all" && !hasFilters) {
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

export function useScoreTrend(period: TimePeriod, filters?: AnalyticsFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["score-trend", user?.id, period, filters],
    queryFn: async () => {
      const range = getDateRange(period);

      let q = supabase
        .from("tasks")
        .select("completed_at, accuracy_percentage, marks_obtained, total_marks, task_type, goals!inner(project_id)")
        .eq("user_id", user!.id)
        .eq("status", "done")
        .not("accuracy_percentage", "is", null)
        .order("completed_at", { ascending: true });

      if (range) {
        q = q.gte("completed_at", range.start).lte("completed_at", range.end);
      }
      if (filters?.goalId && filters.goalId !== "all") {
        q = q.eq("goal_id", filters.goalId);
      }
      if (filters?.projectId && filters.projectId !== "all") {
        q = q.eq("goals.project_id", filters.projectId);
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

export function useSubjectPerformance(period: TimePeriod, filters?: AnalyticsFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["subject-performance", user?.id, period, filters],
    queryFn: async () => {
      const range = getDateRange(period);

      let q = supabase
        .from("timer_sessions")
        .select("duration_seconds, task_id, tasks!inner(subject_id, goal_id, subjects:subject_id(name, color), goals!inner(project_id))")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null);

      if (range) {
        q = q.gte("start_time", range.start).lte("start_time", range.end);
      }
      if (filters?.goalId && filters.goalId !== "all") {
        q = q.eq("tasks.goal_id", filters.goalId);
      }
      if (filters?.projectId && filters.projectId !== "all") {
        q = q.eq("tasks.goals.project_id", filters.projectId);
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

export function useTimeDistribution(period: TimePeriod, filters?: AnalyticsFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["time-distribution", user?.id, period, filters],
    queryFn: async () => {
      const range = getDateRange(period);

      let q = supabase
        .from("tasks")
        .select("task_type, actual_duration, goals!inner(project_id)")
        .eq("user_id", user!.id)
        .eq("status", "done");

      if (range) {
        q = q.gte("completed_at", range.start).lte("completed_at", range.end);
      }
      if (filters?.goalId && filters.goalId !== "all") {
        q = q.eq("goal_id", filters.goalId);
      }
      if (filters?.projectId && filters.projectId !== "all") {
        q = q.eq("goals.project_id", filters.projectId);
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

export function useStudyHeatmap(filters?: AnalyticsFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["study-heatmap", user?.id, filters],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subMonths(endDate, 6);

      let q = supabase
        .from("timer_sessions")
        .select("start_time, duration_seconds, tasks!inner(goal_id, goals!inner(project_id))")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString());

      if (filters?.goalId && filters.goalId !== "all") {
        q = q.eq("tasks.goal_id", filters.goalId);
      }
      if (filters?.projectId && filters.projectId !== "all") {
        q = q.eq("tasks.goals.project_id", filters.projectId);
      }

      const { data } = await q;

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

// ── Per-Project Analytics ──
export function useProjectAnalytics(projectId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["project-analytics", user?.id, projectId],
    queryFn: async () => {
      // Get all goal IDs for this project
      const { data: goals } = await supabase
        .from("goals")
        .select("goal_id")
        .eq("project_id", projectId!)
        .eq("user_id", user!.id)
        .eq("archived", false);

      const goalIds = (goals ?? []).map((g) => g.goal_id);
      if (!goalIds.length) {
        return { timeStudied: 0, tasksCompleted: 0, totalTasks: 0, avgAccuracy: null };
      }

      // Tasks
      const { data: tasks } = await supabase
        .from("tasks")
        .select("task_id, status, accuracy_percentage")
        .eq("user_id", user!.id)
        .in("goal_id", goalIds)
        .eq("archived", false);

      const allTasks = tasks ?? [];
      const completedTasks = allTasks.filter((t) => t.status === "done");
      const accuracies = completedTasks
        .map((t) => t.accuracy_percentage)
        .filter((a): a is number => a !== null);
      const avgAccuracy =
        accuracies.length > 0
          ? Math.round(accuracies.reduce((s, a) => s + a, 0) / accuracies.length)
          : null;

      // Timer sessions
      const { data: sessions } = await supabase
        .from("timer_sessions")
        .select("duration_seconds, task_id")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null);

      const taskIdSet = new Set(allTasks.map((t) => t.task_id));
      const projectSessions = (sessions ?? []).filter((s) => taskIdSet.has(s.task_id));
      const timeStudied = Math.round(
        projectSessions.reduce((s, t) => s + (t.duration_seconds ?? 0), 0) / 60
      );

      return {
        timeStudied,
        tasksCompleted: completedTasks.length,
        totalTasks: allTasks.length,
        avgAccuracy,
      };
    },
    enabled: !!user && !!projectId,
  });
}

// ── Per-Goal Analytics ──
export function useGoalAnalytics(goalId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["goal-analytics", user?.id, goalId],
    queryFn: async () => {
      // Tasks for this goal
      const { data: tasks } = await supabase
        .from("tasks")
        .select("task_id, status, accuracy_percentage")
        .eq("user_id", user!.id)
        .eq("goal_id", goalId!)
        .eq("archived", false);

      const allTasks = tasks ?? [];
      const completedTasks = allTasks.filter((t) => t.status === "done");
      const accuracies = completedTasks
        .map((t) => t.accuracy_percentage)
        .filter((a): a is number => a !== null);
      const avgAccuracy =
        accuracies.length > 0
          ? Math.round(accuracies.reduce((s, a) => s + a, 0) / accuracies.length)
          : null;

      // Timer sessions
      const { data: sessions } = await supabase
        .from("timer_sessions")
        .select("duration_seconds, task_id")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null);

      const taskIdSet = new Set(allTasks.map((t) => t.task_id));
      const goalSessions = (sessions ?? []).filter((s) => taskIdSet.has(s.task_id));
      const timeStudied = Math.round(
        goalSessions.reduce((s, t) => s + (t.duration_seconds ?? 0), 0) / 60
      );

      return {
        timeStudied,
        tasksCompleted: completedTasks.length,
        totalTasks: allTasks.length,
        avgAccuracy,
      };
    },
    enabled: !!user && !!goalId,
  });
}

// ── 1. Projects Progress ──
export function useProjectsProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["projects-progress", user?.id],
    queryFn: async () => {
      const { data: projects } = await supabase
        .from("projects")
        .select("project_id, name, color, icon, completed, start_date, end_date")
        .eq("user_id", user!.id)
        .eq("archived", false);

      if (!projects?.length) return [];

      const results = [];
      for (const p of projects) {
        const { data: goals } = await supabase
          .from("goals")
          .select("goal_id")
          .eq("project_id", p.project_id)
          .eq("archived", false);

        const goalIds = (goals ?? []).map((g) => g.goal_id);
        let totalTasks = 0;
        let doneTasks = 0;

        if (goalIds.length) {
          const { data: tasks } = await supabase
            .from("tasks")
            .select("status")
            .eq("user_id", user!.id)
            .in("goal_id", goalIds)
            .eq("archived", false);

          totalTasks = tasks?.length ?? 0;
          doneTasks = (tasks ?? []).filter((t) => t.status === "done").length;
        }

        const daysLeft = p.end_date
          ? differenceInDays(new Date(p.end_date), new Date())
          : null;

        results.push({
          id: p.project_id,
          name: p.name,
          color: p.color,
          icon: p.icon,
          completed: p.completed,
          totalTasks,
          doneTasks,
          progress: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
          daysLeft,
        });
      }
      return results;
    },
    enabled: !!user,
  });
}

// ── 2. Goals Progress ──
export function useGoalsProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["goals-progress", user?.id],
    queryFn: async () => {
      const { data: goals } = await supabase
        .from("goals")
        .select("goal_id, name, color, icon, completed, target_date, start_date, end_date, goal_type, project_id")
        .eq("user_id", user!.id)
        .eq("archived", false);

      if (!goals?.length) return [];

      const results = [];
      for (const g of goals) {
        const { data: tasks } = await supabase
          .from("tasks")
          .select("status")
          .eq("goal_id", g.goal_id)
          .eq("user_id", user!.id)
          .eq("archived", false);

        const totalTasks = tasks?.length ?? 0;
        const doneTasks = (tasks ?? []).filter((t) => t.status === "done").length;
        const deadline = g.end_date || g.target_date;
        const daysLeft = deadline ? differenceInDays(new Date(deadline), new Date()) : null;

        results.push({
          id: g.goal_id,
          name: g.name,
          color: g.color,
          icon: g.icon,
          goalType: g.goal_type,
          completed: g.completed,
          totalTasks,
          doneTasks,
          progress: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
          daysLeft,
        });
      }
      return results;
    },
    enabled: !!user,
  });
}

// ── 3. Subjects Progress ──
export function useSubjectsProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["subjects-progress", user?.id],
    queryFn: async () => {
      const { data: subjects } = await supabase
        .from("subjects")
        .select("subject_id, name, color, icon, completed, total_chapters, completed_chapters, goal_id")
        .eq("archived", false);

      if (!subjects?.length) return [];

      // Verify ownership via goals
      const { data: goals } = await supabase
        .from("goals")
        .select("goal_id, name")
        .eq("user_id", user!.id)
        .eq("archived", false);

      const goalMap = new Map((goals ?? []).map((g) => [g.goal_id, g.name]));
      const userSubjects = subjects.filter((s) => goalMap.has(s.goal_id));

      const results = [];
      for (const s of userSubjects) {
        const { data: chapters } = await supabase
          .from("chapters")
          .select("completed")
          .eq("subject_id", s.subject_id)
          .eq("archived", false);

        const totalChapters = chapters?.length ?? s.total_chapters ?? 0;
        const completedChapters = (chapters ?? []).filter((c) => c.completed).length;

        results.push({
          id: s.subject_id,
          name: s.name,
          color: s.color,
          icon: s.icon,
          goalName: goalMap.get(s.goal_id) ?? "—",
          completed: s.completed,
          totalChapters,
          completedChapters,
          progress: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0,
        });
      }
      return results;
    },
    enabled: !!user,
  });
}

// ── 4. Daily Study Breakdown ──
export function useDailyStudyBreakdown() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["daily-study-breakdown", user?.id, format(new Date(), "yyyy-MM-dd")],
    queryFn: async () => {
      const today = new Date();
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();
      const yesterday = subDays(today, 1);
      const yesterdayStart = startOfDay(yesterday).toISOString();
      const yesterdayEnd = endOfDay(yesterday).toISOString();

      // Today's sessions
      const { data: todaySessions } = await supabase
        .from("timer_sessions")
        .select("start_time, duration_seconds")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null)
        .gte("start_time", todayStart)
        .lte("start_time", todayEnd);

      // Yesterday total
      const { data: yesterdaySessions } = await supabase
        .from("timer_sessions")
        .select("duration_seconds")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null)
        .gte("start_time", yesterdayStart)
        .lte("start_time", yesterdayEnd);

      // Today's tasks completed
      const { data: todayTasks } = await supabase
        .from("tasks")
        .select("task_id")
        .eq("user_id", user!.id)
        .eq("status", "done")
        .gte("completed_at", todayStart)
        .lte("completed_at", todayEnd);

      // Hour-by-hour breakdown
      const hourlyMinutes: number[] = Array(24).fill(0);
      for (const s of todaySessions ?? []) {
        const hour = getHours(new Date(s.start_time));
        hourlyMinutes[hour] += Math.round((s.duration_seconds ?? 0) / 60);
      }

      const todayTotal = Math.round(
        (todaySessions ?? []).reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0) / 60
      );
      const yesterdayTotal = Math.round(
        (yesterdaySessions ?? []).reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0) / 60
      );

      return {
        hourlyMinutes,
        todayTotal,
        yesterdayTotal,
        tasksToday: todayTasks?.length ?? 0,
        changePercent: yesterdayTotal > 0
          ? Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100)
          : todayTotal > 0 ? 100 : 0,
      };
    },
    enabled: !!user,
  });
}

// ── 5. Weekly Study Trends ──
export function useWeeklyStudyTrends() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["weekly-study-trends", user?.id, format(new Date(), "yyyy-ww")],
    queryFn: async () => {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      const { data: sessions } = await supabase
        .from("timer_sessions")
        .select("start_time, duration_seconds")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null)
        .gte("start_time", weekStart.toISOString())
        .lte("start_time", weekEnd.toISOString());

      const { data: tasks } = await supabase
        .from("tasks")
        .select("completed_at")
        .eq("user_id", user!.id)
        .eq("status", "done")
        .gte("completed_at", weekStart.toISOString())
        .lte("completed_at", weekEnd.toISOString());

      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      return days.map((d) => {
        const dayKey = format(d, "yyyy-MM-dd");
        const dayLabel = format(d, "EEE");

        const dayMinutes = (sessions ?? [])
          .filter((s) => format(new Date(s.start_time), "yyyy-MM-dd") === dayKey)
          .reduce((sum, s) => sum + Math.round((s.duration_seconds ?? 0) / 60), 0);

        const dayTasks = (tasks ?? [])
          .filter((t) => t.completed_at && format(new Date(t.completed_at), "yyyy-MM-dd") === dayKey)
          .length;

        return { day: dayLabel, date: dayKey, minutes: dayMinutes, tasks: dayTasks };
      });
    },
    enabled: !!user,
  });
}

// ── 6. Consistency Score ──
export function useConsistencyScore(period: TimePeriod) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["consistency-score", user?.id, period],
    queryFn: async () => {
      const range = getDateRange(period);
      const now = new Date();
      let start: Date;
      let end: Date = now;

      if (range) {
        start = new Date(range.start);
        end = new Date(range.end);
      } else {
        // For "all", use last 90 days
        start = subDays(now, 90);
      }

      const { data: sessions } = await supabase
        .from("timer_sessions")
        .select("start_time")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null)
        .gte("start_time", start.toISOString())
        .lte("start_time", end.toISOString());

      const studiedDays = new Set(
        (sessions ?? []).map((s) => format(new Date(s.start_time), "yyyy-MM-dd"))
      );

      const totalDays = Math.max(
        1,
        Math.min(differenceInDays(end, start) + 1, differenceInDays(now, start) + 1)
      );

      return {
        studiedDays: studiedDays.size,
        totalDays,
        score: Math.round((studiedDays.size / totalDays) * 100),
        missedDays: totalDays - studiedDays.size,
      };
    },
    enabled: !!user,
  });
}

// ── 7. Task Discipline ──
export function useTaskDiscipline(period: TimePeriod) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["task-discipline", user?.id, period],
    queryFn: async () => {
      const range = getDateRange(period);

      let q = supabase
        .from("tasks")
        .select("status, is_postponed, scheduled_date, completed_at")
        .eq("user_id", user!.id)
        .eq("archived", false);

      if (range) {
        q = q.or(`scheduled_date.gte.${range.start.split("T")[0]},completed_at.gte.${range.start}`);
      }

      const { data: tasks } = await q;
      const all = tasks ?? [];
      const done = all.filter((t) => t.status === "done");
      const postponed = all.filter((t) => t.is_postponed);

      // On-time: completed on or before scheduled_date
      const onTime = done.filter((t) => {
        if (!t.scheduled_date || !t.completed_at) return false;
        return format(new Date(t.completed_at), "yyyy-MM-dd") <= t.scheduled_date;
      });

      const overdue = all.filter((t) => {
        if (t.status === "done" || t.status === "postponed") return false;
        if (!t.scheduled_date) return false;
        return t.scheduled_date < format(new Date(), "yyyy-MM-dd");
      });

      return {
        totalTasks: all.length,
        completedTasks: done.length,
        onTimeTasks: onTime.length,
        postponedTasks: postponed.length,
        overdueTasks: overdue.length,
        onTimeRate: done.length > 0 ? Math.round((onTime.length / done.length) * 100) : 0,
        postponeRate: all.length > 0 ? Math.round((postponed.length / all.length) * 100) : 0,
      };
    },
    enabled: !!user,
  });
}

// ── 8. Focus Quality ──
export function useFocusQuality(period: TimePeriod) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["focus-quality", user?.id, period],
    queryFn: async () => {
      const range = getDateRange(period);

      let focusQ = supabase
        .from("timer_sessions")
        .select("duration_seconds, paused_duration_seconds, session_type")
        .eq("user_id", user!.id)
        .not("end_time", "is", null);

      if (range) {
        focusQ = focusQ.gte("start_time", range.start).lte("start_time", range.end);
      }

      const { data: sessions } = await focusQ;
      const all = sessions ?? [];
      const focusSessions = all.filter((s) => s.session_type === "focus");
      const breakSessions = all.filter((s) => s.session_type === "break");

      const focusDurations = focusSessions.map((s) => s.duration_seconds ?? 0);
      const totalFocus = focusDurations.reduce((a, b) => a + b, 0);
      const totalBreak = breakSessions.reduce((a, b) => a + (b.duration_seconds ?? 0), 0);
      const totalPaused = focusSessions.reduce((a, b) => a + (b.paused_duration_seconds ?? 0), 0);

      return {
        totalSessions: focusSessions.length,
        avgSessionMinutes: focusSessions.length > 0
          ? Math.round(totalFocus / focusSessions.length / 60)
          : 0,
        longestSessionMinutes: focusDurations.length > 0
          ? Math.round(Math.max(...focusDurations) / 60)
          : 0,
        totalFocusMinutes: Math.round(totalFocus / 60),
        totalBreakMinutes: Math.round(totalBreak / 60),
        focusBreakRatio: totalBreak > 0 ? +(totalFocus / totalBreak).toFixed(1) : totalFocus > 0 ? Infinity : 0,
        avgPausedMinutes: focusSessions.length > 0
          ? Math.round(totalPaused / focusSessions.length / 60)
          : 0,
      };
    },
    enabled: !!user,
  });
}

// ── 9. Peak Study Hours ──
export function usePeakStudyHours(period: TimePeriod) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["peak-study-hours", user?.id, period],
    queryFn: async () => {
      const range = getDateRange(period);

      let q = supabase
        .from("timer_sessions")
        .select("start_time, duration_seconds")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null);

      if (range) {
        q = q.gte("start_time", range.start).lte("start_time", range.end);
      }

      const { data: sessions } = await q;
      const hourlyMinutes: number[] = Array(24).fill(0);

      for (const s of sessions ?? []) {
        const hour = getHours(new Date(s.start_time));
        hourlyMinutes[hour] += Math.round((s.duration_seconds ?? 0) / 60);
      }

      const peakHour = hourlyMinutes.indexOf(Math.max(...hourlyMinutes));

      return {
        hourlyMinutes,
        peakHour,
        peakLabel: `${peakHour.toString().padStart(2, "0")}:00 – ${((peakHour + 1) % 24).toString().padStart(2, "0")}:00`,
      };
    },
    enabled: !!user,
  });
}

// ── 10. Exam Performance ──
export function useExamPerformance(period: TimePeriod) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["exam-performance", user?.id, period],
    queryFn: async () => {
      const range = getDateRange(period);

      let q = supabase
        .from("tasks")
        .select("name, task_type, completed_at, accuracy_percentage, marks_obtained, total_marks, speed_qpm, time_taken_minutes, total_questions, correct_answers, wrong_answers")
        .eq("user_id", user!.id)
        .eq("status", "done")
        .not("total_questions", "is", null)
        .order("completed_at", { ascending: false });

      if (range) {
        q = q.gte("completed_at", range.start).lte("completed_at", range.end);
      }

      const { data: exams } = await q;

      return (exams ?? []).map((e) => ({
        name: e.name,
        type: e.task_type,
        date: e.completed_at ? format(new Date(e.completed_at), "MMM d") : "—",
        accuracy: e.accuracy_percentage,
        marksObtained: e.marks_obtained,
        totalMarks: e.total_marks,
        speed: e.speed_qpm,
        timeTaken: e.time_taken_minutes,
        totalQuestions: e.total_questions,
        correct: e.correct_answers,
        wrong: e.wrong_answers,
      }));
    },
    enabled: !!user,
  });
}

// ── 11. Level & XP Progress ──
export function useLevelProgress() {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ["level-progress", user?.id],
    queryFn: async () => {
      const totalXp = profile?.total_xp ?? 0;
      const currentLevel = profile?.current_level ?? 1;
      // Level formula: level = floor(sqrt(xp / 100)) + 1
      // Reverse: xp for level L = (L-1)^2 * 100
      const xpForCurrentLevel = (currentLevel - 1) ** 2 * 100;
      const xpForNextLevel = currentLevel ** 2 * 100;
      const xpInLevel = totalXp - xpForCurrentLevel;
      const xpNeeded = xpForNextLevel - xpForCurrentLevel;

      // Recent badges
      const { data: recentBadges } = await supabase
        .from("user_badges")
        .select("badge_id, unlocked_at, badges(name, icon, tier)")
        .eq("user_id", user!.id)
        .order("unlocked_at", { ascending: false })
        .limit(5);

      return {
        totalXp,
        currentLevel,
        xpInLevel,
        xpNeeded,
        progressPercent: xpNeeded > 0 ? Math.round((xpInLevel / xpNeeded) * 100) : 100,
        recentBadges: (recentBadges ?? []).map((b: any) => ({
          id: b.badge_id,
          name: b.badges?.name ?? b.badge_id,
          icon: b.badges?.icon ?? "🏅",
          tier: b.badges?.tier ?? "bronze",
          unlockedAt: b.unlocked_at,
        })),
      };
    },
    enabled: !!user,
  });
}

// ── 12. Task Completion Rate ──
export function useTaskCompletionRate(period: TimePeriod) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["task-completion-rate", user?.id, period],
    queryFn: async () => {
      const range = getDateRange(period);

      let q = supabase
        .from("tasks")
        .select("status")
        .eq("user_id", user!.id)
        .eq("archived", false);

      if (range) {
        q = q.or(`scheduled_date.gte.${range.start.split("T")[0]},completed_at.gte.${range.start}`);
      }

      const { data: tasks } = await q;
      const all = tasks ?? [];

      const statusCounts: Record<string, number> = {};
      for (const t of all) {
        statusCounts[t.status] = (statusCounts[t.status] ?? 0) + 1;
      }

      const colors: Record<string, string> = {
        done: "#22C55E",
        in_progress: "#3B82F6",
        scheduled: "#8B5CF6",
        pending: "#F59E0B",
        postponed: "#EF4444",
      };

      return {
        total: all.length,
        segments: Object.entries(statusCounts).map(([status, count]) => ({
          label: status.replace("_", " "),
          value: count,
          color: colors[status] ?? "#6B7280",
        })),
      };
    },
    enabled: !!user,
  });
}

// ── 13. Estimated vs Actual Duration ──
export function useEstimatedVsActual(period: TimePeriod) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["estimated-vs-actual", user?.id, period],
    queryFn: async () => {
      const range = getDateRange(period);

      let q = supabase
        .from("tasks")
        .select("task_type, estimated_duration, actual_duration")
        .eq("user_id", user!.id)
        .eq("status", "done")
        .not("estimated_duration", "is", null)
        .gt("actual_duration", 0);

      if (range) {
        q = q.gte("completed_at", range.start).lte("completed_at", range.end);
      }

      const { data: tasks } = await q;

      const byType: Record<string, { estimated: number; actual: number; count: number }> = {};
      for (const t of tasks ?? []) {
        const key = t.task_type || "other";
        if (!byType[key]) byType[key] = { estimated: 0, actual: 0, count: 0 };
        byType[key].estimated += t.estimated_duration ?? 0;
        byType[key].actual += t.actual_duration ?? 0;
        byType[key].count += 1;
      }

      const totalEstimated = (tasks ?? []).reduce((s, t) => s + (t.estimated_duration ?? 0), 0);
      const totalActual = (tasks ?? []).reduce((s, t) => s + (t.actual_duration ?? 0), 0);

      return {
        byType: Object.entries(byType).map(([type, data]) => ({
          type,
          avgEstimated: Math.round(data.estimated / data.count),
          avgActual: Math.round(data.actual / data.count),
        })),
        totalEstimated,
        totalActual,
        accuracyPercent:
          totalEstimated > 0
            ? Math.round((1 - Math.abs(totalActual - totalEstimated) / totalEstimated) * 100)
            : 0,
      };
    },
    enabled: !!user,
  });
}

// ── 14. Pomodoro Stats ──
export function usePomodoroStats(period: TimePeriod) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pomodoro-stats", user?.id, period],
    queryFn: async () => {
      const range = getDateRange(period);

      let q = supabase
        .from("timer_sessions")
        .select("is_pomodoro, pomodoro_cycle, duration_seconds, session_type")
        .eq("user_id", user!.id)
        .not("end_time", "is", null);

      if (range) {
        q = q.gte("start_time", range.start).lte("start_time", range.end);
      }

      const { data: sessions } = await q;
      const all = sessions ?? [];
      const pomoSessions = all.filter((s) => s.is_pomodoro && s.session_type === "focus");
      const totalSessions = all.filter((s) => s.session_type === "focus");

      const totalCycles = pomoSessions.reduce((s, p) => s + (p.pomodoro_cycle ?? 0), 0);
      const totalPomoMinutes = Math.round(
        pomoSessions.reduce((s, p) => s + (p.duration_seconds ?? 0), 0) / 60
      );

      return {
        totalPomoSessions: pomoSessions.length,
        totalCycles,
        avgCyclesPerSession: pomoSessions.length > 0
          ? +(totalCycles / pomoSessions.length).toFixed(1)
          : 0,
        totalPomoMinutes,
        pomoRate: totalSessions.length > 0
          ? Math.round((pomoSessions.length / totalSessions.length) * 100)
          : 0,
      };
    },
    enabled: !!user,
  });
}

// ─── Monthly Trends (dual-line: study hours + task completions) ─────────────
export function useMonthlyTrends() {
  const { user } = useAuth();
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const today = format(now, "yyyy-MM-dd");

  return useQuery({
    queryKey: ["monthly-trends", user?.id, monthStart],
    queryFn: async () => {
      if (!user) return [];

      const days = eachDayOfInterval({
        start: startOfMonth(now),
        end: now,
      });

      // Fetch timer sessions for the month
      const { data: sessions } = await supabase
        .from("timer_sessions")
        .select("start_time, duration_seconds, session_type")
        .eq("user_id", user.id)
        .gte("start_time", startOfMonth(now).toISOString())
        .lte("start_time", endOfDay(now).toISOString())
        .eq("session_type", "focus");

      // Fetch completed tasks for the month
      const { data: tasks } = await supabase
        .from("tasks")
        .select("completed_at")
        .eq("user_id", user.id)
        .eq("status", "done")
        .gte("completed_at", startOfMonth(now).toISOString())
        .lte("completed_at", endOfDay(now).toISOString());

      // Build per-day map
      const sessionsByDay: Record<string, number> = {};
      for (const s of sessions ?? []) {
        const d = format(new Date(s.start_time), "yyyy-MM-dd");
        sessionsByDay[d] = (sessionsByDay[d] ?? 0) + (s.duration_seconds ?? 0);
      }

      const tasksByDay: Record<string, number> = {};
      for (const t of tasks ?? []) {
        if (!t.completed_at) continue;
        const d = format(new Date(t.completed_at), "yyyy-MM-dd");
        tasksByDay[d] = (tasksByDay[d] ?? 0) + 1;
      }

      return days.map((d) => {
        const key = format(d, "yyyy-MM-dd");
        return {
          date: key,
          day: d.getDate(),
          studyMinutes: Math.round((sessionsByDay[key] ?? 0) / 60),
          tasksCompleted: tasksByDay[key] ?? 0,
        };
      });
    },
    enabled: !!user,
  });
}
