import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Subtask } from "@/types/database";

export function useSubtasks(taskId?: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["subtasks", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subtasks")
        .select("*")
        .eq("task_id", taskId!)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as Subtask[];
    },
    enabled: !!taskId,
  });

  const create = useMutation({
    mutationFn: async (input: { task_id: string; title: string; order_index: number }) => {
      const { data, error } = await supabase
        .from("subtasks")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Subtask;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subtasks"] }),
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("subtasks")
        .update({ completed })
        .eq("subtask_id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subtasks"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase
        .from("subtasks")
        .update({ title })
        .eq("subtask_id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subtasks"] }),
  });

  const remove = useMutation({
    mutationFn: async (subtaskId: string) => {
      const { error } = await supabase
        .from("subtasks")
        .delete()
        .eq("subtask_id", subtaskId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subtasks"] }),
  });

  return { ...query, create, toggleComplete, update, remove };
}
