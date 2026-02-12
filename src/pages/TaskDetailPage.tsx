import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO, isPast, isToday } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  MoreVertical,
  Pencil,
  Play,
  Trash2,
  Archive,
  RotateCcw,
  Calendar as CalendarIcon,
  Timer as TimerIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useGoals } from "@/hooks/useGoals";
import { useTimerSessions } from "@/hooks/useTimerSessions";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/types/database";

import { TaskCompletionDialog, type TaskCompletionData } from "@/components/tasks/TaskCompletionDialog";
import { PostponeDialog } from "@/components/tasks/PostponeDialog";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { BreadcrumbNav } from "@/components/tasks/BreadcrumbNav";
import { TaskProgressCard } from "@/components/tasks/TaskProgressCard";
import { TaskTypeContent } from "@/components/tasks/TaskTypeContent";

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { update, markDone, remove, postpone, archive } = useTasks();
  const { data: goals = [] } = useGoals();
  const { sessions } = useTimerSessions(taskId);

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [postponeOpen, setPostponeOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Breadcrumb items
  const [breadcrumbItems, setBreadcrumbItems] = useState<{ label: string; href?: string }[]>([]);

  useEffect(() => {
    if (!taskId || !user) return;
    const fetchTask = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("task_id", taskId)
        .single();
      if (error || !data) {
        toast.error("Task not found");
        navigate("/tasks");
        return;
      }
      setTask(data as Task);

      // Build breadcrumb
      const items: { label: string; href?: string }[] = [{ label: "Tasks", href: "/tasks" }];

      if (data.goal_id) {
        const { data: g } = await supabase
          .from("goals")
          .select("name, project_id")
          .eq("goal_id", data.goal_id)
          .single();
        if (g) {
          if (g.project_id) {
            const { data: p } = await supabase
              .from("projects")
              .select("name")
              .eq("project_id", g.project_id)
              .single();
            if (p) items.push({ label: p.name, href: `/projects/${g.project_id}` });
          }
          items.push({ label: g.name, href: `/goals/${data.goal_id}` });
        }
      }
      // Add subject/chapter/topic if relevant
      if (data.subject_id) {
        const { data: s } = await supabase.from("subjects").select("name").eq("subject_id", data.subject_id).single();
        if (s) items.push({ label: s.name });
      }

      items.push({ label: data.name }); // Current task
      setBreadcrumbItems(items);
      setLoading(false);
    };
    fetchTask();
  }, [taskId, user]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) return null;

  const isOverdue =
    task.status !== "done" &&
    task.scheduled_date &&
    isPast(parseISO(task.scheduled_date)) &&
    !isToday(parseISO(task.scheduled_date));

  const statusLabel = isOverdue
    ? "Overdue"
    : task.status === "done"
      ? "Completed"
      : task.status === "in_progress"
        ? "In Progress"
        : task.status === "postponed"
          ? "Postponed"
          : task.status === "pending"
            ? "Pending"
            : "Scheduled";

  const statusColor = isOverdue
    ? "text-destructive"
    : task.status === "done"
      ? "text-success"
      : task.status === "in_progress"
        ? "text-primary"
        : task.status === "postponed"
          ? "text-destructive"
          : task.status === "pending"
            ? "text-warning"
            : "text-muted-foreground";

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === "done") {
      setCompletionDialogOpen(true);
      return;
    }

    await update.mutateAsync({
      id: task.task_id,
      status: newStatus as Task["status"],
    });

    setTask((t) => t ? { ...t, status: newStatus as Task["status"] } : t);
    toast.success(`Status changed to ${newStatus}`);
  };

  const handleDelete = async () => {
    await remove.mutateAsync(task.task_id);
    toast.success("Task deleted");
    navigate("/tasks");
  };

  const handleComplete = async (data: TaskCompletionData) => {
    await markDone.mutateAsync({ taskId: task.task_id, ...data });
    setCompletionDialogOpen(false);
    // Optimistic update
    setTask((t) => t ? {
      ...t,
      status: 'done',
      completed_at: new Date().toISOString(),
      ...data
    } : t);
  };

  const handlePostpone = async (date: Date) => {
    const newDate = format(date, "yyyy-MM-dd");
    await postpone.mutateAsync({ taskId: task.task_id, newDate });
    setPostponeOpen(false);
    setTask((t) => t ? { ...t, status: 'postponed', scheduled_date: newDate } : t);
    toast.success(`Task postponed to ${format(date, "MMM d")}`);
  };

  const handleArchive = async () => {
    await archive.mutateAsync(task.task_id);
    setTask((t) => t ? { ...t, archived: !t.archived } : t);
    toast.success(task.archived ? "Task unarchived" : "Task archived");
  };

  const handleUpdate = async (values: Partial<Task>) => {
    await update.mutateAsync({ id: task.task_id, ...values });
    setTask((t) => t ? { ...t, ...values } : t);
    setEditOpen(false);
    toast.success("Task updated");
  };

  const timerSessions = sessions.data ?? [];
  const totalStudyTime = timerSessions
    .filter((s) => s.session_type === "focus")
    .reduce(
      (sum, s) =>
        sum + ((s.duration_seconds ?? 0) - (s.paused_duration_seconds ?? 0)),
      0
    );

  return (
    <div className="space-y-6 pb-20">
      {/* Back + Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tasks")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <BreadcrumbNav items={breadcrumbItems} />
      </div>

      {/* Task Header */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{task.task_type}</Badge>
                <span className={`text-sm font-medium ${statusColor}`}>
                  {statusLabel}
                </span>
                <Badge variant="outline">P{task.priority_number}</Badge>
                {task.archived && <Badge variant="secondary">Archived</Badge>}
              </div>
              <h1 className="text-xl md:text-2xl font-bold">{task.name}</h1>
              {task.description && (
                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                  {task.description}
                </p>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              {task.status !== 'done' && !task.archived && (
                <>
                  <Button
                    className="bg-success hover:bg-success/90 text-white"
                    size="sm"
                    onClick={() => setCompletionDialogOpen(true)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Complete
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/timer`, { state: { taskId: task.task_id } })}
                  >
                    <Play className="h-3.5 w-3.5 mr-1" />
                    Focus
                  </Button>
                </>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Task
                  </DropdownMenuItem>
                  {task.status !== 'done' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate(`/timer`, { state: { taskId: task.task_id, mode: 'pomodoro' } })}>
                        <TimerIcon className="h-4 w-4 mr-2" />
                        Start Pomodoro
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setPostponeOpen(true)}>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Postpone
                      </DropdownMenuItem>
                    </>
                  )}
                  {task.status === 'done' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={async () => {
                          await update.mutateAsync({
                            id: task.task_id,
                            status: 'pending' as Task['status'],
                            completed_at: null as any,
                          });
                          setTask((t) => t ? { ...t, status: 'pending' as Task['status'], completed_at: null } : t);
                          toast.success('Task marked as incomplete');
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Mark as Incomplete
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={handleArchive}>
                    <Archive className="h-4 w-4 mr-2" />
                    {task.archived ? "Unarchive" : "Archive"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            {task.scheduled_date && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {format(parseISO(task.scheduled_date), "MMM d, yyyy")}
              </span>
            )}
            {task.estimated_duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {task.estimated_duration} min est.
              </span>
            )}
            {totalStudyTime > 0 && (
              <span className="flex items-center gap-1 text-primary">
                <Play className="h-3.5 w-3.5" />
                {Math.round(totalStudyTime / 60)} min studied
              </span>
            )}
          </div>

          <Separator />

          <div className="space-y-6">
            <TaskTypeContent
              task={task}
              onEdit={() => setCompletionDialogOpen(true)}
            />

            <TaskProgressCard
              task={task}
              sessions={timerSessions}
            />
          </div>

        </CardContent>
      </Card>

      <TaskCompletionDialog
        task={task}
        open={completionDialogOpen}
        onOpenChange={setCompletionDialogOpen}
        onComplete={handleComplete}
        isSubmitting={markDone.isPending}
      />

      <PostponeDialog
        open={postponeOpen}
        onOpenChange={setPostponeOpen}
        onPostpone={handlePostpone}
        currentDate={task.scheduled_date ? parseISO(task.scheduled_date) : undefined}
        isSubmitting={postpone.isPending}
      />

      {task && (
        <TaskFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          onSubmit={handleUpdate}
          defaultValues={task}
          isEditing={true}
        />
      )}

    </div>
  );
}
