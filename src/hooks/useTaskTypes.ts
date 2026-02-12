import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { UserTaskType } from "@/types/database";
import { DEFAULT_TASK_TYPES } from "@/types/database";

export function useTaskTypes() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["task-types", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_task_types")
        .select("*")
        .eq("user_id", user!.id)
        .order("is_custom", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as UserTaskType[];
    },
    enabled: !!user,
  });

  const seedDefaults = useMutation({
    mutationFn: async () => {
      const defaults = DEFAULT_TASK_TYPES.map((t) => ({
        user_id: user!.id,
        name: t.name,
        icon: t.icon,
        system_behavior: t.system_behavior || "study", // Fallback, though interface requires it
        is_custom: false,
        base_xp: 50,
      }));
      const { error } = await supabase
        .from("user_task_types")
        .upsert(defaults, { onConflict: "user_id,name" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-types"] }),
  });

  const create = useMutation({
    mutationFn: async (input: Partial<UserTaskType>) => {
      const { data, error } = await supabase
        .from("user_task_types")
        .insert({
          ...input,
          user_id: user!.id,
          is_custom: true,
          system_behavior: input.system_behavior || "study"
        })
        .select()
        .single();
      if (error) throw error;
      return data as UserTaskType;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-types"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<UserTaskType> & { id: string }) => {
      const { error } = await supabase
        .from("user_task_types")
        .update(input)
        .eq("task_type_id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-types"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_task_types")
        .delete()
        .eq("task_type_id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-types"] }),
  });

  // Combine defaults with custom types for display
  const allTypes = query.data ?? [];

  return { ...query, allTypes, seedDefaults, create, update, remove };
}
