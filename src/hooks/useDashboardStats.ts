import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } from "date-fns";

export interface DashboardStats {
  timeStudiedToday: number; // in minutes
  tasksDoneToday: number;
  totalTasksToday: number;
  currentStreak: number;
  adherencePercent: number | null;
}

export function useDashboardStats() {
  const { user, profile } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  const statsQuery = useQuery({
    queryKey: ["dashboard-stats", user?.id, today],
    queryFn: async () => {
      // Get today's tasks
      const { data: todayTasks } = await supabase
        .from("tasks")
        .select("task_id, status, scheduled_date")
        .eq("user_id", user!.id)
        .eq("scheduled_date", today)
        .eq("archived", false);

      const totalTasksToday = todayTasks?.length ?? 0;
      const tasksDoneToday = todayTasks?.filter((t) => t.status === "done").length ?? 0;

      // Get today's timer sessions for time studied
      const todayStart = startOfDay(new Date()).toISOString();
      const todayEnd = endOfDay(new Date()).toISOString();

      const { data: timerSessions } = await supabase
        .from("timer_sessions")
        .select("duration_seconds")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null)
        .gte("start_time", todayStart)
        .lte("start_time", todayEnd);

      const timeStudiedToday = (timerSessions ?? []).reduce(
        (acc, s) => acc + (s.duration_seconds ?? 0),
        0
      ) / 60;

      // Calculate weekly adherence
      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
      const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

      const { data: weekTasks } = await supabase
        .from("tasks")
        .select("task_id, status, scheduled_date")
        .eq("user_id", user!.id)
        .eq("archived", false)
        .gte("scheduled_date", weekStart)
        .lte("scheduled_date", weekEnd);

      const totalWeekScheduled = weekTasks?.length ?? 0;
      const weekDone = weekTasks?.filter((t) => t.status === "done").length ?? 0;
      const adherencePercent = totalWeekScheduled > 0
        ? Math.round((weekDone / totalWeekScheduled) * 100)
        : null;

      return {
        timeStudiedToday: Math.round(timeStudiedToday),
        tasksDoneToday,
        totalTasksToday,
        currentStreak: profile?.current_streak ?? 0,
        adherencePercent,
      } as DashboardStats;
    },
    enabled: !!user,
    refetchInterval: 60000, // refresh every minute
  });

  return statsQuery;
}

export function useTodayTasks() {
  const { user } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["today-tasks", user?.id, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user!.id)
        .eq("scheduled_date", today)
        .eq("archived", false)
        .order("priority_number", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useUpcomingTasks() {
  const { user } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");
  const nextWeek = format(subDays(new Date(), -7), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["upcoming-tasks", user?.id, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user!.id)
        .eq("archived", false)
        .neq("status", "done")
        .gt("scheduled_date", today)
        .lte("scheduled_date", nextWeek)
        .order("scheduled_date", { ascending: true })
        .order("priority_number", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useRecentActivity() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recent-activity", user?.id],
    queryFn: async () => {
      // Fetch recently completed tasks
      const { data: recentDone } = await supabase
        .from("tasks")
        .select("task_id, name, completed_at, task_type")
        .eq("user_id", user!.id)
        .eq("status", "done")
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(5);

      // Fetch recent timer sessions
      const { data: recentTimers } = await supabase
        .from("timer_sessions")
        .select("session_id, duration_seconds, start_time, task_id")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null)
        .order("start_time", { ascending: false })
        .limit(5);

      type Activity = {
        id: string;
        type: "task_done" | "timer_session";
        title: string;
        subtitle: string;
        timestamp: string;
      };

      const activities: Activity[] = [];

      (recentDone ?? []).forEach((t) => {
        activities.push({
          id: t.task_id,
          type: "task_done",
          title: `Completed: ${t.name}`,
          subtitle: t.task_type,
          timestamp: t.completed_at!,
        });
      });

      (recentTimers ?? []).forEach((s) => {
        const mins = Math.round((s.duration_seconds ?? 0) / 60);
        activities.push({
          id: s.session_id,
          type: "timer_session",
          title: `Studied for ${mins} min`,
          subtitle: "Focus session",
          timestamp: s.start_time,
        });
      });

      // Sort by timestamp desc, take 10
      activities.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return activities.slice(0, 10);
    },
    enabled: !!user,
  });
}

export function useActiveStudySession() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["active-study-session", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_sessions_config")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_active", true);

      if (error) throw error;
      if (!data?.length) return null;

      const now = new Date();
      const currentTime = format(now, "HH:mm:ss");
      const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon, 7=Sun

      for (const session of data) {
        if (!session.days_of_week?.includes(currentDay)) continue;

        const { start_time, end_time, is_overnight } = session;

        if (is_overnight) {
          // Overnight: active if current >= start OR current <= end
          if (currentTime >= start_time || currentTime <= end_time) {
            return session;
          }
        } else {
          if (currentTime >= start_time && currentTime <= end_time) {
            return session;
          }
        }
      }

      return null;
    },
    enabled: !!user,
    refetchInterval: 60000,
  });
}
