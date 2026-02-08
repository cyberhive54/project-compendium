import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Pencil,
  Archive,
  CalendarDays,
  ListTodo,
  TrendingUp,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { GoalAnalytics } from "@/components/analytics/GoalAnalytics";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useGoals } from "@/hooks/useGoals";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { GOAL_TYPES } from "@/types/database";
import { GoalDetailContent } from "@/components/goals/GoalDetailContent";
import { GoalFormDialog } from "@/components/goals/GoalFormDialog";
import { ArchiveConfirmDialog } from "@/components/goals/ArchiveConfirmDialog";
import { toast } from "sonner";

export default function GoalDetailPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: allGoals = [],
    isLoading: loadingGoals,
    update: updateGoal,
    archive: archiveGoal,
  } = useGoals();

  const { data: projects = [] } = useProjects();

  const goal = useMemo(
    () => allGoals.find((g) => g.goal_id === goalId),
    [allGoals, goalId]
  );

  const project = useMemo(
    () => (goal?.project_id ? projects.find((p) => p.project_id === goal.project_id) : null),
    [projects, goal]
  );

  const goalType = goal ? GOAL_TYPES.find((t) => t.value === goal.goal_type) : null;

  // Task stats
  const { data: goalTasks = [] } = useQuery({
    queryKey: ["goal-detail-tasks", goalId],
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("task_id, status, name")
        .eq("user_id", user!.id)
        .eq("goal_id", goalId!)
        .eq("archived", false);
      return data ?? [];
    },
    enabled: !!user && !!goalId,
  });

  const taskStats = useMemo(() => {
    const total = goalTasks.length;
    const done = goalTasks.filter((t) => t.status === "done").length;
    return { total, done, progress: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [goalTasks]);

  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [archiveGoalOpen, setArchiveGoalOpen] = useState(false);

  if (loadingGoals) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
        <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-lg font-medium">Goal not found</p>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          This goal may have been deleted or archived
        </p>
        <Button variant="outline" onClick={() => navigate("/goals")}>
          Back to Goals
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          {project ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/projects">Projects</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/projects/${project.project_id}`}>{project.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/goals">Goals</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{goal.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{goal.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold truncate">{goal.name}</h1>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${goal.color}20`,
                    color: goal.color,
                  }}
                >
                  {goalType?.icon} {goalType?.label}
                </Badge>
                {project && (
                  <Badge
                    variant="outline"
                    className="cursor-pointer"
                    style={{ borderColor: project.color, color: project.color }}
                    onClick={() => navigate(`/projects/${project.project_id}`)}
                  >
                    {project.icon} {project.name}
                  </Badge>
                )}
              </div>
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                {goal.target_date && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    Target: {format(new Date(goal.target_date), "MMM d, yyyy")}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <ListTodo className="h-4 w-4" />
                  {taskStats.done}/{taskStats.total} tasks
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {taskStats.progress}% complete
                </span>
              </div>
              {taskStats.total > 0 && (
                <Progress value={taskStats.progress} className="h-2 mt-3" />
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="gap-1"
                onClick={() => setEditGoalOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1"
                onClick={() => setArchiveGoalOpen(true)}
              >
                <Archive className="h-3.5 w-3.5" /> Archive
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Flat Grid Content */}
      <GoalDetailContent goalId={goal.goal_id} />

      {/* Analytics */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Analytics</h2>
        <GoalAnalytics goalId={goal.goal_id} />
      </div>

      {/* Dialogs */}
      {editGoalOpen && (
        <GoalFormDialog
          open={editGoalOpen}
          onOpenChange={setEditGoalOpen}
          onSubmit={(values) => {
            updateGoal.mutate(
              { id: goal.goal_id, ...values } as any,
              {
                onSuccess: () => toast.success("Goal updated"),
                onError: (e: any) => toast.error(e.message),
              }
            );
          }}
          defaultValues={goal}
          isEditing
        />
      )}

      <ArchiveConfirmDialog
        open={archiveGoalOpen}
        onOpenChange={setArchiveGoalOpen}
        itemName={goal.name}
        onConfirm={() => {
          archiveGoal.mutate(goal.goal_id, {
            onSuccess: () => {
              toast.success("Goal archived");
              navigate(project ? `/projects/${project.project_id}` : "/goals");
            },
          });
          setArchiveGoalOpen(false);
        }}
      />
    </div>
  );
}
