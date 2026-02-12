import { format } from "date-fns";
import { Flame, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import type { DashboardStats } from "@/hooks/useDashboardStats";

interface Props {
    stats: DashboardStats | undefined;
    isLoading: boolean;
}

export function DashboardHeader({ stats, isLoading }: Props) {
    const { profile, loading: authLoading } = useAuth();
    const now = new Date();
    const hour = now.getHours();

    const greeting =
        hour < 5 ? "Good night" :
            hour < 12 ? "Good morning" :
                hour < 17 ? "Good afternoon" :
                    "Good evening";

    const dateLabel = format(now, "EEE, MMM d");

    if (authLoading) {
        return (
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-32" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-xl font-bold tracking-tight">
                    {greeting}, {profile?.username ?? "there"}
                </h1>
                <p className="text-sm text-muted-foreground">{dateLabel}</p>
            </div>

            {/* Inline quick stats */}
            <div className="flex items-center gap-4 mt-2 sm:mt-0">
                {isLoading ? (
                    <>
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full bg-orange-500/10">
                            <Flame className="h-3.5 w-3.5 text-orange-500" />
                            <span className="font-semibold text-orange-500">{stats?.currentStreak ?? 0}d</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full bg-primary/10">
                            <BookOpen className="h-3.5 w-3.5 text-primary" />
                            <span className="font-semibold text-primary">{formatTime(stats?.timeStudiedToday ?? 0)}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function formatTime(minutes: number): string {
    if (minutes === 0) return "0m";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
