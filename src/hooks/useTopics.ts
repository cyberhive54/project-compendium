import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Topic } from "@/types/database";

export function useTopics(chapterId?: string, showArchived = false) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["topics", chapterId, showArchived],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("chapter_id", chapterId!)
        .eq("archived", showArchived)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Topic[];
    },
    enabled: !!chapterId,
  });

  const create = useMutation({
    mutationFn: async (input: Partial<Topic>) => {
      const { data, error } = await supabase
        .from("topics")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Topic;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Topic> & { id: string }) => {
      const { data, error } = await supabase
        .from("topics")
        .update(input)
        .eq("topic_id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Topic;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("topics")
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("topic_id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  });

  const archive = useMutation({
    mutationFn: async (topicId: string) => {
      const { error } = await supabase
        .from("topics")
        .update({ archived: true, archived_at: new Date().toISOString() })
        .eq("topic_id", topicId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  });

  const remove = useMutation({
    mutationFn: async (topicId: string) => {
      const { error } = await supabase
        .from("topics")
        .delete()
        .eq("topic_id", topicId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  });

  return { ...query, create, update, toggleComplete, archive, remove };
}
