import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export function WelcomeBanner() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {profile?.username ?? "Student"}! 👋
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Level {profile?.current_level ?? 1} ·{" "}
            <span className="text-warning font-medium">
              🔥 {profile?.current_streak ?? 0} day streak
            </span>{" "}
            · {profile?.total_xp ?? 0} XP
          </p>
        </div>
      </div>
    </div>
  );
}
