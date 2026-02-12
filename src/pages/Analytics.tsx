import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/hooks/useProjects";
import { useGoals } from "@/hooks/useGoals";
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

// New analytics cards
import { ProjectProgressCard } from "@/components/analytics/ProjectProgressCard";
import { GoalProgressCard } from "@/components/analytics/GoalProgressCard";
import { SubjectProgressCard } from "@/components/analytics/SubjectProgressCard";
import { DailyStudyBreakdown } from "@/components/analytics/DailyStudyBreakdown";
import { WeeklyStudyTrends } from "@/components/analytics/WeeklyStudyTrends";
import { ConsistencyScoreCard } from "@/components/analytics/ConsistencyScoreCard";
import { TaskDisciplineCard } from "@/components/analytics/TaskDisciplineCard";
import { FocusQualityCard } from "@/components/analytics/FocusQualityCard";
import { PeakStudyHoursCard } from "@/components/analytics/PeakStudyHoursCard";
import { ExamPerformanceCard } from "@/components/analytics/ExamPerformanceCard";
import { LevelXpCard } from "@/components/analytics/LevelXpCard";
import { TaskCompletionRateCard } from "@/components/analytics/TaskCompletionRateCard";
import { EstimatedVsActualCard } from "@/components/analytics/EstimatedVsActualCard";
import { PomodoroStatsCard } from "@/components/analytics/PomodoroStatsCard";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<TimePeriod>("week");

  const { data: projects = [] } = useProjects();
  const { data: goals = [] } = useGoals();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const filteredGoals = useMemo(() => {
    if (!selectedProjectId) return goals;
    return goals.filter(g => g.project_id === selectedProjectId);
  }, [goals, selectedProjectId]);

  const filters = { projectId: selectedProjectId, goalId: selectedGoalId };

  const summary = useAnalyticsSummary(period, filters);
  const scoreTrend = useScoreTrend(period, filters);
  const subjectPerf = useSubjectPerformance(period, filters);
  const timeDist = useTimeDistribution(period, filters);
  const heatmap = useStudyHeatmap(filters);
  const streak = useStreakHistory();
  const sessionPerf = useSessionPerformance(period);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <div className="flex items-center gap-2">
            <Select
              value={selectedProjectId ?? "all"}
              onValueChange={(v) => {
                setSelectedProjectId(v === "all" ? null : v);
                setSelectedGoalId(null);
              }}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.project_id} value={p.project_id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedGoalId ?? "all"}
              onValueChange={(v) => setSelectedGoalId(v === "all" ? null : v)}
              disabled={!goals.length && !selectedProjectId}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="All Goals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Goals</SelectItem>
                {filteredGoals.map(g => (
                  <SelectItem key={g.goal_id} value={g.goal_id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
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

      {/* ── Summary Cards ── */}
      <AnalyticsSummaryCards data={summary.data} isLoading={summary.isLoading} />

      {/* ── Daily & Weekly Study ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Daily & Weekly</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DailyStudyBreakdown />
          <WeeklyStudyTrends />
        </div>
      </section>

      {/* ── Consistency & Discipline ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Consistency & Discipline</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ConsistencyScoreCard period={period} />
          <TaskDisciplineCard period={period} />
        </div>
      </section>

      {/* ── Focus Analytics ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Focus Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FocusQualityCard period={period} />
          <PeakStudyHoursCard period={period} />
        </div>
      </section>

      {/* ── Progress Tracking ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Progress Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProjectProgressCard />
          <GoalProgressCard />
          <SubjectProgressCard />
        </div>
      </section>

      {/* ── Performance ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Performance</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ScoreTrendChart data={scoreTrend.data} isLoading={scoreTrend.isLoading} />
          <ExamPerformanceCard period={period} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <SubjectPerformanceChart data={subjectPerf.data} isLoading={subjectPerf.isLoading} />
          <EstimatedVsActualCard period={period} />
        </div>
      </section>

      {/* ── Task Analytics ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Task Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TaskCompletionRateCard period={period} />
          <TimeDistributionChart data={timeDist.data} isLoading={timeDist.isLoading} />
          <PomodoroStatsCard period={period} />
        </div>
      </section>

      {/* ── Session Performance ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sessions</h2>
        <SessionPerformanceChart data={sessionPerf.data} isLoading={sessionPerf.isLoading} />
      </section>

      {/* ── Gamification & Streaks ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Gamification & Streaks</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LevelXpCard />
          <StreakChart data={streak.data} isLoading={streak.isLoading} />
        </div>
      </section>

      {/* ── Study Heatmap ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Activity</h2>
        <StudyHeatmap data={heatmap.data} isLoading={heatmap.isLoading} />
      </section>
    </div>
  );
}
