import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  MoreHorizontal,
  Pencil,
  Archive,
  Trash2,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EXAM_TASK_TYPES, PRIORITY_PRESETS } from "@/types/database";
import type { Task } from "@/types/database";
import { SubtaskList } from "./SubtaskList";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onMarkDone: (taskId: string) => void;
  onPostpone: (taskId: string, date: string) => void;
  onArchive: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  selected?: boolean;
  onSelect?: (taskId: string) => void;
}

export function TaskCard({
  task,
  onEdit,
  onMarkDone,
  onPostpone,
  onArchive,
  onDelete,
  selected,
  onSelect,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [postponeOpen, setPostponeOpen] = useState(false);
  const [postponeDate, setPostponeDate] = useState("");
  const isDone = task.status === "done";
  const isExam = EXAM_TASK_TYPES.includes(task.task_type);

  const priorityColor = () => {
    if (task.priority_number >= 7500) return "bg-destructive/10 text-destructive";
    if (task.priority_number >= 5000) return "bg-warning/10 text-warning";
    if (task.priority_number >= 2500) return "bg-primary/10 text-primary";
    return "bg-muted text-muted-foreground";
  };

  const statusColor = () => {
    switch (task.status) {
      case "done": return "bg-success/10 text-success";
      case "in_progress": return "bg-primary/10 text-primary";
      case "postponed": return "bg-warning/10 text-warning";
      case "pending": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const priorityLabel = PRIORITY_PRESETS.find(
    (p) => task.priority_number <= p.value + 500 && task.priority_number >= p.value - 500
  )?.label ?? `P${task.priority_number}`;

  return (
    <Card className={cn("transition-colors", selected && "ring-2 ring-primary")}>
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          {/* Selection checkbox */}
          {onSelect && (
            <button
              className="mt-0.5 shrink-0"
              onClick={() => onSelect(task.task_id)}
            >
              {selected ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}

          {/* Done toggle */}
          <button
            className="mt-0.5 shrink-0"
            onClick={() => !isDone && onMarkDone(task.task_id)}
          >
            {isDone ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "font-medium text-sm cursor-pointer",
                  isDone && "line-through text-muted-foreground"
                )}
                onClick={() => setExpanded(!expanded)}
              >
                {task.name}
              </span>
              <Badge variant="outline" className={cn("text-[10px]", statusColor())}>
                {task.status}
              </Badge>
              <Badge variant="outline" className={cn("text-[10px]", priorityColor())}>
                {priorityLabel}
              </Badge>
              {isExam && (
                <Badge variant="outline" className="text-[10px]">
                  {task.task_type}
                </Badge>
              )}
            </div>

            {task.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              {task.scheduled_date && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {format(new Date(task.scheduled_date), "MMM d")}
                </span>
              )}
              {task.estimated_duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.estimated_duration}m
                </span>
              )}
              {task.is_postponed && task.postponed_from_date && (
                <span className="flex items-center gap-1 text-warning">
                  <ArrowRight className="h-3 w-3" />
                  from {format(new Date(task.postponed_from_date), "MMM d")}
                </span>
              )}
            </div>

            {/* Expanded: subtasks + exam results */}
            {expanded && (
              <div className="mt-3 space-y-3">
                <SubtaskList taskId={task.task_id} />
                {isExam && task.total_questions && (
                  <div className="grid grid-cols-4 gap-2 p-2 rounded-md bg-muted/30 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Score</p>
                      <p className="text-xs font-medium">
                        {task.marks_obtained ?? "–"}/{task.total_marks ?? "–"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Accuracy</p>
                      <p className="text-xs font-medium">
                        {task.accuracy_percentage?.toFixed(1) ?? "–"}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Speed</p>
                      <p className="text-xs font-medium">
                        {task.speed_qpm?.toFixed(2) ?? "–"} Q/m
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Attempted</p>
                      <p className="text-xs font-medium">
                        {task.attempted_questions ?? "–"}/{task.total_questions}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isDone && (
                <DropdownMenuItem onClick={() => onMarkDone(task.task_id)}>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Done
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              {!isDone && (
                <DropdownMenuItem onClick={() => setPostponeOpen(true)}>
                  <CalendarDays className="h-4 w-4 mr-2" /> Postpone
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onArchive(task.task_id)}>
                <Archive className="h-4 w-4 mr-2" /> Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(task.task_id)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Postpone popover */}
        <Popover open={postponeOpen} onOpenChange={setPostponeOpen}>
          <PopoverTrigger asChild>
            <span />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="end">
            <div className="space-y-2">
              <p className="text-sm font-medium">Postpone to</p>
              <Input
                type="date"
                value={postponeDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setPostponeDate(e.target.value)}
              />
              <Button
                size="sm"
                className="w-full"
                disabled={!postponeDate}
                onClick={() => {
                  onPostpone(task.task_id, postponeDate);
                  setPostponeOpen(false);
                  setPostponeDate("");
                }}
              >
                Postpone
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
}
