import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Subject } from "@/types/database";

export function useSubjects(goalId?: string | null, streamId?: string | null, showArchived = false) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["subjects", goalId, streamId, showArchived],
    queryFn: async () => {
      let q = supabase
        .from("subjects")
        .select("*")
        .order("created_at", { ascending: true });

      if (!showArchived) {
        q = q.eq("archived", false);
      }

      if (goalId) {
        q = q.eq("goal_id", goalId);
      }

      if (streamId !== undefined) {
        if (streamId === null) {
          q = q.is("stream_id", null);
        } else {
          q = q.eq("stream_id", streamId);
        }
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as Subject[];
    },
  });

  const create = useMutation({
    mutationFn: async (input: Partial<Subject>) => {
      const { data, error } = await supabase
        .from("subjects")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Subject;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Subject> & { id: string }) => {
      const { data, error } = await supabase
        .from("subjects")
        .update(input)
        .eq("subject_id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Subject;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });

  const archive = useMutation({
    mutationFn: async (subjectId: string) => {
      const { data: chapters } = await supabase
        .from("chapters")
        .select("chapter_id")
        .eq("subject_id", subjectId)
        .eq("archived", false);

      if (chapters?.length) {
        const chapterIds = chapters.map((c) => c.chapter_id);
        await supabase
          .from("topics")
          .update({ archived: true, archived_at: new Date().toISOString() })
          .in("chapter_id", chapterIds);
        await supabase
          .from("chapters")
          .update({ archived: true, archived_at: new Date().toISOString() })
          .in("chapter_id", chapterIds);
      }

      const { error } = await supabase
        .from("subjects")
        .update({ archived: true, archived_at: new Date().toISOString() })
        .eq("subject_id", subjectId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["chapters"] });
      qc.invalidateQueries({ queryKey: ["topics"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (subjectId: string) => {
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("subject_id", subjectId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });

  return { ...query, create, update, archive, remove };
}
