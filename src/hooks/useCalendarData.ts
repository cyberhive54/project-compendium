import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";
import type { Task, StudySessionConfig } from "@/types/database";

export interface DaySummary {
  date: string;
  taskCount: number;
  doneTasks: number;
  pendingTasks: number;
  postponedTasks: number;
  timeStudiedMinutes: number;
  subjectColors: string[];
  isHoliday: boolean;
  holidayReason?: string;
}

export function useCalendarTasks(startDate: string, endDate: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["calendar-tasks", user?.id, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, subjects:subject_id(color, name)")
        .eq("user_id", user!.id)
        .eq("archived", false)
        .gte("scheduled_date", startDate)
        .lte("scheduled_date", endDate)
        .order("priority_number", { ascending: false });

      if (error) throw error;
      return (data ?? []) as (Task & { subjects?: { color: string; name: string } | null })[];
    },
    enabled: !!user,
  });
}

export function useCalendarTimerSessions(startDate: string, endDate: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["calendar-timer-sessions", user?.id, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("timer_sessions")
        .select("session_id, start_time, end_time, duration_seconds, session_type, task_id")
        .eq("user_id", user!.id)
        .eq("session_type", "focus")
        .not("end_time", "is", null)
        .gte("start_time", new Date(startDate).toISOString())
        .lte("start_time", new Date(endDate + "T23:59:59").toISOString());

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useStudySessions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["study-sessions-config", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_sessions_config")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .order("start_time", { ascending: true });

      if (error) throw error;
      return (data ?? []) as StudySessionConfig[];
    },
    enabled: !!user,
  });
}

export function useCalendarHolidays(startDate: string, endDate: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["calendar-holidays", user?.id, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("holidays")
        .select("*")
        .eq("user_id", user!.id)
        .gte("date", startDate)
        .lte("date", endDate);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function buildDaySummaries(
  tasks: (Task & { subjects?: { color: string; name: string } | null })[],
  timerSessions: { start_time: string; duration_seconds: number | null }[],
  holidays: { date: string; reason: string | null }[],
  startDate: string,
  endDate: string
): Record<string, DaySummary> {
  const summaries: Record<string, DaySummary> = {};

  // Initialize each day
  let d = new Date(startDate);
  const end = new Date(endDate);
  while (d <= end) {
    const key = format(d, "yyyy-MM-dd");
    summaries[key] = {
      date: key,
      taskCount: 0,
      doneTasks: 0,
      pendingTasks: 0,
      postponedTasks: 0,
      timeStudiedMinutes: 0,
      subjectColors: [],
      isHoliday: false,
    };
    d = addDays(d, 1);
  }

  // Aggregate tasks
  for (const task of tasks) {
    if (!task.scheduled_date) continue;
    const key = task.scheduled_date;
    if (!summaries[key]) continue;

    summaries[key].taskCount++;
    if (task.status === "done") summaries[key].doneTasks++;
    else if (task.status === "postponed") summaries[key].postponedTasks++;
    else summaries[key].pendingTasks++;

    const color = task.subjects?.color;
    if (color && !summaries[key].subjectColors.includes(color)) {
      summaries[key].subjectColors.push(color);
    }
  }

  // Aggregate timer sessions
  for (const session of timerSessions) {
    const key = format(new Date(session.start_time), "yyyy-MM-dd");
    if (!summaries[key]) continue;
    summaries[key].timeStudiedMinutes += Math.round((session.duration_seconds ?? 0) / 60);
  }

  // Mark holidays
  for (const h of holidays) {
    if (summaries[h.date]) {
      summaries[h.date].isHoliday = true;
      summaries[h.date].holidayReason = h.reason ?? undefined;
    }
  }

  return summaries;
}

export function calculateAdherence(
  tasks: Task[],
  startDate: string,
  endDate: string
): { total: number; done: number; percent: number | null; daily: Record<string, { total: number; done: number }> } {
  const daily: Record<string, { total: number; done: number }> = {};

  let d = new Date(startDate);
  const end = new Date(endDate);
  while (d <= end) {
    daily[format(d, "yyyy-MM-dd")] = { total: 0, done: 0 };
    d = addDays(d, 1);
  }

  for (const task of tasks) {
    if (!task.scheduled_date) continue;
    const key = task.scheduled_date;
    if (!daily[key]) continue;
    daily[key].total++;
    if (task.status === "done") daily[key].done++;
  }

  const total = Object.values(daily).reduce((s, d) => s + d.total, 0);
  const done = Object.values(daily).reduce((s, d) => s + d.done, 0);

  return {
    total,
    done,
    percent: total > 0 ? Math.round((done / total) * 100) : null,
    daily,
  };
}
