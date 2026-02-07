import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSubtasks } from "@/hooks/useSubtasks";
import type { Subtask } from "@/types/database";

interface SubtaskListProps {
  taskId: string;
}

export function SubtaskList({ taskId }: SubtaskListProps) {
  const { data: subtasks = [], create, toggleComplete, update, remove } =
    useSubtasks(taskId);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    create.mutate({
      task_id: taskId,
      title,
      order_index: subtasks.length,
    });
    setNewTitle("");
  };

  const handleEditSave = (id: string) => {
    const title = editingTitle.trim();
    if (title) {
      update.mutate({ id, title });
    }
    setEditingId(null);
  };

  const completedCount = subtasks.filter((s) => s.completed).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Subtasks{" "}
          {subtasks.length > 0 && (
            <span className="text-muted-foreground font-normal">
              ({completedCount}/{subtasks.length})
            </span>
          )}
        </span>
      </div>

      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <div
            key={subtask.subtask_id}
            className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-muted/50 group"
          >
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={(checked) =>
                toggleComplete.mutate({
                  id: subtask.subtask_id,
                  completed: !!checked,
                })
              }
            />
            {editingId === subtask.subtask_id ? (
              <Input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => handleEditSave(subtask.subtask_id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditSave(subtask.subtask_id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="h-7 text-sm flex-1"
                autoFocus
              />
            ) : (
              <span
                className={`flex-1 text-sm cursor-pointer ${
                  subtask.completed ? "line-through text-muted-foreground" : ""
                }`}
                onClick={() => {
                  setEditingId(subtask.subtask_id);
                  setEditingTitle(subtask.title);
                }}
              >
                {subtask.title}
              </span>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={() => remove.mutate(subtask.subtask_id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add subtask..."
          className="h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <Button size="sm" variant="outline" className="h-8" onClick={handleAdd}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
