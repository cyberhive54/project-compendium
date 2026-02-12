import { format } from "date-fns";
import { Clock, History, Trophy, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Task } from "@/types/database";
import type { TimerSession } from "@/types/database"; // Assuming TimerSession type exists or similar

interface TaskProgressCardProps {
    task: Task;
    sessions: any[]; // Using any to avoid strict type issues with join, can refine
}

export function TaskProgressCard({ task, sessions }: TaskProgressCardProps) {
    const totalSeconds = sessions
        .filter((s) => s.session_type === "focus")
        .reduce((sum, s) => sum + (s.duration_seconds || 0), 0);

    const totalMinutes = Math.floor(totalSeconds / 60);
    const estimatedMinutes = task.estimated_duration || 0;

    // Cap progress at 100% for the bar, but show real % text
    const progressPercent = estimatedMinutes > 0
        ? Math.min(100, (totalMinutes / estimatedMinutes) * 100)
        : 0;

    const realPercent = estimatedMinutes > 0
        ? Math.round((totalMinutes / estimatedMinutes) * 100)
        : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Progress & Sessions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                            Time Spent
                        </span>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="text-xl font-bold">{totalMinutes}m</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                            Estimated
                        </span>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="h-4 w-4" />
                            <span className="text-xl font-bold">
                                {estimatedMinutes > 0 ? `${estimatedMinutes}m` : "--"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {estimatedMinutes > 0 && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Completion Progress</span>
                            <span className="text-muted-foreground">{realPercent}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                    </div>
                )}

                {/* Recent Sessions */}
                <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">Recent Sessions</h4>
                    {sessions.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No sessions recorded yet.</p>
                    ) : (
                        <ScrollArea className="max-h-[200px] pr-4">
                            <div className="space-y-3">
                                {sessions.map((session: any) => (
                                    <div
                                        key={session.session_id}
                                        className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {format(new Date(session.start_time), "MMM d, yyyy")}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(session.start_time), "h:mm a")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${session.session_type === 'focus'
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {session.session_type}
                                            </span>
                                            <span className="font-mono">
                                                {Math.floor((session.duration_seconds || 0) / 60)}m
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
