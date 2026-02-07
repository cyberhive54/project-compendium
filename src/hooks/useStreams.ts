import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Stream } from "@/types/database";

export function useStreams(goalId?: string, showArchived = false) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["streams", goalId, showArchived],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("streams")
        .select("*")
        .eq("goal_id", goalId!)
        .eq("archived", showArchived)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Stream[];
    },
    enabled: !!goalId,
  });

  const create = useMutation({
    mutationFn: async (input: Partial<Stream>) => {
      const { data, error } = await supabase
        .from("streams")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Stream;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["streams"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Stream> & { id: string }) => {
      const { data, error } = await supabase
        .from("streams")
        .update(input)
        .eq("stream_id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Stream;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["streams"] }),
  });

  const archive = useMutation({
    mutationFn: async (streamId: string) => {
      // Cascade: archive subjects under this stream
      const { data: subjects } = await supabase
        .from("subjects")
        .select("subject_id")
        .eq("stream_id", streamId)
        .eq("archived", false);

      if (subjects?.length) {
        const subjectIds = subjects.map((s) => s.subject_id);
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
            .in("chapter_id", chapterIds);
          await supabase
            .from("chapters")
            .update({ archived: true, archived_at: new Date().toISOString() })
            .in("chapter_id", chapterIds);
        }

        await supabase
          .from("subjects")
          .update({ archived: true, archived_at: new Date().toISOString() })
          .in("subject_id", subjectIds);
      }

      const { error } = await supabase
        .from("streams")
        .update({ archived: true, archived_at: new Date().toISOString() })
        .eq("stream_id", streamId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["streams"] });
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["chapters"] });
      qc.invalidateQueries({ queryKey: ["topics"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (streamId: string) => {
      const { error } = await supabase
        .from("streams")
        .delete()
        .eq("stream_id", streamId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["streams"] }),
  });

  return { ...query, create, update, archive, remove };
}
