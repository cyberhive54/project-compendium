import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export interface TimerSession {
  session_id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  session_type: "focus" | "break";
  is_pomodoro: boolean;
  pomodoro_cycle: number | null;
  paused_duration_seconds: number;
  synced: boolean;
  created_at: string;
}

/**
 * Split a timer session at midnight boundaries.
 * If a session spans midnight, it creates multiple records — one per calendar day.
 */
function splitAtMidnight(
  taskId: string,
  userId: string,
  startMs: number,
  endMs: number,
  sessionType: "focus" | "break",
  isPomodoro: boolean,
  cycle: number | null,
  pausedSeconds: number
): Array<{
  task_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  session_type: string;
  is_pomodoro: boolean;
  pomodoro_cycle: number | null;
  paused_duration_seconds: number;
}> {
  const records: Array<{
    task_id: string;
    user_id: string;
    start_time: string;
    end_time: string;
    session_type: string;
    is_pomodoro: boolean;
    pomodoro_cycle: number | null;
    paused_duration_seconds: number;
  }> = [];

  let currentStart = startMs;

  while (currentStart < endMs) {
    // Find next midnight
    const startDate = new Date(currentStart);
    const nextMidnight = new Date(startDate);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);

    const segmentEnd = Math.min(nextMidnight.getTime(), endMs);

    records.push({
      task_id: taskId,
      user_id: userId,
      start_time: new Date(currentStart).toISOString(),
      end_time: new Date(segmentEnd).toISOString(),
      session_type: sessionType,
      is_pomodoro: isPomodoro,
      pomodoro_cycle: cycle,
      // Only attribute paused time to the first segment
      paused_duration_seconds: records.length === 0 ? pausedSeconds : 0,
    });

    currentStart = segmentEnd;
  }

  return records;
}

export function useTimerSessions(taskId?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const sessions = useQuery({
    queryKey: ["timer-sessions", taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const { data, error } = await supabase
        .from("timer_sessions")
        .select("*")
        .eq("task_id", taskId)
        .order("start_time", { ascending: false });
      if (error) throw error;
      return data as TimerSession[];
    },
    enabled: !!user && !!taskId,
  });

  const saveSession = useMutation({
    mutationFn: async (input: {
      taskId: string;
      startTime: number;
      endTime: number;
      mode: "focus" | "break";
      isPomodoroMode: boolean;
      cycle: number;
      pausedDurationSeconds: number;
    }) => {
      const records = splitAtMidnight(
        input.taskId,
        user!.id,
        input.startTime,
        input.endTime,
        input.mode,
        input.isPomodoroMode,
        input.isPomodoroMode ? input.cycle : null,
        input.pausedDurationSeconds
      );

      const { error } = await supabase.from("timer_sessions").insert(records);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timer-sessions"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  return { sessions, saveSession };
}
