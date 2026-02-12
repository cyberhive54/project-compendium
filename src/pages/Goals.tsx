import { useState, useMemo } from "react";
import { Plus, Target, FolderKanban, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGoals } from "@/hooks/useGoals";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalFormDialog } from "@/components/goals/GoalFormDialog";
import { ArchiveConfirmDialog } from "@/components/goals/ArchiveConfirmDialog";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Goal, Task } from "@/types/database";

export default function GoalsPage() {
  const { data: goals = [], isLoading, create, update, archive } = useGoals();
  const { data: archivedGoals = [], unarchive, remove: removeGoal } = useGoals({ archived: true });
  const { data: projects = [] } = useProjects();
  const tasksHook = useTasks();

  const [projectFilter, setProjectFilter] = useState("__all__");
  const [showArchived, setShowArchived] = useState(false);
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [taskPresetGoalId, setTaskPresetGoalId] = useState<
    string | undefined
  >();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredGoals = useMemo(() => {
    if (projectFilter === "__all__") return goals;
    if (projectFilter === "__unassigned__")
      return goals.filter((g) => !g.project_id);
    return goals.filter((g) => g.project_id === projectFilter);
  }, [goals, projectFilter]);

  const projectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    for (const p of projects) {
      map.set(p.project_id, { name: p.name, color: p.color });
    }
    return map;
  }, [projects]);

  const handleCreateGoal = (values: Record<string, any>) => {
    create.mutate(values as Partial<Goal>, {
      onSuccess: () => toast.success("Goal created!"),
      onError: (e: any) => toast.error(e.message),
    });
  };

  const handleEditGoal = (values: Record<string, any>) => {
    if (!editingGoal) return;
    update.mutate(
      { id: editingGoal.goal_id, ...values } as any,
      {
        onSuccess: () => toast.success("Goal updated"),
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  const handleAddTask = (goalId: string) => {
    setTaskPresetGoalId(goalId);
    setCreateTaskOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Goals & Tasks</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setTaskPresetGoalId(undefined);
              setCreateTaskOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Task
          </Button>
          <Button size="sm" onClick={() => setCreateGoalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Goal
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[180px] h-9">
            <FolderKanban className="h-3.5 w-3.5 mr-1.5 shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Projects</SelectItem>
            <SelectItem value="__unassigned__">Unassigned</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.project_id} value={p.project_id}>
                {p.icon} {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))
        ) : filteredGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No goals yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1 mb-4">
              Create your first goal to start organizing your studies
            </p>
            <Button onClick={() => setCreateGoalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Create Goal
            </Button>
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <GoalCard
              key={goal.goal_id}
              goal={goal}
              projectInfo={
                goal.project_id
                  ? projectMap.get(goal.project_id)
                  : undefined
              }
              onEdit={setEditingGoal}
              onArchive={(id) =>
                setArchiveTarget({ id, name: goal.name })
              }
              onAddTask={handleAddTask}
            />
          ))
        )}

        <div className="flex items-center gap-2 pt-4 border-t mt-6">
          <Switch
            checked={showArchived}
            onCheckedChange={setShowArchived}
          />
          <span className="text-sm text-muted-foreground">
            Show archived goals
          </span>
        </div>

        {showArchived && archivedGoals.length > 0 && (
          <div className="space-y-3 mt-4">
            <h2 className="text-lg font-semibold text-muted-foreground">
              Archived Goals
            </h2>
            {archivedGoals.map((g) => (
              <Card key={g.goal_id} className="opacity-60">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{g.icon}</span>
                      <div>
                        <span className="font-medium">{g.name}</span>
                        {g.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {g.description}
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
                          unarchive.mutate(g.goal_id, {
                            onSuccess: () =>
                              toast.success("Goal restored"),
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
                            id: g.goal_id,
                            name: g.name,
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
      </div>

      {/* Dialogs */}
      <GoalFormDialog
        open={createGoalOpen}
        onOpenChange={setCreateGoalOpen}
        onSubmit={handleCreateGoal}
      />

      {
        editingGoal && (
          <GoalFormDialog
            open={!!editingGoal}
            onOpenChange={() => setEditingGoal(null)}
            onSubmit={handleEditGoal}
            defaultValues={editingGoal}
            isEditing
          />
        )
      }

      <ArchiveConfirmDialog
        open={!!archiveTarget}
        onOpenChange={() => setArchiveTarget(null)}
        itemName={archiveTarget?.name ?? ""}
        onConfirm={() => {
          if (archiveTarget) {
            archive.mutate(archiveTarget.id, {
              onSuccess: () => toast.success("Goal archived"),
            });
            setArchiveTarget(null);
          }
        }}
      />

      <ArchiveConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        itemName={deleteTarget?.name ?? ""}
        isPermanentDelete
        onConfirm={() => {
          if (deleteTarget) {
            removeGoal.mutate(deleteTarget.id, {
              onSuccess: () => toast.success("Goal permanently deleted"),
              onError: (e: any) => toast.error(e.message),
            });
            setDeleteTarget(null);
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

      {
        editingTask && (
          <TaskFormDialog
            open={!!editingTask}
            onOpenChange={() => setEditingTask(null)}
            isEditing
            defaultValues={editingTask}
            onSubmit={(values) => {
              tasksHook.update.mutate(
                { id: editingTask.task_id, ...values } as any,
                {
                  onSuccess: () => toast.success("Task updated"),
                  onError: (e: any) => toast.error(e.message),
                }
              );
              setEditingTask(null);
            }}
          />
        )
      }
    </div >
  );
}
