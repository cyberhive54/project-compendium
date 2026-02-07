import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Task } from "@/types/database";

interface TaskFilters {
  goalId?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  status?: string;
  taskType?: string;
  scheduledDate?: string;
  archived?: boolean;
}

export function useTasks(filters?: TaskFilters) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["tasks", user?.id, filters],
    queryFn: async () => {
      let q = supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user!.id)
        .eq("archived", filters?.archived ?? false)
        .order("priority_number", { ascending: false })
        .order("created_at", { ascending: false });

      if (filters?.goalId) q = q.eq("goal_id", filters.goalId);
      if (filters?.subjectId) q = q.eq("subject_id", filters.subjectId);
      if (filters?.chapterId) q = q.eq("chapter_id", filters.chapterId);
      if (filters?.topicId) q = q.eq("topic_id", filters.topicId);
      if (filters?.status) q = q.eq("status", filters.status);
      if (filters?.taskType) q = q.eq("task_type", filters.taskType);
      if (filters?.scheduledDate) q = q.eq("scheduled_date", filters.scheduledDate);

      const { data, error } = await q;
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const create = useMutation({
    mutationFn: async (input: Partial<Task>) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...input, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(input)
        .eq("task_id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const markDone = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({
          status: "done",
          completed_at: new Date().toISOString(),
        })
        .eq("task_id", taskId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const postpone = useMutation({
    mutationFn: async ({ taskId, newDate }: { taskId: string; newDate: string }) => {
      // Get current task to capture original date
      const { data: task } = await supabase
        .from("tasks")
        .select("scheduled_date")
        .eq("task_id", taskId)
        .single();

      const { error } = await supabase
        .from("tasks")
        .update({
          status: "postponed",
          is_postponed: true,
          postponed_from_date: task?.scheduled_date,
          postponed_to_date: newDate,
          scheduled_date: newDate,
        })
        .eq("task_id", taskId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const archive = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ archived: true, archived_at: new Date().toISOString() })
        .eq("task_id", taskId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const bulkPostpone = useMutation({
    mutationFn: async ({ taskIds, newDate }: { taskIds: string[]; newDate: string }) => {
      const { error } = await supabase
        .from("tasks")
        .update({
          status: "postponed",
          is_postponed: true,
          postponed_to_date: newDate,
          scheduled_date: newDate,
        })
        .in("task_id", taskIds);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const bulkArchive = useMutation({
    mutationFn: async (taskIds: string[]) => {
      const { error } = await supabase
        .from("tasks")
        .update({ archived: true, archived_at: new Date().toISOString() })
        .in("task_id", taskIds);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const remove = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("task_id", taskId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return {
    ...query,
    create,
    update,
    markDone,
    postpone,
    archive,
    bulkPostpone,
    bulkArchive,
    remove,
  };
}
