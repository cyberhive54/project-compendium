import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Project } from "@/types/database";

export function useProjects(showArchived = false) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["projects", user?.id, showArchived],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user!.id)
        .eq("archived", showArchived)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });

  const create = useMutation({
    mutationFn: async (input: Partial<Project>) => {
      const { data, error } = await supabase
        .from("projects")
        .insert({ ...input, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from("projects")
        .update(input)
        .eq("project_id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  const archive = useMutation({
    mutationFn: async (id: string) => {
      const now = new Date().toISOString();

      // 1. Get all non-archived goals under this project
      const { data: goals } = await supabase
        .from("goals")
        .select("goal_id")
        .eq("project_id", id)
        .eq("archived", false);

      if (goals?.length) {
        const goalIds = goals.map((g) => g.goal_id);

        // 2. Get all subjects under these goals
        const { data: subjects } = await supabase
          .from("subjects")
          .select("subject_id")
          .in("goal_id", goalIds)
          .eq("archived", false);

        if (subjects?.length) {
          const subjectIds = subjects.map((s) => s.subject_id);

          // 3. Get chapters under subjects
          const { data: chapters } = await supabase
            .from("chapters")
            .select("chapter_id")
            .in("subject_id", subjectIds)
            .eq("archived", false);

          if (chapters?.length) {
            const chapterIds = chapters.map((c) => c.chapter_id);

            // Archive topics
            await supabase
              .from("topics")
              .update({ archived: true, archived_at: now })
              .in("chapter_id", chapterIds)
              .eq("archived", false);

            // Archive chapters
            await supabase
              .from("chapters")
              .update({ archived: true, archived_at: now })
              .in("chapter_id", chapterIds)
              .eq("archived", false);
          }

          // Archive subjects
          await supabase
            .from("subjects")
            .update({ archived: true, archived_at: now })
            .in("subject_id", subjectIds)
            .eq("archived", false);
        }

        // Archive streams
        await supabase
          .from("streams")
          .update({ archived: true, archived_at: now })
          .in("goal_id", goalIds)
          .eq("archived", false);

        // Archive tasks
        await supabase
          .from("tasks")
          .update({ archived: true, archived_at: now })
          .in("goal_id", goalIds)
          .eq("archived", false);

        // Archive goals
        await supabase
          .from("goals")
          .update({ archived: true, archived_at: now })
          .in("goal_id", goalIds)
          .eq("archived", false);
      }

      // Archive the project itself
      const { error } = await supabase
        .from("projects")
        .update({ archived: true, archived_at: now })
        .eq("project_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["streams"] });
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["chapters"] });
      qc.invalidateQueries({ queryKey: ["topics"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["project-task-stats"] });
    },
  });

  const unarchive = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("projects")
        .update({ archived: false, archived_at: null })
        .eq("project_id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("project_id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  return { ...query, create, update, archive, unarchive, remove };
}
