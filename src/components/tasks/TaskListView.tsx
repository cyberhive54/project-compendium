import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Archive, ListFilter, X } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { useTasks } from "@/hooks/useTasks";
import { useGoals } from "@/hooks/useGoals";
import { ArchiveConfirmDialog } from "@/components/goals/ArchiveConfirmDialog";
import { toast } from "sonner";
import type { Task } from "@/types/database";

interface TaskListViewProps {
  goalId?: string;
  onEditTask: (task: Task) => void;
}

export function TaskListView({ goalId, onEditTask }: TaskListViewProps) {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [goalFilter, setGoalFilter] = useState<string>(goalId ?? "");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkPostponeDate, setBulkPostponeDate] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: goals = [] } = useGoals();
  const { data: tasks = [], markDone, postpone, archive, bulkPostpone, bulkArchive, remove } =
    useTasks({
      goalId: goalFilter || undefined,
      status: statusFilter || undefined,
      taskType: typeFilter || undefined,
      scheduledDate: dateFilter || undefined,
    });

  const handleToggleSelect = (taskId: string) => {
    setSelectedIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleBulkPostpone = () => {
    if (selectedIds.length === 0 || !bulkPostponeDate) return;
    bulkPostpone.mutate(
      { taskIds: selectedIds, newDate: bulkPostponeDate },
      {
        onSuccess: () => {
          toast.success(`${selectedIds.length} tasks postponed`);
          setSelectedIds([]);
          setBulkPostponeDate("");
        },
      }
    );
  };

  const handleBulkArchive = () => {
    if (selectedIds.length === 0) return;
    bulkArchive.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(`${selectedIds.length} tasks archived`);
        setSelectedIds([]);
      },
    });
  };

  const hasActiveFilters = statusFilter || goalFilter || typeFilter || dateFilter;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <ListFilter className="h-4 w-4 text-muted-foreground" />

        {!goalId && (
          <Select value={goalFilter || "__all__"} onValueChange={(v) => setGoalFilter(v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="All goals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All goals</SelectItem>
              {goals.map((g) => (
                <SelectItem key={g.goal_id} value={g.goal_id}>
                  {g.icon} {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={statusFilter || "__all__"} onValueChange={(v) => setStatusFilter(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="postponed">Postponed</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-[150px] h-8 text-xs"
        />

        {hasActiveFilters && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => {
              setStatusFilter("");
              if (!goalId) setGoalFilter("");
              setTypeFilter("");
              setDateFilter("");
            }}
          >
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
          <Badge variant="secondary" className="text-xs">
            {selectedIds.length} selected
          </Badge>
          <div className="flex items-center gap-1 ml-auto">
            <Input
              type="date"
              value={bulkPostponeDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setBulkPostponeDate(e.target.value)}
              className="w-[140px] h-7 text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={!bulkPostponeDate}
              onClick={handleBulkPostpone}
            >
              <CalendarDays className="h-3 w-3 mr-1" /> Postpone
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleBulkArchive}
            >
              <Archive className="h-3 w-3 mr-1" /> Archive
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => setSelectedIds([])}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.task_id}
            task={task}
            onEdit={onEditTask}
            onMarkDone={(id) =>
              markDone.mutate(id, {
                onSuccess: () => toast.success("Task completed! 🎉"),
              })
            }
            onPostpone={(id, date) =>
              postpone.mutate(
                { taskId: id, newDate: date },
                { onSuccess: () => toast.success("Task postponed") }
              )
            }
            onArchive={(id) => archive.mutate(id)}
            onDelete={(id) => {
              const t = tasks.find((x) => x.task_id === id);
              if (t) setDeleteTarget({ id, name: t.name });
            }}
            selected={selectedIds.includes(task.task_id)}
            onSelect={handleToggleSelect}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground text-sm">No tasks found</p>
            {hasActiveFilters && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                Try adjusting your filters
              </p>
            )}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <ArchiveConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        itemName={deleteTarget?.name ?? ""}
        isPermanentDelete
        onConfirm={() => {
          if (deleteTarget) {
            remove.mutate(deleteTarget.id, {
              onSuccess: () => toast.success("Task deleted"),
            });
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
