import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { TimerSessionWithTask } from "@/hooks/useTimerHistory";
import { format } from "date-fns";
import { formatTime } from "./TimerDisplay";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, CalendarDays, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SessionDetailModalProps {
    session: TimerSessionWithTask | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SessionDetailModal({
    session,
    open,
    onOpenChange,
}: SessionDetailModalProps) {
    const navigate = useNavigate();

    if (!session) return null;

    const task = session.tasks;

    // Build breadcrumb string
    const breadcrumbs = [];
    if (task?.goals?.projects?.name) breadcrumbs.push(task.goals.projects.name);
    if (task?.goals?.name) breadcrumbs.push(task.goals.name);
    if (task?.subjects?.name) breadcrumbs.push(task.subjects.name);
    if (task?.chapters?.name) breadcrumbs.push(task.chapters.name);
    // task.name is the title

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Session Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header Stats */}
                    <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase">
                                Duration
                            </span>
                            <span className="text-2xl font-mono font-bold">
                                {formatTime(session.duration_seconds || 0)}
                            </span>
                        </div>
                        <div className="text-right">
                            <Badge variant={session.is_pomodoro ? "default" : "secondary"}>
                                {session.is_pomodoro ? (
                                    <Zap className="h-3 w-3 mr-1" />
                                ) : (
                                    <Clock className="h-3 w-3 mr-1" />
                                )}
                                {session.is_pomodoro ? "Pomodoro" : "Focus"}
                            </Badge>
                        </div>
                    </div>

                    {/* Task Info */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Task</h4>
                        <div className="p-3 border rounded-md space-y-2">
                            {breadcrumbs.length > 0 && (
                                <div className="text-xs text-muted-foreground flex items-center flex-wrap gap-1">
                                    {breadcrumbs.map((b, i) => (
                                        <span key={i} className="flex items-center">
                                            {b}
                                            {i < breadcrumbs.length - 1 && (
                                                <ArrowRight className="h-3 w-3 mx-1 opacity-50" />
                                            )}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="font-medium text-lg leading-none">
                                {task?.name || "Unknown Task"}
                            </div>

                            <Button
                                variant="link"
                                className="h-auto p-0 text-primary"
                                onClick={() => {
                                    onOpenChange(false);
                                    navigate(`/tasks/${task?.task_id}`);
                                }}
                            >
                                View Task Details
                            </Button>
                        </div>
                    </div>

                    {/* Time Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Started</span>
                            <div className="flex items-center gap-2 text-sm">
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                {format(new Date(session.start_time), "MMM d, yyyy HH:mm")}
                            </div>
                        </div>
                        {session.end_time && (
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">Ended</span>
                                <div className="flex items-center gap-2 text-sm">
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                    {format(new Date(session.end_time), "MMM d, yyyy HH:mm")}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
