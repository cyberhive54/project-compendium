import { FeedbackCard } from "./FeedbackCard";
import type { Feedback, FeedbackVote } from "@/hooks/useFeedback";

interface FeedbackListProps {
    feedbacks: Feedback[];
    userVotes?: FeedbackVote[];
    onVote?: (id: string) => void;
    emptyMessage?: string;
    showActions?: boolean;
}

export function FeedbackList({
    feedbacks,
    userVotes = [],
    onVote,
    emptyMessage = "No feedback yet",
    showActions = true,
}: FeedbackListProps) {
    const votedFeedbackIds = new Set(userVotes.map((v) => v.feedback_id));

    if (feedbacks.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {feedbacks.map((feedback) => (
                <FeedbackCard
                    key={feedback.feedback_id}
                    feedback={feedback}
                    onVote={onVote}
                    isVoted={votedFeedbackIds.has(feedback.feedback_id)}
                    showActions={showActions}
                />
            ))}
        </div>
    );
}
