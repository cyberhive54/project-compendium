import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, ArrowRight } from "lucide-react";
import { CalendarDayView } from "@/components/calendar/CalendarDayView";
import { TimerModeSelectDialog } from "@/components/calendar/TimerModeSelectDialog";
import { PostponeDialog } from "@/components/tasks/PostponeDialog";
import { TaskCompletionDialog, type TaskCompletionData } from "@/components/tasks/TaskCompletionDialog";
import { useCalendarTasks, useStudySessions, buildDaySummaries } from "@/hooks/useCalendarData";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import type { Task } from "@/types/database";

export function DashboardCalendarWidget() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const today = new Date();
    const dateStr = format(today, "yyyy-MM-dd");

    const { data: tasks = [] } = useCalendarTasks(dateStr, dateStr);
    const { data: sessions = [] } = useStudySessions();
    const { markDone, postpone } = useTasks();

    // Timer mode selection
    const [timerTaskId, setTimerTaskId] = useState<string | null>(null);
    // Postpone
    const [postponeTaskId, setPostponeTaskId] = useState<string | null>(null);
    // Completion
    const [completionOpen, setCompletionOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const postponeTask = tasks.find((t) => t.task_id === postponeTaskId);

    const handleMarkDone = (taskId: string) => {
        const task = tasks.find((t) => t.task_id === taskId);
        if (task) {
            setSelectedTask(task as unknown as Task);
            setCompletionOpen(true);
        }
    };

    const handleComplete = async (data: TaskCompletionData) => {
        if (selectedTask) {
            await markDone.mutateAsync({ taskId: selectedTask.task_id, ...data });
            setCompletionOpen(false);
            setSelectedTask(null);
        }
    };

    const handlePostpone = async (date: Date) => {
        if (postponeTaskId) {
            const newDate = format(date, "yyyy-MM-dd");
            await postpone.mutateAsync({ taskId: postponeTaskId, newDate });
            setPostponeTaskId(null);
        }
    };

    const summary = useMemo(() => {
        const summaries = buildDaySummaries(tasks, [], [], dateStr, dateStr);
        return summaries[dateStr];
    }, [tasks, dateStr]);

    // Get start_of_day_hour from profile (default 0)
    const startOfDayHour = profile?.start_of_day_hour ?? 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Today's Schedule
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => navigate("/calendar")}>
                    View <ArrowRight className="h-3 w-3" />
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-hidden">
                    <CalendarDayView
                        currentDate={today}
                        tasks={tasks}
                        summary={summary}
                        sessions={sessions}
                        onMarkDone={handleMarkDone}
                        onStartTimer={(id) => setTimerTaskId(id)}
                        onPostpone={(id) => setPostponeTaskId(id)}
                        compact={true}
                        startOfDayHour={startOfDayHour}
                    />
                </div>
            </CardContent>

            {/* Timer Mode Select */}
            <TimerModeSelectDialog
                open={!!timerTaskId}
                onOpenChange={(open) => !open && setTimerTaskId(null)}
                onSelect={(mode) => {
                    if (timerTaskId) {
                        navigate("/timer", { state: { taskId: timerTaskId, mode } });
                        setTimerTaskId(null);
                    }
                }}
            />

            {/* Postpone Dialog */}
            {postponeTask && (
                <PostponeDialog
                    open={!!postponeTaskId}
                    onOpenChange={(open) => !open && setPostponeTaskId(null)}
                    onPostpone={handlePostpone}
                    currentDate={postponeTask.scheduled_date ? new Date(postponeTask.scheduled_date + "T00:00:00") : undefined}
                    isSubmitting={postpone.isPending}
                />
            )}

            {/* Completion Dialog */}
            {selectedTask && (
                <TaskCompletionDialog
                    task={selectedTask}
                    open={completionOpen}
                    onOpenChange={setCompletionOpen}
                    onComplete={handleComplete}
                    isSubmitting={markDone.isPending}
                />
            )}
        </Card>
    );
}
