import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Archive,
  Plus,
  Target,
  ListTodo,
  TrendingUp,
  FolderOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { GoalCard } from "@/components/goals/GoalCard";
import type { Goal, Project } from "@/types/database";

interface ProjectCardProps {
  project: Project;
  goals: Goal[];
  taskStats: { total: number; done: number; progress: number };
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onArchiveGoal: (goalId: string, goalName: string) => void;
  onAddTask: (goalId: string) => void;
}

export function ProjectCard({
  project,
  goals,
  taskStats,
  expanded,
  onToggleExpand,
  onEdit,
  onArchive,
  onAddGoal,
  onEditGoal,
  onArchiveGoal,
  onAddTask,
}: ProjectCardProps) {
  const navigate = useNavigate();

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/projects/${project.project_id}`);
  };

  return (
    <Collapsible open={expanded} onOpenChange={onToggleExpand}>
      <Card
        className="overflow-hidden"
        style={{ borderLeftWidth: 4, borderLeftColor: project.color }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            <span className="text-2xl cursor-pointer" onClick={handleNameClick}>{project.icon}</span>
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-base truncate cursor-pointer hover:text-primary transition-colors"
                onClick={handleNameClick}
              >
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                  {project.description}
                </p>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {goals.length} goal{goals.length !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <ListTodo className="h-3 w-3" />
                  {taskStats.done}/{taskStats.total} tasks
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {taskStats.progress}% complete
                </span>
              </div>

              {/* Progress bar */}
              {taskStats.total > 0 && (
                <Progress
                  value={taskStats.progress}
                  className="h-1.5 mt-2"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1"
                onClick={onAddGoal}
              >
                <Plus className="h-3 w-3" /> Goal
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={onEdit}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={onArchive}
              >
                <Archive className="h-3.5 w-3.5" />
              </Button>
              <CollapsibleTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  {expanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 space-y-3">
            {goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8 text-center">
                <FolderOpen className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No goals in this project yet
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={onAddGoal}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add First Goal
                </Button>
              </div>
            ) : (
              goals.map((goal) => (
                <GoalCard
                  key={goal.goal_id}
                  goal={goal}
                  onEdit={onEditGoal}
                  onArchive={(id) => onArchiveGoal(id, goal.name)}
                  onAddTask={onAddTask}
                />
              ))
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
