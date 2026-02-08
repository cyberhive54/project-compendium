import { Clock, ListTodo, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectAnalytics } from "@/hooks/useAnalyticsData";

interface ProjectAnalyticsProps {
  projectId: string;
}

export function ProjectAnalytics({ projectId }: ProjectAnalyticsProps) {
  const { data, isLoading } = useProjectAnalytics(projectId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: "Study Time",
      value: data.timeStudied > 60
        ? `${Math.floor(data.timeStudied / 60)}h ${data.timeStudied % 60}m`
        : `${data.timeStudied}m`,
      icon: Clock,
    },
    {
      label: "Tasks Done",
      value: `${data.tasksCompleted}/${data.totalTasks}`,
      icon: ListTodo,
    },
    {
      label: "Completion",
      value: data.totalTasks > 0
        ? `${Math.round((data.tasksCompleted / data.totalTasks) * 100)}%`
        : "0%",
      icon: TrendingUp,
    },
    {
      label: "Avg Accuracy",
      value: data.avgAccuracy !== null ? `${data.avgAccuracy}%` : "–",
      icon: Target,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-xl font-bold mt-1">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
