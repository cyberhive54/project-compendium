import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Chapter } from "@/types/database";

export function useChapters(subjectId?: string | null, showArchived = false) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["chapters", subjectId, showArchived],
    queryFn: async () => {
      let q = supabase
        .from("chapters")
        .select("*")
        .order("chapter_number", { ascending: true, nullsFirst: false });

      if (!showArchived) {
        q = q.eq("archived", false);
      }

      if (subjectId) {
        q = q.eq("subject_id", subjectId);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as Chapter[];
    },
  });

  const create = useMutation({
    mutationFn: async (input: Partial<Chapter>) => {
      const { data, error } = await supabase
        .from("chapters")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Chapter;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chapters"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Chapter> & { id: string }) => {
      const { data, error } = await supabase
        .from("chapters")
        .update(input)
        .eq("chapter_id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Chapter;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chapters"] }),
  });

  const archive = useMutation({
    mutationFn: async (chapterId: string) => {
      await supabase
        .from("topics")
        .update({ archived: true, archived_at: new Date().toISOString() })
        .eq("chapter_id", chapterId)
        .eq("archived", false);

      const { error } = await supabase
        .from("chapters")
        .update({ archived: true, archived_at: new Date().toISOString() })
        .eq("chapter_id", chapterId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chapters"] });
      qc.invalidateQueries({ queryKey: ["topics"] });
    },
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("chapters")
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("chapter_id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chapters"] }),
  });

  const remove = useMutation({
    mutationFn: async (chapterId: string) => {
      const { error } = await supabase
        .from("chapters")
        .delete()
        .eq("chapter_id", chapterId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chapters"] }),
  });

  return { ...query, create, update, archive, toggleComplete, remove };
}
