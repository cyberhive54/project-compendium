import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import { useNavigate } from "react-router-dom";
import type { Goal } from "@/types/database";
import { GOAL_TYPES } from "@/types/database";

export function ActiveGoals() {
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const { data: allTasks, isLoading: tasksLoading } = useTasks();
  const navigate = useNavigate();

  const isLoading = goalsLoading || tasksLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i}>
              <div className="flex justify-between mb-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!goals?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Target className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No active goals yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Create your first goal to track your progress!
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => navigate("/goals")}
            >
              Create a Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Active Goals</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/goals")}>
          View all
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.slice(0, 3).map((goal: Goal) => {
          const goalTasks = allTasks?.filter((t) => t.goal_id === goal.goal_id) ?? [];
          const doneTasks = goalTasks.filter((t) => t.status === "done");
          const progress = goalTasks.length > 0
            ? Math.round((doneTasks.length / goalTasks.length) * 100)
            : 0;
          const goalType = GOAL_TYPES.find((gt) => gt.value === goal.goal_type);

          return (
            <div key={goal.goal_id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{goalType?.icon ?? "🎯"}</span>
                  <span className="text-sm font-medium truncate">{goal.name}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {doneTasks.length}/{goalTasks.length} tasks · {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
