import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2, Target, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsSummary } from "@/hooks/useAnalyticsData";

interface Props {
  data: AnalyticsSummary | undefined;
  isLoading: boolean;
}

export function AnalyticsSummaryCards({ data, isLoading }: Props) {
  const cards = [
    {
      label: "Time Studied",
      value: data ? formatDuration(data.timeStudied) : "—",
      icon: Clock,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Tasks Completed",
      value: data?.tasksCompleted?.toString() ?? "—",
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Avg Accuracy",
      value: data?.avgAccuracy !== null && data?.avgAccuracy !== undefined ? `${data.avgAccuracy}%` : "—",
      icon: Target,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "XP Earned",
      value: data?.xpEarned?.toLocaleString() ?? "—",
      icon: Sparkles,
      color: "text-info",
      bg: "bg-info/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded ${card.bg}`}>
                    <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                </div>
                <p className="text-xl font-bold">{card.value}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
