import { useTimerSessions } from "@/hooks/useTimerSessions";
import { formatTime } from "./TimerDisplay";
import { Clock, Zap } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimerSessionHistoryProps {
  taskId: string;
}

export function TimerSessionHistory({ taskId }: TimerSessionHistoryProps) {
  const { sessions } = useTimerSessions(taskId);
  const data = sessions.data ?? [];

  if (data.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        No study sessions recorded yet
      </div>
    );
  }

  const totalFocusSeconds = data
    .filter((s) => s.session_type === "focus" && s.duration_seconds)
    .reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Session History</h4>
        <span className="text-xs text-muted-foreground">
          Total: {formatTime(totalFocusSeconds)}
        </span>
      </div>
      <ScrollArea className="max-h-[200px]">
        <div className="space-y-1.5">
          {data.map((session) => (
            <div
              key={session.session_id}
              className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                {session.is_pomodoro ? (
                  <Zap className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className="capitalize text-xs text-muted-foreground">
                  {session.session_type}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs">
                  {session.duration_seconds != null
                    ? formatTime(session.duration_seconds)
                    : "--:--:--"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(session.start_time), "MMM d, HH:mm")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
