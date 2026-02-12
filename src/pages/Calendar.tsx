import { useState, useMemo, useCallback } from "react";
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
  startOfDay,
} from "date-fns";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  LayoutGrid,
  List,
  Columns,
  CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks } from "@/hooks/useTasks";
import {
  useCalendarTasks,
  useCalendarTimerSessions,
  useStudySessions,
  useCalendarHolidays,
  buildDaySummaries,
  calculateAdherence,
} from "@/hooks/useCalendarData";
import { CalendarMonthView } from "@/components/calendar/CalendarMonthView";
import { CalendarWeekViewV2 } from "@/components/calendar/CalendarWeekViewV2";
import { CalendarDayGrid } from "@/components/calendar/CalendarDayGrid";
import { CalendarAgendaView } from "@/components/calendar/CalendarAgendaView";
import { DateTasksModal } from "@/components/calendar/DateTasksModal";
import { AdherencePanel } from "@/components/calendar/AdherencePanel";
import { SessionFilterBar } from "@/components/calendar/SessionFilterBar";
import { TaskCompletionDialog, type TaskCompletionData } from "@/components/tasks/TaskCompletionDialog";
import { TimerModeSelectDialog } from "@/components/calendar/TimerModeSelectDialog";
import { FocusDistributionCard } from "@/components/calendar/FocusDistributionCard";
import type { Task } from "@/types/database";

type ViewMode = "month" | "week" | "day" | "agenda";

