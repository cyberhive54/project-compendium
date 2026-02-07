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
} from "date-fns";
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
import { CalendarWeekView } from "@/components/calendar/CalendarWeekView";
import { CalendarDayView } from "@/components/calendar/CalendarDayView";
import { CalendarAgendaView } from "@/components/calendar/CalendarAgendaView";
import { DateTasksModal } from "@/components/calendar/DateTasksModal";
import { AdherencePanel } from "@/components/calendar/AdherencePanel";
import { SessionFilterBar } from "@/components/calendar/SessionFilterBar";

type ViewMode = "month" | "week" | "day" | "agenda";

export default function CalendarPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string | null>(null);

  const { markDone, postpone } = useTasks();

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
        // Show 30 days from current date
        return {
          rangeStart: format(currentDate, "yyyy-MM-dd"),
          rangeEnd: format(addDays(currentDate, 30), "yyyy-MM-dd"),
        };
      }
    }
  }, [view, currentDate]);

  const { data: tasks = [], isLoading: tasksLoading } = useCalendarTasks(rangeStart, rangeEnd);
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
    markDone.mutate(taskId);
  };

  const handlePostpone = (taskId: string, newDate: string) => {
    postpone.mutate({ taskId, newDate });
  };

  const handleStartTimer = (taskId: string) => {
    navigate("/timer", { state: { taskId } });
  };

  const handleAddTask = () => {
    navigate("/goals");
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Calendar</h1>
        </div>

        {/* View tabs */}
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

      {/* Navigation bar */}
      <div className="flex items-center justify-between">
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          {/* Calendar view */}
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
              <CalendarWeekView
                currentDate={currentDate}
                tasks={filteredTasks}
                summaries={summaries}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            )}
            {view === "day" && (
              <CalendarDayView
                currentDate={currentDate}
                tasks={filteredTasks}
                summary={summaries[format(currentDate, "yyyy-MM-dd")]}
                sessions={sessions}
                onMarkDone={handleMarkDone}
                onStartTimer={handleStartTimer}
              />
            )}
            {view === "agenda" && (
              <CalendarAgendaView
                tasks={filteredTasks}
                summaries={summaries}
                onMarkDone={handleMarkDone}
                onStartTimer={handleStartTimer}
                onSelectDate={handleSelectDate}
              />
            )}
          </div>

          {/* Sidebar: Adherence */}
          <div className="space-y-4">
            <AdherencePanel
              adherence={adherence}
              tasks={filteredTasks}
              sessions={sessions}
              currentDate={currentDate}
            />
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
        onStartTimer={handleStartTimer}
        onAddTask={handleAddTask}
      />
    </div>
  );
}
