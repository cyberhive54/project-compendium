import { Moon, Sun, Clock } from "lucide-react";
import { useActiveStudySession } from "@/hooks/useDashboardStats";

export function ActiveSessionIndicator() {
  const { data: session } = useActiveStudySession();

  if (!session) return null;

  // Determine icon based on session name/time
  const startHour = parseInt(session.start_time?.split(":")[0] ?? "12", 10);
  const isNight = startHour >= 18 || startHour < 5;
  const Icon = isNight ? Moon : startHour < 12 ? Sun : Clock;
  const emoji = isNight ? "🌙" : startHour < 12 ? "☀️" : "📚";

  return (
    <div
      className="flex items-center gap-2 rounded-lg border px-4 py-3"
      style={{ borderColor: session.color ?? undefined }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: `${session.color}20` }}
      >
        <Icon className="h-4 w-4" style={{ color: session.color ?? undefined }} />
      </div>
      <div>
        <p className="text-sm font-medium">
          {emoji} {session.name} Active
        </p>
        <p className="text-xs text-muted-foreground">
          {session.start_time?.slice(0, 5)} – {session.end_time?.slice(0, 5)}
        </p>
      </div>
    </div>
  );
}