import { useProjects } from "@/hooks/useProjects";
import { useGoals } from "@/hooks/useGoals";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CalendarPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string | null>(null);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [timerSelectionTaskId, setTimerSelectionTaskId] = useState<string | null>(null);

  // Agenda Filters
  const [agendaSettings, setAgendaSettings] = useState<{
    rangeType: string;
    customRange?: DateRange;
    singleDate?: Date;
  }>({ rangeType: "next-30" });

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const { data: projects = [] } = useProjects();
  const { data: goals = [] } = useGoals();
  const { markDone, postpone } = useTasks();

  const filteredGoals = useMemo(() => {
    if (!selectedProjectId) return goals;
    return goals.filter(g => g.project_id === selectedProjectId);
  }, [goals, selectedProjectId]);

  // Compute date range based on view
  const { rangeStart, rangeEnd } = useMemo(() => {
    switch (view) {
      case "month": {
        const ms = startOfMonth(currentDate);
        const me = endOfMonth(currentDate);
        return {
          rangeStart: format(startOfWeek(ms, { weekStartsOn: 1 }), "yyyy-MM-dd"),
          rangeEnd: format(endOfWeek(me, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        };
      }
      case "week": {
        const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
        const we = endOfWeek(currentDate, { weekStartsOn: 1 });
        return {
          rangeStart: format(ws, "yyyy-MM-dd"),
          rangeEnd: format(we, "yyyy-MM-dd"),
        };
      }
      case "day":
        return {
          rangeStart: format(currentDate, "yyyy-MM-dd"),
          rangeEnd: format(currentDate, "yyyy-MM-dd"),
        };
      case "agenda": {
        const today = startOfDay(new Date());

        switch (agendaSettings.rangeType) {
          case "today":
            return { rangeStart: format(today, "yyyy-MM-dd"), rangeEnd: format(today, "yyyy-MM-dd") };
          case "tomorrow":
            const tom = addDays(today, 1);
            return { rangeStart: format(tom, "yyyy-MM-dd"), rangeEnd: format(tom, "yyyy-MM-dd") };
          case "yesterday":
            const yest = subDays(today, 1);
            return { rangeStart: format(yest, "yyyy-MM-dd"), rangeEnd: format(yest, "yyyy-MM-dd") };
          case "pick-date":
            const d = agendaSettings.singleDate || today;
            return { rangeStart: format(d, "yyyy-MM-dd"), rangeEnd: format(d, "yyyy-MM-dd") };

          case "this-week":
            return {
              rangeStart: format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"),
              rangeEnd: format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd")
            };
          case "next-week":
            const nextW = addWeeks(today, 1);
            return {
              rangeStart: format(startOfWeek(nextW, { weekStartsOn: 1 }), "yyyy-MM-dd"),
              rangeEnd: format(endOfWeek(nextW, { weekStartsOn: 1 }), "yyyy-MM-dd")
            };
          case "prev-week":
            const prevW = subWeeks(today, 1);
            return {
              rangeStart: format(startOfWeek(prevW, { weekStartsOn: 1 }), "yyyy-MM-dd"),
              rangeEnd: format(endOfWeek(prevW, { weekStartsOn: 1 }), "yyyy-MM-dd")
            };
          case "next-7":
            return {
              rangeStart: format(today, "yyyy-MM-dd"),
              rangeEnd: format(addDays(today, 7), "yyyy-MM-dd")
            };

          case "this-month":
            return {
              rangeStart: format(startOfMonth(today), "yyyy-MM-dd"),
              rangeEnd: format(endOfMonth(today), "yyyy-MM-dd")
            };
          case "prev-month":
            const prevM = subMonths(today, 1);
            return {
              rangeStart: format(startOfMonth(prevM), "yyyy-MM-dd"),
              rangeEnd: format(endOfMonth(prevM), "yyyy-MM-dd")
            };
          case "next-month":
            const nextM = addMonths(today, 1);
            return {
              rangeStart: format(startOfMonth(nextM), "yyyy-MM-dd"),
              rangeEnd: format(endOfMonth(nextM), "yyyy-MM-dd")
            };
          case "custom":
            if (agendaSettings.customRange?.from) {
              return {
                rangeStart: format(agendaSettings.customRange.from, "yyyy-MM-dd"),
                rangeEnd: format(agendaSettings.customRange.to || agendaSettings.customRange.from, "yyyy-MM-dd")
              };
            }
            // Fallback
            return {
              rangeStart: format(today, "yyyy-MM-dd"),
              rangeEnd: format(addDays(today, 30), "yyyy-MM-dd"),
            };

          case "next-30":
          default:
            return {
              rangeStart: format(today, "yyyy-MM-dd"),
              rangeEnd: format(addDays(today, 30), "yyyy-MM-dd"),
            };
        }
      }
    }
  }, [view, currentDate, agendaSettings]);

  const { data: tasks = [], isLoading: tasksLoading } = useCalendarTasks(
    rangeStart,
    rangeEnd,
    { projectId: selectedProjectId, goalId: selectedGoalId }
  );
  const { data: timerSessions = [], isLoading: timersLoading } = useCalendarTimerSessions(rangeStart, rangeEnd);
  const { data: sessions = [] } = useStudySessions();
  const { data: holidays = [] } = useCalendarHolidays(rangeStart, rangeEnd);

  // Filter by session if selected
  const filteredTasks = useMemo(() => {
    if (!selectedSessionFilter) return tasks;
    return tasks.filter((t) => t.preferred_session_id === selectedSessionFilter);
  }, [tasks, selectedSessionFilter]);

  const summaries = useMemo(
    () => buildDaySummaries(filteredTasks, timerSessions, holidays, rangeStart, rangeEnd),
    [filteredTasks, timerSessions, holidays, rangeStart, rangeEnd]
  );

  const adherence = useMemo(
    () => calculateAdherence(filteredTasks, rangeStart, rangeEnd),
    [filteredTasks, rangeStart, rangeEnd]
  );

  // Navigation
  const goToday = () => setCurrentDate(new Date());
  const goPrev = () => {
    switch (view) {
      case "month": setCurrentDate((d) => subMonths(d, 1)); break;
      case "week": setCurrentDate((d) => subWeeks(d, 1)); break;
      case "day": setCurrentDate((d) => subDays(d, 1)); break;
      case "agenda": setCurrentDate((d) => subDays(d, 30)); break;
    }
  };
  const goNext = () => {
    switch (view) {
      case "month": setCurrentDate((d) => addMonths(d, 1)); break;
      case "week": setCurrentDate((d) => addWeeks(d, 1)); break;
      case "day": setCurrentDate((d) => addDays(d, 1)); break;
      case "agenda": setCurrentDate((d) => addDays(d, 30)); break;
    }
  };

  const handleSelectDate = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      setModalOpen(true);
    },
    []
  );

  const handleMarkDone = (taskId: string) => {
    const task = tasks.find((t) => t.task_id === taskId);
    if (task) {
      setSelectedTask(task as unknown as Task);
      setCompletionOpen(true);
    }
  };

  const handleComplete = async (data: TaskCompletionData) => {
    if (selectedTask) {
      await markDone.mutateAsync({ taskId: selectedTask.task_id, ...data });
      setCompletionOpen(false);
      setSelectedTask(null);
    }
  };

  const handlePostpone = (taskId: string, newDate: string) => {
    postpone.mutate({ taskId, newDate });
  };

  const handleStartTimerRequest = (taskId: string) => {
    setTimerSelectionTaskId(taskId);
  };

  const handleAddTask = () => {
    navigate("/goals");
  };

  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleSlotClick = (date: Date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const isLoading = tasksLoading || timersLoading;

  const headerTitle = useMemo(() => {
    switch (view) {
      case "month": return format(currentDate, "MMMM yyyy");
      case "week": {
        const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
        const we = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(ws, "MMM d")} – ${format(we, "MMM d, yyyy")}`;
      }
      case "day": return format(currentDate, "EEEE, MMMM d, yyyy");
      case "agenda": return `Next 30 Days`;
    }
  }, [view, currentDate]);

  return (
    <div className="space-y-3">
      {/* Header: Title + Filters + View Tabs — single row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold">Calendar</h1>
          <Select
            value={selectedProjectId ?? "all"}
            onValueChange={(v) => {
              setSelectedProjectId(v === "all" ? null : v);
              setSelectedGoalId(null);
            }}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs">
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
            <SelectTrigger className="w-[130px] h-8 text-xs">
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

        <Tabs
          value={view}
          onValueChange={(v) => setView(v as ViewMode)}
          className="w-auto"
        >
          <TabsList className="h-8">
            <TabsTrigger value="month" className="text-xs gap-1 px-2">
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Month</span>
            </TabsTrigger>
            <TabsTrigger value="week" className="text-xs gap-1 px-2">
              <Columns className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Week</span>
            </TabsTrigger>
            <TabsTrigger value="day" className="text-xs gap-1 px-2">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Day</span>
            </TabsTrigger>
            <TabsTrigger value="agenda" className="text-xs gap-1 px-2">
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Agenda</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Navigation bar + Agenda settings */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={goNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-sm font-medium ml-2">{headerTitle}</h2>
        </div>

        {/* Agenda Range Controls */}
        {view === "agenda" && (
          <div className="flex items-center gap-2">
            <Select
              value={agendaSettings.rangeType}
              onValueChange={(val) => setAgendaSettings((prev) => ({ ...prev, rangeType: val }))}
            >
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="pick-date">Pick Date</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="next-week">Next Week</SelectItem>
                <SelectItem value="prev-week">Last Week</SelectItem>
                <SelectItem value="next-7">Next 7 Days</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="next-month">Next Month</SelectItem>
                <SelectItem value="prev-month">Last Month</SelectItem>
                <SelectItem value="next-30">Next 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {agendaSettings.rangeType === "pick-date" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-2">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {agendaSettings.singleDate ? format(agendaSettings.singleDate, "MMM d") : "Pick"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={agendaSettings.singleDate}
                    onSelect={(date) => setAgendaSettings((prev) => ({ ...prev, singleDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}

            {agendaSettings.rangeType === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-2">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {agendaSettings.customRange?.from ? (
                      <>
                        {format(agendaSettings.customRange.from, "MMM d")}
                        {agendaSettings.customRange.to && ` - ${format(agendaSettings.customRange.to, "MMM d")}`}
                      </>
                    ) : "Pick Range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={agendaSettings.customRange}
                    onSelect={(range) => setAgendaSettings((prev) => ({ ...prev, customRange: range }))}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}
      </div>

      {/* Session filter */}
      <SessionFilterBar
        sessions={sessions}
        selectedSessionId={selectedSessionFilter}
        onSelectSession={setSelectedSessionFilter}
      />

      {/* Main content */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Calendar view - Full Width */}
          <div>
            {view === "month" && (
              <CalendarMonthView
                currentDate={currentDate}
                summaries={summaries}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            )}
            {view === "week" && (
              <CalendarWeekViewV2
                currentDate={currentDate}
                tasks={filteredTasks}
                summaries={summaries}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                onTaskClick={handleTaskClick}
              />
            )}
            {view === "day" && (
              <CalendarDayGrid
                currentDate={currentDate}
                tasks={filteredTasks}
                summary={summaries[format(currentDate, "yyyy-MM-dd")]}
                sessions={sessions}
                onMarkDone={handleMarkDone}
                onStartTimer={handleStartTimerRequest}
                onTaskClick={handleTaskClick}
                onSlotClick={handleSlotClick}
              />
            )}
            {view === "agenda" && (
              <CalendarAgendaView
                tasks={filteredTasks}
                summaries={summaries}
                onMarkDone={handleMarkDone}
                onStartTimer={handleStartTimerRequest}
                onSelectDate={handleSelectDate}
                onTaskClick={handleTaskClick}
                onPostpone={handlePostpone}
              />
            )}
          </div>

          {/* Bottom Section: Adherence & Focus */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <AdherencePanel
                adherence={adherence}
                tasks={filteredTasks}
                sessions={sessions}
                currentDate={currentDate}
              />
            </div>
            <div className="lg:col-span-1 h-full">
              <FocusDistributionCard tasks={filteredTasks} timerSessions={timerSessions} />
            </div>
          </div>
        </div>
      )}

      {/* Date tasks modal */}
      <DateTasksModal
        date={selectedDate}
        tasks={filteredTasks}
        summary={selectedDate ? summaries[format(selectedDate, "yyyy-MM-dd")] : undefined}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onMarkDone={handleMarkDone}
        onPostpone={handlePostpone}
        onStartTimer={handleStartTimerRequest}
        onAddTask={handleAddTask}
        hideAddButton={true}
      />

      {/* Timer Selection Dialog */}
      <TimerModeSelectDialog
        open={!!timerSelectionTaskId}
        onOpenChange={(open) => !open && setTimerSelectionTaskId(null)}
        onSelect={(mode) => {
          if (timerSelectionTaskId) {
            navigate("/timer", { state: { taskId: timerSelectionTaskId, mode } });
            setTimerSelectionTaskId(null);
          }
        }}
      />

      {/* Completion Dialog */}
      {selectedTask && (
        <TaskCompletionDialog
          task={selectedTask}
          open={completionOpen}
          onOpenChange={setCompletionOpen}
          onComplete={handleComplete}
          isSubmitting={markDone.isPending}
        />
      )}
    </div>
  );
}
