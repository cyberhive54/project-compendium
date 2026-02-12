import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { StudySessionConfig } from "@/types/database";

export function useStudySessions() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["study-sessions-config", user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("study_sessions_config")
                .select("*")
                .eq("user_id", user!.id)
                .order("start_time", { ascending: true });
            if (error) throw error;
            return data as StudySessionConfig[];
        },
        enabled: !!user,
    });
}
