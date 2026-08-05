import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { MonitorSmartphone, RefreshCw, LogOut, Loader2 } from "lucide-react";

interface SessionInfo {
  session_id: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  user_agent: string | null;
  ip: string | null;
}

export function LoginSessionsSettings() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("get_my_sessions");
    if (error) {
      console.error("Failed to load sessions:", error);
      toast.error("Failed to load sessions. Ensure the SQL migration 11_session_security.sql is applied.");
      setSessions([]);
    } else {
      setSessions((data as SessionInfo[]) ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevoke = async (sessionId: string) => {
    setRevokingId(sessionId);
    const { data, error } = await supabase.rpc("revoke_session", {
      p_session_id: sessionId,
    });
    setRevokingId(null);

    if (error) {
      toast.error("Failed to revoke session.");
      return;
    }

    if (data) {
      toast.success("Session revoked.");
      fetchSessions();
    } else {
      toast.error("Session not found or already expired.");
    }
  };

  const parseDevice = (userAgent: string | null): { name: string; detail: string } => {
    if (!userAgent) return { name: "Unknown device", detail: "" };

    let name = "Device";
    if (/Mobile|Android|iPhone/i.test(userAgent)) name = "Mobile device";
    else if (/iPad|Tablet/i.test(userAgent)) name = "Tablet";
    else if (/Windows/i.test(userAgent)) name = "Windows computer";
    else if (/Macintosh/i.test(userAgent)) name = "Mac computer";
    else if (/Linux/i.test(userAgent)) name = "Linux computer";

    const browser =
      (userAgent.match(/Chrome\/(\S+)/)?.[1] && "Chrome") ||
      (userAgent.match(/Firefox\/(\S+)/)?.[1] && "Firefox") ||
      (userAgent.match(/Safari\//) && !userAgent.includes("Chrome") && "Safari") ||
      (userAgent.match(/Edg\/(\S+)/)?.[1] && "Edge") ||
      "Browser";

    return { name, detail: browser };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <MonitorSmartphone className="h-5 w-5 text-primary" />
            Login Sessions
          </CardTitle>
          <CardDescription>
            Devices currently signed in to your account. Maximum 3 concurrent sessions.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSessions} disabled={loading} className="gap-2">
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No active sessions found.
          </p>
        ) : (
          sessions.map((session) => {
            const device = parseDevice(session.user_agent);
            return (
              <div
                key={session.session_id}
                className="flex items-start justify-between gap-4 border rounded-lg p-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="rounded-full bg-primary/10 p-2 shrink-0">
                    <MonitorSmartphone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{device.name}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {device.detail}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Signed in {format(new Date(session.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {session.expires_at && (
                      <p className="text-xs text-muted-foreground">
                        Expires {format(new Date(session.expires_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                    {session.ip && (
                      <p className="text-xs text-muted-foreground font-mono">
                        IP: {session.ip}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => handleRevoke(session.session_id)}
                  disabled={revokingId === session.session_id}
                >
                  {revokingId === session.session_id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span className="ml-1">Revoke</span>
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
