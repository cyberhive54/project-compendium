import { ActiveSessionIndicator } from "@/components/dashboard/ActiveSessionIndicator";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TodaysTasks } from "@/components/dashboard/TodaysTasks";
import { DashboardCalendarWidget } from "@/components/dashboard/DashboardCalendarWidget";
import { UpcomingPreview } from "@/components/dashboard/UpcomingPreview";
import { TodayFocusStats } from "@/components/dashboard/TodayFocusStats";
import { WeeklyMiniChart } from "@/components/dashboard/WeeklyMiniChart";
import { ActiveGoals } from "@/components/dashboard/ActiveGoals";
import { StreakLevelCard } from "@/components/dashboard/StreakLevelCard";
import { DashboardTemplates } from "@/components/dashboard/DashboardTemplates";
import { MonthlyTrendsChart } from "@/components/dashboard/MonthlyTrendsChart";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6 pb-8">
      {/* Active Study Session Indicator */}
      <ActiveSessionIndicator />

      {/* Compact Header: Greeting + Date + Inline Stats */}
      <DashboardHeader stats={stats} isLoading={isLoading} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Column (Primary Focus) ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Tasks with progress bar */}
          <TodaysTasks />

          {/* Templates scheduled for today */}
          <DashboardTemplates />

          {/* Today's Calendar Schedule */}
          <DashboardCalendarWidget />

          {/* Monthly Trends — fills remaining left column space */}
          <MonthlyTrendsChart />
        </div>

        {/* ── Right Column (Insights Sidebar) ── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Today's Focus Metrics */}
          <TodayFocusStats stats={stats} isLoading={isLoading} />

          {/* Weekly Mini Chart */}
          <WeeklyMiniChart />

          {/* Active Goals (top 3) */}
          <ActiveGoals />

          {/* Upcoming Tasks Preview */}
          <UpcomingPreview />

          {/* Streak & Level */}
          <StreakLevelCard />
        </div>
      </div>
    </div>
  );
}
