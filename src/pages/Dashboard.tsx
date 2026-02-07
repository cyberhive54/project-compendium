import { BookOpen, CheckCircle2, Flame, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Time Studied", value: "0h 0m", icon: BookOpen, color: "text-primary" },
  { label: "Tasks Done", value: "0/0", icon: CheckCircle2, color: "text-success" },
  { label: "Current Streak", value: "0 days", icon: Flame, color: "text-warning" },
  { label: "Adherence", value: "—", icon: Target, color: "text-info" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-lg border bg-card p-6">
        <h1 className="text-2xl font-bold">Welcome back! 👋</h1>
        <p className="text-muted-foreground mt-1">
          Level 1 · 0 day streak
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No tasks scheduled for today</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Create your first goal to get started!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Target className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No active goals yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Set up a goal to track your progress
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
