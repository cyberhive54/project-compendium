import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, FolderKanban, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/useProjects";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { ArchiveProjectDialog } from "@/components/projects/ArchiveProjectDialog";
import { GoalFormDialog } from "@/components/goals/GoalFormDialog";
import { AddGoalToProjectDialog } from "@/components/projects/AddGoalToProjectDialog";
import { GoalCard } from "@/components/goals/GoalCard";
import { ArchiveConfirmDialog } from "@/components/goals/ArchiveConfirmDialog";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { toast } from "sonner";
import type { Goal, Project, Task } from "@/types/database";

export default function ProjectsPage() {
  const { user } = useAuth();
  const {
    data: activeProjects = [],
    isLoading: loadingActive,
    create: createProject,
    update: updateProject,
    archive: cascadeArchiveProject,
    unarchive: unarchiveProject,
    remove: removeProject,
  } = useProjects(false);
  const { data: archivedProjects = [] } = useProjects(true);
  const {
    data: allGoals = [],
    isLoading: loadingGoals,
    create: createGoal,
    update: updateGoal,
    archive: archiveGoal,
  } = useGoals();
  const tasksHook = useTasks();

  const [showArchived, setShowArchived] = useState(false);

  // Project dialogs
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [archiveProjectTarget, setArchiveProjectTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Goal dialogs
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [goalPresetProjectId, setGoalPresetProjectId] = useState<
    string | undefined
  >();
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [archiveGoalTarget, setArchiveGoalTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Task dialogs
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [taskPresetGoalId, setTaskPresetGoalId] = useState<
    string | undefined
  >();

  // Expand state persisted in localStorage
  const [expandedIds, setExpandedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("expanded_projects") || "[]"
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("expanded_projects", JSON.stringify(expandedIds));
  }, [expandedIds]);

  // Task stats query (lightweight: only goal_id + status)
  const { data: taskStatsRaw = [] } = useQuery({
    queryKey: ["project-task-stats", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("goal_id, status")
        .eq("user_id", user!.id)
        .eq("archived", false);
      return data ?? [];
    },
    enabled: !!user,
  });

  // Computed
  const goalsByProject = useMemo(() => {
    const map = new Map<string, Goal[]>();
    for (const goal of allGoals) {
      if (goal.project_id) {
        const existing = map.get(goal.project_id) ?? [];
        existing.push(goal);
        map.set(goal.project_id, existing);
      }
    }
    return map;
  }, [allGoals]);

  const unassignedGoals = useMemo(
    () => allGoals.filter((g) => !g.project_id),
    [allGoals]
  );

  const getProjectStats = useCallback(
    (projectGoals: Goal[]) => {
      const goalIds = new Set(projectGoals.map((g) => g.goal_id));
      let total = 0;
      let done = 0;
      for (const task of taskStatsRaw) {
        if (goalIds.has(task.goal_id)) {
          total++;
          if (task.status === "done") done++;
        }
      }
      return {
        total,
        done,
        progress: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    },
    [taskStatsRaw]
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Handlers
  const handleCreateProject = (values: Record<string, any>) => {
    createProject.mutate(values as Partial<Project>, {
      onSuccess: () => toast.success("Project created!"),
      onError: (e: any) => toast.error(e.message),
    });
  };

  const handleEditProject = (values: Record<string, any>) => {
    if (!editingProject) return;
    updateProject.mutate(
      { id: editingProject.project_id, ...values } as any,
      {
        onSuccess: () => toast.success("Project updated"),
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  const handleArchiveProject = () => {
    if (!archiveProjectTarget) return;
    cascadeArchiveProject.mutate(archiveProjectTarget.id, {
      onSuccess: () => toast.success("Project archived"),
    });
    setArchiveProjectTarget(null);
  };

  const handleAddGoal = (projectId: string) => {
    setGoalPresetProjectId(projectId);
    setAddGoalDialogOpen(true);
  };

  const [addGoalDialogOpen, setAddGoalDialogOpen] = useState(false);

  const handleCreateGoal = (values: Record<string, any>) => {
    createGoal.mutate(values as Partial<Goal>, {
      onSuccess: () => toast.success("Goal created!"),
      onError: (e: any) => toast.error(e.message),
    });
  };

  const handleEditGoal = (values: Record<string, any>) => {
    if (!editingGoal) return;
    updateGoal.mutate(
      { id: editingGoal.goal_id, ...values } as any,
      {
        onSuccess: () => toast.success("Goal updated"),
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  const isLoading = loadingActive || loadingGoals;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button size="sm" onClick={() => setCreateProjectOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Project
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : activeProjects.length === 0 && unassignedGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
          <FolderKanban className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No projects yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-4">
            Create your first project to organize your goals
          </p>
          <Button onClick={() => setCreateProjectOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Create Your First Project
          </Button>
        </div>
      ) : (
        <>
          {/* Active projects */}
          <div className="space-y-3">
            {activeProjects.map((project) => {
              const projectGoals =
                goalsByProject.get(project.project_id) ?? [];
              const stats = getProjectStats(projectGoals);
              return (
                <ProjectCard
                  key={project.project_id}
                  project={project}
                  goals={projectGoals}
                  taskStats={stats}
                  expanded={expandedIds.includes(project.project_id)}
                  onToggleExpand={() => toggleExpand(project.project_id)}
                  onEdit={() => setEditingProject(project)}
                  onArchive={() =>
                    setArchiveProjectTarget({
                      id: project.project_id,
                      name: project.name,
                    })
                  }
                  onAddGoal={() => handleAddGoal(project.project_id)}
                  onEditGoal={setEditingGoal}
                  onArchiveGoal={(id, name) =>
                    setArchiveGoalTarget({ id, name })
                  }
                  onAddTask={(goalId) => {
                    setTaskPresetGoalId(goalId);
                    setCreateTaskOpen(true);
                  }}
                />
              );
            })}
          </div>

          {/* Unassigned Goals */}
          {unassignedGoals.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-muted-foreground">
                Unassigned Goals
              </h2>
              {unassignedGoals.map((goal) => (
                <GoalCard
                  key={goal.goal_id}
                  goal={goal}
                  onEdit={setEditingGoal}
                  onArchive={(id) =>
                    setArchiveGoalTarget({ id, name: goal.name })
                  }
                  onAddTask={(goalId) => {
                    setTaskPresetGoalId(goalId);
                    setCreateTaskOpen(true);
                  }}
                />
              ))}
            </div>
          )}

          {/* Show archived toggle */}
          <div className="flex items-center gap-2 pt-2">
            <Switch
              checked={showArchived}
              onCheckedChange={setShowArchived}
            />
            <span className="text-sm text-muted-foreground">
              Show archived projects
            </span>
          </div>

          {showArchived && archivedProjects.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-muted-foreground">
                Archived Projects
              </h2>
              {archivedProjects.map((project) => (
                <Card key={project.project_id} className="opacity-60">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{project.icon}</span>
                        <div>
                          <span className="font-medium">{project.name}</span>
                          {project.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            unarchiveProject.mutate(project.project_id, {
                              onSuccess: () =>
                                toast.success("Project restored"),
                            });
                          }}
                        >
                          <RotateCcw className="h-3 w-3" /> Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs gap-1"
                          onClick={() =>
                            setDeleteTarget({
                              id: project.project_id,
                              name: project.name,
                            })
                          }
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== Dialogs ===== */}

      {/* Create Project */}
      <ProjectFormDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        onSubmit={handleCreateProject}
      />

      {/* Edit Project */}
      {editingProject && (
        <ProjectFormDialog
          open={!!editingProject}
          onOpenChange={() => setEditingProject(null)}
          onSubmit={handleEditProject}
          defaultValues={editingProject}
          isEditing
        />
      )}

      {/* Archive Project Confirmation */}
      {archiveProjectTarget && (
        <ArchiveProjectDialog
          open={!!archiveProjectTarget}
          onOpenChange={() => setArchiveProjectTarget(null)}
          projectId={archiveProjectTarget.id}
          projectName={archiveProjectTarget.name}
          onConfirm={handleArchiveProject}
        />
      )}

      {/* Permanent Delete Confirmation */}
      <ArchiveConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        itemName={deleteTarget?.name ?? ""}
        isPermanentDelete
        onConfirm={() => {
          if (deleteTarget) {
            removeProject.mutate(deleteTarget.id, {
              onSuccess: () => toast.success("Project permanently deleted"),
              onError: (e: any) => toast.error(e.message),
            });
            setDeleteTarget(null);
          }
        }}
      />

      {/* Add Goal to Project (tabbed: Create/Add Existing) */}
      {goalPresetProjectId && (
        <AddGoalToProjectDialog
          open={addGoalDialogOpen}
          onOpenChange={setAddGoalDialogOpen}
          projectId={goalPresetProjectId}
          onCreateGoal={handleCreateGoal}
        />
      )}

      {/* Create Goal (standalone, not from project context) */}
      <GoalFormDialog
        open={createGoalOpen}
        onOpenChange={setCreateGoalOpen}
        onSubmit={handleCreateGoal}
      />

      {/* Edit Goal */}
      {editingGoal && (
        <GoalFormDialog
          open={!!editingGoal}
          onOpenChange={() => setEditingGoal(null)}
          onSubmit={handleEditGoal}
          defaultValues={editingGoal}
          isEditing
        />
      )}

      {/* Archive Goal Confirmation */}
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

      {/* Create Task */}
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
