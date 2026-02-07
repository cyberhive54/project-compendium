import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Goal } from "@/types/database";

export function useGoals(options?: { archived?: boolean; projectId?: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["goals", user?.id, options],
    queryFn: async () => {
      let q = supabase
        .from("goals")
        .select("*")
        .eq("user_id", user!.id)
        .eq("archived", options?.archived ?? false)
        .order("created_at", { ascending: false });

      if (options?.projectId) {
        q = q.eq("project_id", options.projectId);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });

  const create = useMutation({
    mutationFn: async (input: Partial<Goal>) => {
      const { data, error } = await supabase
        .from("goals")
        .insert({ ...input, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as Goal;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Goal> & { id: string }) => {
      const { data, error } = await supabase
        .from("goals")
        .update(input)
        .eq("goal_id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Goal;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });

  const archive = useMutation({
    mutationFn: async (goalId: string) => {
      // Cascade archive: archive all children first (bottom-up)
      // 1. Get all subjects under this goal
      const { data: subjects } = await supabase
        .from("subjects")
        .select("subject_id")
        .eq("goal_id", goalId)
        .eq("archived", false);

      if (subjects?.length) {
        const subjectIds = subjects.map((s) => s.subject_id);

        // Archive topics under chapters under subjects
        const { data: chapters } = await supabase
          .from("chapters")
          .select("chapter_id")
          .in("subject_id", subjectIds)
          .eq("archived", false);

        if (chapters?.length) {
          const chapterIds = chapters.map((c) => c.chapter_id);
          await supabase
            .from("topics")
            .update({ archived: true, archived_at: new Date().toISOString() })
            .in("chapter_id", chapterIds)
            .eq("archived", false);

          await supabase
            .from("chapters")
            .update({ archived: true, archived_at: new Date().toISOString() })
            .in("chapter_id", chapterIds)
            .eq("archived", false);
        }

        await supabase
          .from("subjects")
          .update({ archived: true, archived_at: new Date().toISOString() })
          .in("subject_id", subjectIds)
          .eq("archived", false);
      }

      // Archive streams
      await supabase
        .from("streams")
        .update({ archived: true, archived_at: new Date().toISOString() })
        .eq("goal_id", goalId)
        .eq("archived", false);

      // Archive tasks
      await supabase
        .from("tasks")
        .update({ archived: true, archived_at: new Date().toISOString() })
        .eq("goal_id", goalId)
        .eq("archived", false);

      // Archive the goal itself
      const { error } = await supabase
        .from("goals")
        .update({ archived: true, archived_at: new Date().toISOString() })
        .eq("goal_id", goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["streams"] });
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["chapters"] });
      qc.invalidateQueries({ queryKey: ["topics"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const unarchive = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from("goals")
        .update({ archived: false, archived_at: null })
        .eq("goal_id", goalId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });

  const remove = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("goal_id", goalId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });

  return { ...query, create, update, archive, unarchive, remove };
}
