import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Feedback } from "@/hooks/useFeedback";

interface FeedbackCardProps {
    feedback: Feedback;
    onVote?: (id: string) => void;
    isVoted?: boolean;
    showActions?: boolean;
}

const STATUS_COLORS: Record<Feedback["status"], string> = {
    submitted: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20",
    in_review: "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20",
    planned: "bg-purple-500/10 text-purple-700 hover:bg-purple-500/20",
    in_progress: "bg-orange-500/10 text-orange-700 hover:bg-orange-500/20",
    completed: "bg-green-500/10 text-green-700 hover:bg-green-500/20",
    resolved: "bg-green-500/10 text-green-700 hover:bg-green-500/20",
    rejected: "bg-red-500/10 text-red-700 hover:bg-red-500/20",
    duplicate: "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20",
};

const PRIORITY_COLORS: Record<NonNullable<Feedback["priority"]>, string> = {
    low: "bg-green-500/10 text-green-700",
    medium: "bg-yellow-500/10 text-yellow-700",
    high: "bg-orange-500/10 text-orange-700",
    critical: "bg-red-500/10 text-red-700",
};

const TYPE_ICONS: Record<Feedback["type"], string> = {
    feedback: "💬",
    feature: "💡",
    bug: "🐛",
};

export function FeedbackCard({ feedback, onVote, isVoted, showActions = true }: FeedbackCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg">{TYPE_ICONS[feedback.type]}</span>
                            <h3 className="font-semibold text-base leading-tight">
                                {feedback.title}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={STATUS_COLORS[feedback.status]}>
                                {feedback.status.replace("_", " ")}
                            </Badge>
                            {feedback.priority && (
                                <Badge className={PRIORITY_COLORS[feedback.priority]}>
                                    {feedback.priority}
                                </Badge>
                            )}
                            {feedback.category && (
                                <Badge variant="outline" className="text-xs">
                                    {feedback.category}
                                </Badge>
                            )}
                        </div>
                    </div>
                    {showActions && onVote && (
                        <Button
                            variant={isVoted ? "default" : "outline"}
                            size="sm"
                            onClick={() => onVote(feedback.feedback_id)}
                            className="flex items-center gap-1.5 shrink-0"
                        >
                            <ThumbsUp className={`h-3.5 w-3.5 ${isVoted ? "fill-current" : ""}`} />
                            <span className="font-semibold">{feedback.votes}</span>
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                    {feedback.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                    </div>
                    {feedback.admin_notes && (
                        <div className="flex items-center gap-1.5">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Admin note
                        </div>
                    )}
                </div>
                {feedback.admin_notes && (
                    <div className="p-2.5 bg-muted rounded-md text-xs">
                        <p className="font-semibold mb-1">Admin Note:</p>
                        <p className="text-muted-foreground">{feedback.admin_notes}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
