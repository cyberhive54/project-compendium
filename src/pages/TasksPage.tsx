import { useState, useMemo } from "react";
import { format, parseISO, isToday, isPast, isTomorrow, isYesterday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks } from "@/hooks/useTasks";
import { useGoals } from "@/hooks/useGoals";
import type { Task } from "@/types/database";
import { toast } from "sonner";
import {
  Search,
  ListFilter,
  CalendarDays,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ClipboardList,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { TaskCompletionDialog } from "@/components/tasks/TaskCompletionDialog";

const PAGE_SIZE = 20;

type SortField = "priority" | "scheduled_date" | "name" | "status" | "created_at";
type SortDir = "asc" | "desc";

const STATUS_COLORS: Record<string, string> = {
  done: "text-success",
  in_progress: "text-primary",
  pending: "text-warning",
  scheduled: "text-muted-foreground",
  postponed: "text-destructive",
};

export default function TasksPage() {
  const navigate = useNavigate();
  const { data: allTasks, isLoading, create: createTask, markDone } = useTasks();
  const { data: goals = [] } = useGoals();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [dateFilter, setDateFilter] = useState("__all__");
  const [goalFilter, setGoalFilter] = useState("__all__");
  const [sortField, setSortField] = useState<SortField>("scheduled_date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tasks = allTasks ?? [];

  const filtered = useMemo(() => {
    let list = [...tasks];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.task_type.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "__all__") {
      list = list.filter((t) => t.status === statusFilter);
    }

    if (dateFilter !== "__all__") {
      const now = new Date();
      list = list.filter((t) => {
        if (!t.scheduled_date) return false;
        const d = parseISO(t.scheduled_date);
        switch (dateFilter) {
          case "today": return isToday(d);
          case "tomorrow": return isTomorrow(d);
          case "yesterday": return isYesterday(d);
          case "this_week": return isWithinInterval(d, { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) });
          case "this_month": return isWithinInterval(d, { start: startOfMonth(now), end: endOfMonth(now) });
          default: return true;
        }
      });
    }

    if (goalFilter !== "__all__") {
      list = list.filter((t) => t.goal_id === goalFilter);
    }

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "priority":
          cmp = (a.priority_number ?? 0) - (b.priority_number ?? 0);
          break;
        case "scheduled_date":
          cmp = (a.scheduled_date ?? "").localeCompare(b.scheduled_date ?? "");
          break;
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "created_at":
          cmp = a.created_at.localeCompare(b.created_at);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [tasks, search, statusFilter, dateFilter, goalFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const getStatusLabel = (t: Task) => {
    if (t.status === "done") return "Completed";
    if (t.status === "in_progress") return "In Progress";
    if (t.status === "postponed") return "Postponed";
    if (
      t.status === "scheduled" &&
      t.scheduled_date &&
      isPast(parseISO(t.scheduled_date)) &&
      !isToday(parseISO(t.scheduled_date))
    )
      return "Overdue";
    if (t.status === "pending") return "Pending";
    return "Scheduled";
  };

  const getStatusColor = (t: Task) => {
    const label = getStatusLabel(t);
    if (label === "Overdue") return "text-destructive";
    return STATUS_COLORS[t.status] ?? "text-muted-foreground";
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} task{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Task
        </Button>
      </div>



      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <ListFilter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="postponed">Postponed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={dateFilter}
          onValueChange={(v) => {
            setDateFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Dates</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={goalFilter}
          onValueChange={(v) => {
            setGoalFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Goals</SelectItem>
            {goals.map((g) => (
              <SelectItem key={g.goal_id} value={g.goal_id}>
                {g.icon} {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort bar */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            ["priority", "Priority"],
            ["scheduled_date", "Date"],
            ["name", "Name"],
            ["status", "Status"],
          ] as [SortField, string][]
        ).map(([field, label]) => (
          <Button
            key={field}
            variant="outline"
            size="sm"
            onClick={() => toggleSort(field)}
            className={sortField === field ? "border-primary" : ""}
          >
            <ArrowUpDown className="h-3 w-3 mr-1" />
            {label}
            {sortField === field && (sortDir === "asc" ? " ↑" : " ↓")}
          </Button>
        ))}
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : paged.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No tasks found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paged.map((t) => (
            <Card
              key={t.task_id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate(`/tasks/${t.task_id}`)}
            >
              <CardContent className="flex items-start gap-3 py-4 px-5">
                <div
                  className={`mt-1 h-3 w-3 rounded-full shrink-0 border-2 ${t.status === "done"
                    ? "bg-[hsl(var(--success))] border-[hsl(var(--success))]"
                    : t.status === "in_progress"
                      ? "border-primary bg-primary/20"
                      : t.status === "postponed"
                        ? "border-destructive bg-destructive/20"
                        : "border-muted-foreground"
                    }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{t.name}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs font-medium ${getStatusColor(t)}`}>
                      {getStatusLabel(t)}
                    </span>
                    {t.scheduled_date && (
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(t.scheduled_date), "MMM d")}
                      </span>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {t.task_type}
                    </Badge>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 flex flex-col items-end gap-2">
                  <span>P{t.priority_number}</span>
                  {t.status !== 'done' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-success"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(t);
                        setCompletionOpen(true);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {goals.length > 0 && (
        <TaskFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          presetGoalId={goals[0]?.goal_id}
          onSubmit={async (values) => {
            try {
              await createTask.mutateAsync(values);
              toast.success("Task created");
              setCreateOpen(false);
            } catch (err: any) {
              toast.error(err.message || "Failed to create task");
            }
          }}
        />
      )}

      {selectedTask && (
        <TaskCompletionDialog
          task={selectedTask}
          open={completionOpen}
          onOpenChange={setCompletionOpen}
          onComplete={async (data) => {
            if (selectedTask) {
              // markDone is not destructured from useTasks yet, need to add it
              await markDone.mutateAsync({ taskId: selectedTask.task_id, ...data });
              setCompletionOpen(false);
              setSelectedTask(null);
            }
          }}
          isSubmitting={markDone.isPending}
        />
      )}

    </div>
  );
}
