import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAnalyticsSummary,
  useScoreTrend,
  useSubjectPerformance,
  useTimeDistribution,
  useStudyHeatmap,
  useStreakHistory,
  useSessionPerformance,
  type TimePeriod,
} from "@/hooks/useAnalyticsData";
import { AnalyticsSummaryCards } from "@/components/analytics/AnalyticsSummaryCards";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { SubjectPerformanceChart } from "@/components/analytics/SubjectPerformanceChart";
import { TimeDistributionChart } from "@/components/analytics/TimeDistributionChart";
import { StudyHeatmap } from "@/components/analytics/StudyHeatmap";
import { StreakChart } from "@/components/analytics/StreakChart";
import { SessionPerformanceChart } from "@/components/analytics/SessionPerformanceChart";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<TimePeriod>("week");

  const summary = useAnalyticsSummary(period);
  const scoreTrend = useScoreTrend(period);
  const subjectPerf = useSubjectPerformance(period);
  const timeDist = useTimeDistribution(period);
  const heatmap = useStudyHeatmap();
  const streak = useStreakHistory();
  const sessionPerf = useSessionPerformance(period);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as TimePeriod)}
        >
          <TabsList className="h-8">
            <TabsTrigger value="week" className="text-xs px-3">Week</TabsTrigger>
            <TabsTrigger value="month" className="text-xs px-3">Month</TabsTrigger>
            <TabsTrigger value="all" className="text-xs px-3">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary cards */}
      <AnalyticsSummaryCards data={summary.data} isLoading={summary.isLoading} />

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ScoreTrendChart data={scoreTrend.data} isLoading={scoreTrend.isLoading} />
        <SubjectPerformanceChart data={subjectPerf.data} isLoading={subjectPerf.isLoading} />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TimeDistributionChart data={timeDist.data} isLoading={timeDist.isLoading} />
        <SessionPerformanceChart data={sessionPerf.data} isLoading={sessionPerf.isLoading} />
      </div>

      {/* Heatmap */}
      <StudyHeatmap data={heatmap.data} isLoading={heatmap.isLoading} />

      {/* Streak */}
      <StreakChart data={streak.data} isLoading={streak.isLoading} />
    </div>
  );
}
