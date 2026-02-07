import { CalendarDays } from "lucide-react";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpcomingTasks } from "@/hooks/useDashboardStats";
import type { Task } from "@/types/database";

export function UpcomingTasks() {
  const { data: tasks, isLoading } = useUpcomingTasks();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming (Next 7 Days)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!tasks?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming (Next 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming tasks</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upcoming (Next 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tasks.map((task: Task) => (
            <div
              key={task.task_id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <Badge variant="outline" className="text-xs shrink-0 min-w-[4rem] justify-center">
                {task.scheduled_date ? formatDate(task.scheduled_date) : "—"}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{task.task_type}</p>
              </div>
              <Badge
                variant="secondary"
                className={`text-xs shrink-0 ${
                  task.priority_number >= 5000
                    ? "bg-destructive/10 text-destructive"
                    : task.priority_number >= 2500
                    ? "bg-warning/10 text-warning"
                    : ""
                }`}
              >
                P{task.priority_number}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
