import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatmapDay {
  date: string;
  day: string;
  week: number;
  minutes: number;
}

interface Props {
  data: HeatmapDay[] | undefined;
  isLoading: boolean;
}

function getIntensity(minutes: number): string {
  if (minutes === 0) return "bg-muted";
  if (minutes < 30) return "bg-success/20";
  if (minutes < 60) return "bg-success/40";
  if (minutes < 120) return "bg-success/60";
  return "bg-success/80";
}

export function StudyHeatmap({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm">Study Heatmap</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[140px] w-full" /></CardContent>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm">Study Heatmap</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[140px] flex items-center justify-center text-sm text-muted-foreground">
            Study to see your heatmap
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group by weeks
  const maxWeek = Math.max(...data.map((d) => d.week));
  const weeks: HeatmapDay[][] = [];
  for (let w = 0; w <= maxWeek; w++) {
    weeks.push(data.filter((d) => d.week === w));
  }

  const dayLabels = ["M", "", "W", "", "F", "", "S"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Study Heatmap
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-normal">
            <span>Less</span>
            {[0, 15, 45, 90, 150].map((m) => (
              <span key={m} className={cn("h-3 w-3 rounded-sm", getIntensity(m))} />
            ))}
            <span>More</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-[2px] overflow-x-auto">
          {/* Day labels */}
          <div className="flex flex-col gap-[2px] mr-1">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-3 w-4 text-[8px] text-muted-foreground flex items-center justify-end pr-0.5">
                {label}
              </div>
            ))}
          </div>
          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {Array.from({ length: 7 }, (_, di) => {
                const dayData = week.find((d) => {
                  const dayIndex = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(d.day);
                  return dayIndex === di;
                });

                return (
                  <Tooltip key={di}>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(
                          "h-3 w-3 rounded-sm transition-colors",
                          dayData ? getIntensity(dayData.minutes) : "bg-transparent"
                        )}
                      />
                    </TooltipTrigger>
                    {dayData && (
                      <TooltipContent side="top" className="text-xs">
                        <p>{dayData.date}: {dayData.minutes}m</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
