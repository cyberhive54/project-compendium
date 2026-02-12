import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Feedback {
    feedback_id: string;
    user_id: string;
    title: string;
    description: string;
    type: "feedback" | "feature" | "bug";
    page?: string | null;
    image_url?: string | null;
    status: "submitted" | "in_review" | "planned" | "in_progress" | "completed" | "resolved" | "rejected" | "duplicate";
    priority?: "low" | "medium" | "high" | "critical" | null;
    category?: string | null;
    votes: number;
    browser_info?: string | null;
    steps_to_reproduce?: string | null;
    expected_behavior?: string | null;
    actual_behavior?: string | null;
    admin_notes?: string | null;
    created_at: string;
    updated_at: string;
}

export interface FeedbackVote {
    vote_id: string;
    feedback_id: string;
    user_id: string;
    created_at: string;
}

export function useFeedback() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Get user's own feedback
    const userFeedback = useQuery({
        queryKey: ["user-feedback", user?.id],
        queryFn: async () => {
            if (!user) throw new Error("No user");
            const { data, error } = await supabase
                .from("feedback")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Feedback[];
        },
        enabled: !!user,
    });

    // Get all feedback (admin or public view)
    const allFeedback = useQuery({
        queryKey: ["all-feedback"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("feedback")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Feedback[];
        },
        enabled: !!user,
    });

    // Get user's votes
    const userVotes = useQuery({
        queryKey: ["user-votes", user?.id],
        queryFn: async () => {
            if (!user) throw new Error("No user");
            const { data, error } = await supabase
                .from("feedback_votes")
                .select("*")
                .eq("user_id", user.id);

            if (error) throw error;
            return data as FeedbackVote[];
        },
        enabled: !!user,
    });

    // Submit new feedback
    const submitFeedback = useMutation({
        mutationFn: async (feedback: Partial<Feedback>) => {
            if (!user) throw new Error("No user");

            const { data, error } = await supabase
                .from("feedback")
                .insert([{ ...feedback, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-feedback"] });
            queryClient.invalidateQueries({ queryKey: ["all-feedback"] });
            toast.success("Feedback submitted successfully!");
        },
        onError: (error: any) => {
            toast.error(`Failed to submit feedback: ${error.message}`);
        },
    });

    // Update feedback status (admin only)
    const updateFeedbackStatus = useMutation({
        mutationFn: async ({ id, status, admin_notes }: { id: string; status: Feedback["status"]; admin_notes?: string }) => {
            const updateData: any = { status, updated_at: new Date().toISOString() };
            if (admin_notes !== undefined) {
                updateData.admin_notes = admin_notes;
            }

            const { data, error } = await supabase
                .from("feedback")
                .update(updateData)
                .eq("feedback_id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["all-feedback"] });
            queryClient.invalidateQueries({ queryKey: ["user-feedback"] });
            toast.success("Status updated successfully!");
        },
        onError: (error: any) => {
            toast.error(`Failed to update status: ${error.message}`);
        },
    });

    // Vote for feedback
    const voteFeedback = useMutation({
        mutationFn: async (feedbackId: string) => {
            if (!user) throw new Error("No user");

            // Check if already voted
            const { data: existingVote } = await supabase
                .from("feedback_votes")
                .select("*")
                .eq("feedback_id", feedbackId)
                .eq("user_id", user.id)
                .single();

            if (existingVote) {
                // Remove vote
                const { error: deleteError } = await supabase
                    .from("feedback_votes")
                    .delete()
                    .eq("vote_id", existingVote.vote_id);

                if (deleteError) throw deleteError;

                // Decrement vote count
                const { error: updateError } = await supabase.rpc("decrement_feedback_votes", {
                    feedback_id: feedbackId,
                });

                if (updateError) throw updateError;
                return { action: "unvoted" };
            } else {
                // Add vote
                const { error: insertError } = await supabase
                    .from("feedback_votes")
                    .insert({ feedback_id: feedbackId, user_id: user.id });

                if (insertError) throw insertError;

                // Increment vote count
                const { error: updateError } = await supabase.rpc("increment_feedback_votes", {
                    feedback_id: feedbackId,
                });

                if (updateError) throw updateError;
                return { action: "voted" };
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["all-feedback"] });
            queryClient.invalidateQueries({ queryKey: ["user-feedback"] });
            queryClient.invalidateQueries({ queryKey: ["user-votes"] });
        },
        onError: (error: any) => {
            toast.error(`Failed to vote: ${error.message}`);
        },
    });

    return {
        userFeedback,
        allFeedback,
        userVotes,
        submitFeedback,
        updateFeedbackStatus,
        voteFeedback,
    };
}
