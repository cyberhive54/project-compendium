import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Archive,
  Target,
  ListTodo,
  TrendingUp,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectAnalytics } from "@/components/analytics/ProjectAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useProjects } from "@/hooks/useProjects";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalFormDialog } from "@/components/goals/GoalFormDialog";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { ArchiveConfirmDialog } from "@/components/goals/ArchiveConfirmDialog";
import { ArchiveProjectDialog } from "@/components/projects/ArchiveProjectDialog";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { toast } from "sonner";
import type { Goal, Project, Task } from "@/types/database";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: allProjects = [],
    isLoading: loadingProject,
    update: updateProject,
    archive: cascadeArchiveProject,
  } = useProjects(false);

  const {
    data: allGoals = [],
    isLoading: loadingGoals,
    create: createGoal,
    update: updateGoal,
    archive: archiveGoal,
  } = useGoals();

  const tasksHook = useTasks();

  const project = useMemo(
    () => allProjects.find((p) => p.project_id === projectId),
    [allProjects, projectId]
  );

  const projectGoals = useMemo(
    () => allGoals.filter((g) => g.project_id === projectId),
    [allGoals, projectId]
  );

  // Task stats
  const { data: taskStatsRaw = [] } = useQuery({
    queryKey: ["project-detail-task-stats", projectId],
    queryFn: async () => {
      const goalIds = projectGoals.map((g) => g.goal_id);
      if (!goalIds.length) return [];
      const { data } = await supabase
        .from("tasks")
        .select("goal_id, status")
        .eq("user_id", user!.id)
        .eq("archived", false)
        .in("goal_id", goalIds);
      return data ?? [];
    },
    enabled: !!user && projectGoals.length > 0,
  });

  const taskStats = useMemo(() => {
    let total = 0;
    let done = 0;
    for (const t of taskStatsRaw) {
      total++;
      if (t.status === "done") done++;
    }
    return { total, done, progress: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [taskStatsRaw]);

  // Dialog states
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [archiveProjectOpen, setArchiveProjectOpen] = useState(false);
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [archiveGoalTarget, setArchiveGoalTarget] = useState<{ id: string; name: string } | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [taskPresetGoalId, setTaskPresetGoalId] = useState<string | undefined>();

  if (loadingProject || loadingGoals) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
        <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-lg font-medium">Project not found</p>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          This project may have been deleted or archived
        </p>
        <Button variant="outline" onClick={() => navigate("/projects")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/projects">Projects</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <Card style={{ borderLeftWidth: 4, borderLeftColor: project.color }}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{project.icon}</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
              )}

              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {projectGoals.length} goal{projectGoals.length !== 1 ? "s" : ""}
                </span>
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
              <Button size="sm" variant="ghost" className="gap-1" onClick={() => setEditProjectOpen(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" variant="ghost" className="gap-1" onClick={() => setArchiveProjectOpen(true)}>
                <Archive className="h-3.5 w-3.5" /> Archive
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Goals Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Goals</h2>
        <Button size="sm" onClick={() => setCreateGoalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Goal
        </Button>
      </div>

      {projectGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-12 text-center">
          <Target className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No goals in this project yet</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => setCreateGoalOpen(true)}>
            <Plus className="h-3 w-3 mr-1" /> Add First Goal
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {projectGoals.map((goal) => (
            <GoalCard
              key={goal.goal_id}
              goal={goal}
              onEdit={setEditingGoal}
              onArchive={(id) => setArchiveGoalTarget({ id, name: goal.name })}
              onAddTask={(goalId) => {
                setTaskPresetGoalId(goalId);
                setCreateTaskOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Analytics */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Analytics</h2>
        <ProjectAnalytics projectId={project.project_id} />
      </div>

      {/* Dialogs */}
      {editProjectOpen && project && (
        <ProjectFormDialog
          open={editProjectOpen}
          onOpenChange={setEditProjectOpen}
          onSubmit={(values) => {
            updateProject.mutate(
              { id: project.project_id, ...values } as any,
              {
                onSuccess: () => toast.success("Project updated"),
                onError: (e: any) => toast.error(e.message),
              }
            );
          }}
          defaultValues={project}
          isEditing
        />
      )}

      {archiveProjectOpen && (
        <ArchiveProjectDialog
          open={archiveProjectOpen}
          onOpenChange={setArchiveProjectOpen}
          projectId={project.project_id}
          projectName={project.name}
          onConfirm={() => {
            cascadeArchiveProject.mutate(project.project_id, {
              onSuccess: () => {
                toast.success("Project archived");
                navigate("/projects");
              },
            });
            setArchiveProjectOpen(false);
          }}
        />
      )}

      <GoalFormDialog
        open={createGoalOpen}
        onOpenChange={setCreateGoalOpen}
        onSubmit={(values) => {
          createGoal.mutate(values as Partial<Goal>, {
            onSuccess: () => toast.success("Goal created!"),
            onError: (e: any) => toast.error(e.message),
          });
        }}
        presetProjectId={projectId}
      />

      {editingGoal && (
        <GoalFormDialog
          open={!!editingGoal}
          onOpenChange={() => setEditingGoal(null)}
          onSubmit={(values) => {
            updateGoal.mutate(
              { id: editingGoal.goal_id, ...values } as any,
              {
                onSuccess: () => toast.success("Goal updated"),
                onError: (e: any) => toast.error(e.message),
              }
            );
          }}
          defaultValues={editingGoal}
          isEditing
        />
      )}

      <ArchiveConfirmDialog
        open={!!archiveGoalTarget}
        onOpenChange={() => setArchiveGoalTarget(null)}
        itemName={archiveGoalTarget?.name ?? ""}
        onConfirm={() => {
          if (archiveGoalTarget) {
            archiveGoal.mutate(archiveGoalTarget.id, {
              onSuccess: () => toast.success("Goal archived"),
            });
            setArchiveGoalTarget(null);
          }
        }}
      />

      <TaskFormDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        presetGoalId={taskPresetGoalId}
        onSubmit={(values) => {
          tasksHook.create.mutate(values as Partial<Task>, {
            onSuccess: () => toast.success("Task created!"),
            onError: (e: any) => toast.error(e.message),
          });
        }}
      />
    </div>
  );
}
