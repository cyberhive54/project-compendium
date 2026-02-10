import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO, isPast, isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useTimerSessions, type TimerSession } from "@/hooks/useTimerSessions";
import { useGoals } from "@/hooks/useGoals";
import type { Task } from "@/types/database";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  CalendarDays,
  Timer,
  Play,
  CheckCircle2,
  Pencil,
  Trash2,
  Loader2,
  Target,
  BookOpen,
  Layers,
  FileText,
} from "lucide-react";

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { update, markDone, remove } = useTasks();
  const { data: goals = [] } = useGoals();
  const { sessions } = useTimerSessions(taskId);

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Breadcrumb data
  const [breadcrumb, setBreadcrumb] = useState<{
    goal?: string;
    subject?: string;
    chapter?: string;
    topic?: string;
    project?: string;
  }>({});

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
      const bc: typeof breadcrumb = {};
      if (data.goal_id) {
        const { data: g } = await supabase
          .from("goals")
          .select("name, project_id")
          .eq("goal_id", data.goal_id)
          .single();
        if (g) {
          bc.goal = g.name;
          if (g.project_id) {
            const { data: p } = await supabase
              .from("projects")
              .select("name")
              .eq("project_id", g.project_id)
              .single();
            if (p) bc.project = p.name;
          }
        }
      }
      if (data.subject_id) {
        const { data: s } = await supabase
          .from("subjects")
          .select("name")
          .eq("subject_id", data.subject_id)
          .single();
        if (s) bc.subject = s.name;
      }
      if (data.chapter_id) {
        const { data: c } = await supabase
          .from("chapters")
          .select("name")
          .eq("chapter_id", data.chapter_id)
          .single();
        if (c) bc.chapter = c.name;
      }
      if (data.topic_id) {
        const { data: t } = await supabase
          .from("topics")
          .select("name")
          .eq("topic_id", data.topic_id)
          .single();
        if (t) bc.topic = t.name;
      }
      setBreadcrumb(bc);
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
      await markDone.mutateAsync(task.task_id);
    } else {
      await update.mutateAsync({
        id: task.task_id,
        status: newStatus as Task["status"],
      });
    }
    setTask((t) =>
      t
        ? {
            ...t,
            status: newStatus as Task["status"],
            completed_at:
              newStatus === "done" ? new Date().toISOString() : t.completed_at,
          }
        : t
    );
    toast.success(`Status changed to ${newStatus}`);
  };

  const handleDelete = async () => {
    await remove.mutateAsync(task.task_id);
    toast.success("Task deleted");
    navigate("/tasks");
  };

  const timerSessions = sessions.data ?? [];
  const totalStudyTime = timerSessions
    .filter((s) => s.session_type === "focus")
    .reduce(
      (sum, s) =>
        sum + ((s.duration_seconds ?? 0) - (s.paused_duration_seconds ?? 0)),
      0
    );

  const isExamType = ["test", "mocktest", "exam"].includes(task.task_type);

  return (
    <div className="space-y-6">
      {/* Back + Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tasks")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <nav className="text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
          {breadcrumb.project && (
            <>
              <span>{breadcrumb.project}</span>
              <span>›</span>
            </>
          )}
          {breadcrumb.goal && (
            <>
              <span>{breadcrumb.goal}</span>
              <span>›</span>
            </>
          )}
          {breadcrumb.subject && (
            <>
              <span>{breadcrumb.subject}</span>
              <span>›</span>
            </>
          )}
          {breadcrumb.chapter && (
            <>
              <span>{breadcrumb.chapter}</span>
              <span>›</span>
            </>
          )}
          {breadcrumb.topic && <span>{breadcrumb.topic}</span>}
        </nav>
      </div>

      {/* Task Header */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold">{task.name}</h1>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {task.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(`/timer`, { state: { taskId: task.task_id } })
                }
              >
                <Play className="h-3.5 w-3.5 mr-1" />
                Focus
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary">{task.task_type}</Badge>
            <span className={`text-sm font-medium ${statusColor}`}>
              {statusLabel}
            </span>
            <Badge variant="outline">P{task.priority_number}</Badge>
            {task.scheduled_date && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {format(parseISO(task.scheduled_date), "MMM d, yyyy")}
              </span>
            )}
          </div>

          <Separator />

          {/* Status change */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Change status:</span>
            <Select value={task.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="postponed">Postponed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="py-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">
              {Math.round(totalStudyTime / 60)}m
            </div>
            <div className="text-xs text-muted-foreground">Study Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Timer className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{timerSessions.length}</div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </CardContent>
        </Card>
        {task.estimated_duration && (
          <Card>
            <CardContent className="py-4 text-center">
              <Target className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-lg font-bold">{task.estimated_duration}m</div>
              <div className="text-xs text-muted-foreground">Estimated</div>
            </CardContent>
          </Card>
        )}
        {task.completed_at && (
          <Card>
            <CardContent className="py-4 text-center">
              <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-success" />
              <div className="text-sm font-bold">
                {format(parseISO(task.completed_at), "MMM d")}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Exam Results */}
      {isExamType && task.total_questions != null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exam Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total Q</div>
                <div className="font-bold text-lg">{task.total_questions}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Attempted</div>
                <div className="font-bold text-lg">
                  {task.attempted_questions ?? 0}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Correct</div>
                <div className="font-bold text-lg text-success">
                  {task.correct_answers ?? 0}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Accuracy</div>
                <div className="font-bold text-lg text-primary">
                  {task.accuracy_percentage?.toFixed(1) ?? "—"}%
                </div>
              </div>
              {task.marks_obtained != null && (
                <div>
                  <div className="text-muted-foreground">Marks</div>
                  <div className="font-bold text-lg">
                    {task.marks_obtained}/{task.total_marks}
                  </div>
                </div>
              )}
              {task.time_taken_minutes != null && (
                <div>
                  <div className="text-muted-foreground">Time Taken</div>
                  <div className="font-bold text-lg">
                    {task.time_taken_minutes}m
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timer Sessions */}
      {timerSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timer Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {timerSessions.map((s) => {
                const dur =
                  (s.duration_seconds ?? 0) - (s.paused_duration_seconds ?? 0);
                return (
                  <div
                    key={s.session_id}
                    className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          s.session_type === "focus" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {s.session_type}
                      </Badge>
                      <span className="text-muted-foreground">
                        {format(parseISO(s.start_time), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <span className="font-medium">
                      {Math.round(dur / 60)}m
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{task.name}" and all its subtasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
