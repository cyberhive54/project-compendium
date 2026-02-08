import { useState, useMemo } from "react";
import { Plus, Target, ListTodo, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { TaskListView } from "@/components/tasks/TaskListView";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Goal, Task } from "@/types/database";

export default function GoalsPage() {
  const { data: goals = [], isLoading, create, update, archive } = useGoals();
  const { data: projects = [] } = useProjects();
  const tasksHook = useTasks();

  const [projectFilter, setProjectFilter] = useState("__all__");
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<{
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

      <Tabs defaultValue="goals">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="goals" className="gap-1.5">
              <Target className="h-4 w-4" /> Goals
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-1.5">
              <ListTodo className="h-4 w-4" /> Tasks
            </TabsTrigger>
          </TabsList>

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

        <TabsContent value="goals" className="mt-4 space-y-3">
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
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <TaskListView onEditTask={setEditingTask} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <GoalFormDialog
        open={createGoalOpen}
        onOpenChange={setCreateGoalOpen}
        onSubmit={handleCreateGoal}
      />

      {editingGoal && (
        <GoalFormDialog
          open={!!editingGoal}
          onOpenChange={() => setEditingGoal(null)}
          onSubmit={handleEditGoal}
          defaultValues={editingGoal}
          isEditing
        />
      )}

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

      {editingTask && (
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
      )}
    </div>
  );
}
