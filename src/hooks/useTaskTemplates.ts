import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface TaskTemplate {
    template_id: string;
    name: string;
    user_id: string;
    goal_id?: string;
    subject_id?: string | null;
    chapter_id?: string | null;
    topic_id?: string | null;
    task_type: string;
    priority_number: number;
    estimated_duration?: number;
    scheduled_time_slot?: string | null;
    preferred_session_id?: string | null;
    schedule_start?: string;
    schedule_end?: string | null;
    recurrence?: string;
    is_active: boolean;
    created_at: string;
}

export function useTaskTemplates() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const templatesQuery = useQuery({
        queryKey: ["task-templates", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("task_templates")
                .select("*")
                .eq("user_id", user.id)
                .eq("is_active", true)
                .order("name");

            if (error) throw error;
            return data as TaskTemplate[];
        },
        enabled: !!user,
    });

    const create = useMutation({
        mutationFn: async (template: Partial<TaskTemplate>) => {
            const { data, error } = await supabase
                .from("task_templates")
                .insert([{ ...template, user_id: user?.id }])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["task-templates"] });
            toast.success("Template created");
        },
        onError: (e: any) => toast.error(`Failed to create template: ${e.message}`),
    });

    const update = useMutation({
        mutationFn: async ({ id, ...template }: Partial<TaskTemplate> & { id: string }) => {
            const { data, error } = await supabase
                .from("task_templates")
                .update(template)
                .eq("template_id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["task-templates"] });
            toast.success("Template updated");
        },
        onError: (e: any) => toast.error(`Failed to update template: ${e.message}`),
    });

    const remove = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("task_templates")
                .delete()
                .eq("template_id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["task-templates"] });
            toast.success("Template deleted");
        },
        onError: (e: any) => toast.error(`Failed to delete template: ${e.message}`),
    });

    return {
        templates: templatesQuery.data ?? [],
        isLoading: templatesQuery.isLoading,
        create,
        update,
        remove,
    };
}
