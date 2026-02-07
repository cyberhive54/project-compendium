import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import type { StudySessionConfig } from "@/types/database";

interface SessionFilterBarProps {
  sessions: StudySessionConfig[];
  selectedSessionId: string | null;
  onSelectSession: (id: string | null) => void;
}

export function SessionFilterBar({
  sessions,
  selectedSessionId,
  onSelectSession,
}: SessionFilterBarProps) {
  if (sessions.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <Button
        variant={selectedSessionId === null ? "default" : "outline"}
        size="sm"
        className="h-7 text-xs shrink-0"
        onClick={() => onSelectSession(null)}
      >
        All Sessions
      </Button>
      {sessions.map((session) => (
        <Button
          key={session.session_config_id}
          variant={selectedSessionId === session.session_config_id ? "default" : "outline"}
          size="sm"
          className="h-7 text-xs shrink-0 gap-1.5"
          onClick={() =>
            onSelectSession(
              selectedSessionId === session.session_config_id
                ? null
                : session.session_config_id
            )
          }
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: session.color }}
          />
          {session.name}
          {selectedSessionId === session.session_config_id && (
            <X className="h-3 w-3" />
          )}
        </Button>
      ))}
    </div>
  );
}
