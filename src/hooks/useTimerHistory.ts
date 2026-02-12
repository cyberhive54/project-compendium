import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { TimerSession } from "./useTimerSessions";

export interface TimerSessionWithTask extends TimerSession {
    tasks: {
        task_id: string;
        name: string;
        goal_id: string | null;
        subject_id: string | null;
        chapter_id: string | null;
        topic_id: string | null;
        goals?: {
            name: string;
            projects?: {
                name: string;
            } | null;
        } | null;
        subjects?: {
            name: string;
        } | null;
        chapters?: {
            name: string;
        } | null;
        topics?: {
            name: string;
        } | null;
    } | null;
}

interface UseTimerHistoryParams {
    page: number;
    pageSize: number;
    startDate?: Date;
    endDate?: Date;
}

export function useTimerHistory({
    page,
    pageSize,
    startDate,
    endDate,
}: UseTimerHistoryParams) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const queryKey = ["timer-sessions-history", page, pageSize, startDate, endDate];

    return useQuery({
        queryKey,
        queryFn: async () => {
            let query = supabase
                .from("timer_sessions")
                .select(
                    `
          *,
          tasks (
            task_id,
            name,
            goal_id,
            subject_id,
            chapter_id,
            topic_id,
            goals (
              name,
              projects (name)
            ),
            subjects (name),
            chapters (name),
            topics (name)
          )
        `,
                    { count: "exact" }
                )
                .order("start_time", { ascending: false })
                .range(from, to);

            if (startDate) {
                query = query.gte("start_time", startDate.toISOString());
            }
            if (endDate) {
                // Ensure end date includes the full day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query = query.lte("start_time", end.toISOString());
            }

            const { data, error, count } = await query;

            if (error) throw error;

            return {
                sessions: data as unknown as TimerSessionWithTask[],
                totalCount: count || 0,
            };
        },
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
    });
}
