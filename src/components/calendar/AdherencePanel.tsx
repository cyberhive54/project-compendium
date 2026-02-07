import { format, startOfWeek, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Task, StudySessionConfig } from "@/types/database";

interface AdherencePanelProps {
  adherence: {
    total: number;
    done: number;
    percent: number | null;
    daily: Record<string, { total: number; done: number }>;
  };
  tasks: Task[];
  sessions: StudySessionConfig[];
  currentDate: Date;
}

export function AdherencePanel({
  adherence,
  tasks,
  sessions,
  currentDate,
}: AdherencePanelProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Session adherence: tasks tagged with a preferred_session_id
  const sessionStats = sessions.map((session) => {
    const sessionTasks = tasks.filter(
      (t) => t.preferred_session_id === session.session_config_id
    );
    const done = sessionTasks.filter((t) => t.status === "done").length;
    return {
      session,
      total: sessionTasks.length,
      done,
      percent: sessionTasks.length > 0 ? Math.round((done / sessionTasks.length) * 100) : null,
    };
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Adherence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Weekly</span>
            <span className="font-medium">
              {adherence.percent !== null ? `${adherence.percent}%` : "—"}
            </span>
          </div>
          <Progress value={adherence.percent ?? 0} className="h-2" />
          <p className="text-[10px] text-muted-foreground mt-1">
            {adherence.done}/{adherence.total} tasks completed on time
          </p>
        </div>

        {/* Daily breakdown */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Daily</p>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const d = adherence.daily[key];
              const pct = d && d.total > 0 ? Math.round((d.done / d.total) * 100) : -1;

              return (
                <div key={key} className="text-center">
                  <p className="text-[10px] text-muted-foreground mb-1">
                    {format(day, "EEE").charAt(0)}
                  </p>
                  <div
                    className={cn(
                      "h-6 w-6 mx-auto rounded-sm flex items-center justify-center text-[9px] font-medium",
                      pct === -1 && "bg-muted text-muted-foreground",
                      pct >= 0 && pct < 50 && "bg-destructive/20 text-destructive",
                      pct >= 50 && pct < 80 && "bg-warning-light text-warning",
                      pct >= 80 && "bg-success-light text-success"
                    )}
                  >
                    {pct >= 0 ? `${pct}` : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session adherence */}
        {sessionStats.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              By Session
            </p>
            <div className="space-y-2">
              {sessionStats.map(({ session, total, done, percent }) => (
                <div key={session.session_config_id}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: session.color }}
                      />
                      {session.name}
                    </span>
                    <span className="text-muted-foreground">
                      {done}/{total}
                    </span>
                  </div>
                  <Progress value={percent ?? 0} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
