import { BookOpen, CheckCircle2, Flame, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/hooks/useDashboardStats";

interface QuickStatsCardsProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

export function QuickStatsCards({ stats, isLoading }: QuickStatsCardsProps) {
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const cards = [
    {
      label: "Time Studied",
      value: stats ? formatTime(stats.timeStudiedToday) : "—",
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Tasks Done",
      value: stats ? `${stats.tasksDoneToday}/${stats.totalTasksToday}` : "—",
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Current Streak",
      value: stats ? `${stats.currentStreak} days` : "—",
      icon: Flame,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Adherence",
      value: stats?.adherencePercent != null ? `${stats.adherencePercent}%` : "—",
      icon: Target,
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.label}
            </CardTitle>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
