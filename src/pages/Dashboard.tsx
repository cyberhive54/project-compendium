import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { QuickStatsCards } from "@/components/dashboard/QuickStatsCards";
import { TodaysTasks } from "@/components/dashboard/TodaysTasks";
import { ActiveGoals } from "@/components/dashboard/ActiveGoals";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ActiveSessionIndicator } from "@/components/dashboard/ActiveSessionIndicator";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6">
      {/* Active Study Session Indicator */}
      <ActiveSessionIndicator />

      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Quick Stats */}
      <QuickStatsCards stats={stats} isLoading={isLoading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <TodaysTasks />
          <UpcomingTasks />
        </div>

        {/* Right column: Goals & Activity */}
        <div className="space-y-6">
          <ActiveGoals />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
