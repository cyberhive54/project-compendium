import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Archive,
  CalendarDays,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GOAL_TYPES } from "@/types/database";
import type { Goal } from "@/types/database";
import { HierarchyTree } from "./HierarchyTree";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onArchive: (goalId: string) => void;
  onAddTask: (goalId: string) => void;
}

export function GoalCard({ goal, onEdit, onArchive, onAddTask }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const goalType = GOAL_TYPES.find((t) => t.value === goal.goal_type);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{goal.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base truncate">{goal.name}</h3>
              <Badge
                variant="secondary"
                className="text-xs shrink-0"
                style={{
                  backgroundColor: `${goal.color}20`,
                  color: goal.color,
                }}
              >
                {goalType?.icon} {goalType?.label}
              </Badge>
            </div>
            {goal.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {goal.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              {goal.target_date && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {format(new Date(goal.target_date), "MMM d, yyyy")}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1"
              onClick={() => onAddTask(goal.goal_id)}
            >
              <Plus className="h-3 w-3" /> Task
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => onEdit(goal)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => onArchive(goal.goal_id)}
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 pb-4">
          <HierarchyTree goalId={goal.goal_id} />
        </CardContent>
      )}
    </Card>
  );
}
