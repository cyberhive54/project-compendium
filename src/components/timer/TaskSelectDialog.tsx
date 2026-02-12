import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
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
import { Separator } from "@/components/ui/separator";
import { Search, Timer, Zap, Calendar, Clock, CalendarClock } from "lucide-react";
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

  const activeTasks = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");

    return (tasks ?? [])
      .filter(
        (t) => t.status !== "done" && t.name.toLowerCase().includes(search.toLowerCase())
      )
      .map((task) => {
        const taskDate = task.scheduled_date || "";
        let category: 'today' | 'past' | 'future' | 'unscheduled';

        if (!taskDate) {
          category = 'unscheduled';
        } else if (taskDate === today) {
          category = 'today';
        } else if (taskDate < today) {
          category = 'past';
        } else {
          category = 'future';
        }

        return { ...task, category, taskDate };
      })
      .sort((a, b) => {
        // Sort by category first
        const categoryOrder = { today: 0, past: 1, future: 2, unscheduled: 3 };
        const catDiff = categoryOrder[a.category] - categoryOrder[b.category];
        if (catDiff !== 0) return catDiff;

        // Within each category
        if (a.category === 'past') {
          // Past: most recent first
          return b.taskDate.localeCompare(a.taskDate);
        } else if (a.category === 'future') {
          // Future: earliest first
          return a.taskDate.localeCompare(b.taskDate);
        } else {
          // Today or unscheduled: sort by priority then name
          if ((a.priority_number ?? 0) !== (b.priority_number ?? 0)) {
            return (b.priority_number ?? 0) - (a.priority_number ?? 0);
          }
          return a.name.localeCompare(b.name);
        }
      });
  }, [tasks, search]);

  const handleSelect = (taskId: string, taskName: string) => {
    onSelect(taskId, taskName, pomodoroMode);
    onOpenChange(false);
    setSearch("");
  };

  // Group tasks by category
  const todayTasks = activeTasks.filter(t => t.category === 'today');
  const pastTasks = activeTasks.filter(t => t.category === 'past');
  const futureTasks = activeTasks.filter(t => t.category === 'future');
  const unscheduledTasks = activeTasks.filter(t => t.category === 'unscheduled');

  const renderTaskButton = (task: typeof activeTasks[0]) => (
    <button
      key={task.task_id}
      onClick={() => handleSelect(task.task_id, task.name)}
      className={cn(
        "w-full text-left rounded-lg px-4 py-3 hover:bg-accent transition-all",
        "flex flex-col gap-2 border-2 border-transparent hover:border-primary/20",
        "bg-card hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium line-clamp-2 flex-1">{task.name}</p>
        <Badge variant="outline" className="text-[10px] shrink-0">
          {task.status}
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="capitalize">{task.task_type}</span>
        {task.scheduled_date && (
          <>
            <span>•</span>
            <span>{format(new Date(task.scheduled_date), "MMM d")}</span>
          </>
        )}
      </div>
    </button>
  );

  const renderSection = (title: string, tasks: typeof activeTasks, icon: React.ReactNode) => {
    if (tasks.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2 py-1">
          {icon}
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
          <Badge variant="secondary" className="text-[10px] ml-auto">
            {tasks.length}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tasks.map(renderTaskButton)}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Select a Task to Study</DialogTitle>
          <DialogDescription>
            Pick a task to start a timer session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={pomodoroMode ? "default" : "outline"}
              size="default"
              onClick={() => setPomodoroMode(!pomodoroMode)}
              className="gap-1.5 shrink-0"
            >
              <Zap className="h-4 w-4" />
              Pomodoro
            </Button>
          </div>

          <ScrollArea className="h-[550px] pr-4">
            {activeTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Timer className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {search ? "No matching tasks found" : "No active tasks available"}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {renderSection(
                  "Today",
                  todayTasks,
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                )}

                {renderSection(
                  "Yesterday & Older",
                  pastTasks,
                  <Clock className="h-3.5 w-3.5 text-orange-500" />
                )}

                {renderSection(
                  "Tomorrow & Future",
                  futureTasks,
                  <CalendarClock className="h-3.5 w-3.5 text-blue-500" />
                )}

                {renderSection(
                  "Unscheduled",
                  unscheduledTasks,
                  <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
