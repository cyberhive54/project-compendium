import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Timer, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (taskId: string, taskName: string, pomodoro: boolean) => void;
}

export function TaskSelectDialog({ open, onOpenChange, onSelect }: TaskSelectDialogProps) {
  const { data: tasks } = useTasks({ archived: false });
  const [search, setSearch] = useState("");
  const [pomodoroMode, setPomodoroMode] = useState(false);

  const activeTasks = (tasks ?? []).filter(
    (t) => t.status !== "done" && t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (taskId: string, taskName: string) => {
    onSelect(taskId, taskName, pomodoroMode);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select a Task to Study</DialogTitle>
          <DialogDescription>
            Pick a task to start a timer session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={pomodoroMode ? "default" : "outline"}
              size="sm"
              onClick={() => setPomodoroMode(!pomodoroMode)}
              className="gap-1.5"
            >
              <Zap className="h-3.5 w-3.5" />
              Pomodoro Mode
            </Button>
          </div>

          <ScrollArea className="h-[300px]">
            {activeTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Timer className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {search ? "No matching tasks found" : "No active tasks available"}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {activeTasks.map((task) => (
                  <button
                    key={task.task_id}
                    onClick={() => handleSelect(task.task_id, task.name)}
                    className={cn(
                      "w-full text-left rounded-md px-3 py-2.5 hover:bg-accent transition-colors",
                      "flex items-center justify-between gap-2"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{task.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{task.task_type}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {task.status}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
