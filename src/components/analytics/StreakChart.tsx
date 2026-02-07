import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame } from "lucide-react";

interface Props {
  data:
    | {
        currentStreak: number;
        longestStreak: number;
        days: Array<{ date: string; studied: boolean; minutes: number }>;
      }
    | undefined;
  isLoading: boolean;
}

export function StreakChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm">Streak</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[200px] w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-warning" />
            Streak
          </span>
          <div className="flex items-center gap-4 text-xs font-normal text-muted-foreground">
            <span>Current: <strong className="text-foreground">{data?.currentStreak ?? 0}</strong></span>
            <span>Longest: <strong className="text-foreground">{data?.longestStreak ?? 0}</strong></span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data?.days?.length ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data.days}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9 }}
                interval="preserveStartEnd"
                className="fill-muted-foreground"
              />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  fontSize: 12,
                }}
                formatter={(value: number) => [`${value}m`, "Study Time"]}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="hsl(var(--warning))"
                fill="hsl(var(--warning) / 0.15)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
            Study to build your streak
          </div>
        )}
      </CardContent>
    </Card>
  );
}
