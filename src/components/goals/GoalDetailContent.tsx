import { useState, useMemo } from "react";
import {
  Plus,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  List,
  CalendarDays,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStreams } from "@/hooks/useStreams";
import { useSubjects } from "@/hooks/useSubjects";
import { useChapters } from "@/hooks/useChapters";
import { useTopics } from "@/hooks/useTopics";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { HierarchyItemForm } from "@/components/goals/HierarchyItemForm";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { toast } from "sonner";
import type { Task } from "@/types/database";

interface GoalDetailContentProps {
  goalId: string;
}

type DialogState =
  | { type: "stream" }
  | { type: "subject"; streamId?: string | null }
  | { type: "chapter"; subjectId: string }
  | { type: "topic"; chapterId: string }
  | { type: "task" }
  | null;

function getTaskStatusInfo(task: { status: string; scheduled_date: string | null }) {
  if (task.status === "done") return { label: "Completed", color: "hsl(var(--success))" };
  if (task.status === "in_progress") return { label: "In Progress", color: "hsl(var(--primary))" };
  if (
    task.scheduled_date &&
    isPast(new Date(task.scheduled_date)) &&
    !isToday(new Date(task.scheduled_date)) &&
    task.status !== "done"
  ) {
    return { label: "Overdue", color: "hsl(var(--destructive))" };
  }
  return { label: "Pending", color: "hsl(var(--warning))" };
}

export function GoalDetailContent({ goalId }: GoalDetailContentProps) {
  const { user } = useAuth();

  // State
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [taskViewMode, setTaskViewMode] = useState<"grid" | "list">("grid");
  const [dialogState, setDialogState] = useState<DialogState>(null);

  // Data hooks
  const { data: streams = [] } = useStreams(goalId);
  const streamsHook = useStreams(goalId);

  const activeStreamId = selectedStreamId;
  const { data: subjects = [] } = useSubjects(
    goalId,
    streams.length > 0 ? activeStreamId : undefined
  );
  const subjectsHook = useSubjects(goalId, streams.length > 0 ? activeStreamId : undefined);

  const { data: chapters = [] } = useChapters(selectedSubjectId ?? undefined);
  const chaptersHook = useChapters(selectedSubjectId ?? undefined);

  const { data: topics = [] } = useTopics(selectedChapterId ?? undefined);
  const topicsHook = useTopics(selectedChapterId ?? undefined);

  const tasksHook = useTasks({ goalId });
  const tasks = tasksHook.data ?? [];

  // Handlers
  const handleStreamSelect = (streamId: string) => {
    setSelectedStreamId(streamId === selectedStreamId ? null : streamId);
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubjectId(subjectId === selectedSubjectId ? null : subjectId);
    setSelectedChapterId(null);
  };

  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapterId(chapterId === selectedChapterId ? null : chapterId);
  };

  const handleAddItem = (
    level: "stream" | "subject" | "chapter" | "topic",
    values: Record<string, any>
  ) => {
    switch (level) {
      case "stream":
        streamsHook.create.mutate(
          { ...values, goal_id: goalId } as any,
          {
            onSuccess: () => toast.success("Stream added"),
            onError: (e: any) => toast.error(e.message),
          }
        );
        break;
      case "subject": {
        const dState = dialogState as { type: "subject"; streamId?: string | null };
        subjectsHook.create.mutate(
          { ...values, goal_id: goalId, stream_id: dState?.streamId ?? null } as any,
          {
            onSuccess: () => toast.success("Subject added"),
            onError: (e: any) => toast.error(e.message),
          }
        );
        break;
      }
      case "chapter": {
        const dState = dialogState as { type: "chapter"; subjectId: string };
        chaptersHook.create.mutate(
          { ...values, subject_id: dState?.subjectId } as any,
          {
            onSuccess: () => toast.success("Chapter added"),
            onError: (e: any) => toast.error(e.message),
          }
        );
        break;
      }
      case "topic": {
        const dState = dialogState as { type: "topic"; chapterId: string };
        topicsHook.create.mutate(
          { ...values, chapter_id: dState?.chapterId } as any,
          {
            onSuccess: () => toast.success("Topic added"),
            onError: (e: any) => toast.error(e.message),
          }
        );
        break;
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Stream Tabs */}
      {streams.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Streams
            </h3>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-primary gap-1"
              onClick={() => setDialogState({ type: "stream" })}
            >
              <Plus className="h-3.5 w-3.5" /> Add stream
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {streams.map((stream) => (
              <button
                key={stream.stream_id}
                onClick={() => handleStreamSelect(stream.stream_id)}
                className={cn(
                  "shrink-0 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  selectedStreamId === stream.stream_id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:bg-accent"
                )}
              >
                {stream.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No streams — show add stream button */}
      {streams.length === 0 && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-primary gap-1"
            onClick={() => setDialogState({ type: "stream" })}
          >
            <Plus className="h-3.5 w-3.5" /> Add stream
          </Button>
        </div>
      )}

      {/* Subjects Section */}
      <HierarchySection
        title="Subjects"
        items={subjects.map((s) => ({
          id: s.subject_id,
          name: s.name,
          icon: s.icon,
          color: s.color,
        }))}
        selectedId={selectedSubjectId}
        onSelect={handleSubjectSelect}
        onAdd={() =>
          setDialogState({
            type: "subject",
            streamId: selectedStreamId,
          })
        }
        addLabel="Add subject"
      />

      {/* Chapters Section */}
      {selectedSubjectId && (
        <HierarchySection
          title="Chapters"
          items={chapters.map((c) => ({
            id: c.chapter_id,
            name: c.chapter_number ? `Ch ${c.chapter_number}: ${c.name}` : c.name,
            completed: c.completed,
          }))}
          selectedId={selectedChapterId}
          onSelect={handleChapterSelect}
          onAdd={() =>
            setDialogState({ type: "chapter", subjectId: selectedSubjectId })
          }
          addLabel="Add chapter"
        />
      )}

      {/* Topics Section */}
      {selectedChapterId && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Topics
            </h3>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-primary gap-1"
              onClick={() =>
                setDialogState({ type: "topic", chapterId: selectedChapterId })
              }
            >
              <Plus className="h-3.5 w-3.5" /> Add topic
            </Button>
          </div>
          {topics.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No topics yet
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {topics.map((topic) => (
                <div
                  key={topic.topic_id}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm",
                    topic.completed
                      ? "bg-muted/50 text-muted-foreground line-through"
                      : "bg-card text-foreground"
                  )}
                >
                  <span className="mr-1.5 text-xs">
                    {topic.difficulty === "easy"
                      ? "🟢"
                      : topic.difficulty === "hard"
                      ? "🔴"
                      : "🟡"}
                  </span>
                  {topic.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tasks Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tasks
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md overflow-hidden">
              <button
                onClick={() => setTaskViewMode("grid")}
                className={cn(
                  "p-1.5 transition-colors",
                  taskViewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTaskViewMode("list")}
                className={cn(
                  "p-1.5 transition-colors",
                  taskViewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setDialogState({ type: "task" })}
            >
              <Plus className="h-3.5 w-3.5" /> Add task
            </Button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg bg-card">
            No tasks yet. Add your first task to get started!
          </div>
        ) : taskViewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tasks.map((task) => (
              <TaskCard key={task.task_id} task={task} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard key={task.task_id} task={task} compact />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {dialogState?.type === "stream" && (
        <HierarchyItemForm
          open
          onOpenChange={() => setDialogState(null)}
          level="stream"
          onSubmit={(vals) => handleAddItem("stream", vals)}
        />
      )}
      {dialogState?.type === "subject" && (
        <HierarchyItemForm
          open
          onOpenChange={() => setDialogState(null)}
          level="subject"
          onSubmit={(vals) => handleAddItem("subject", vals)}
        />
      )}
      {dialogState?.type === "chapter" && (
        <HierarchyItemForm
          open
          onOpenChange={() => setDialogState(null)}
          level="chapter"
          onSubmit={(vals) => handleAddItem("chapter", vals)}
        />
      )}
      {dialogState?.type === "topic" && (
        <HierarchyItemForm
          open
          onOpenChange={() => setDialogState(null)}
          level="topic"
          onSubmit={(vals) => handleAddItem("topic", vals)}
        />
      )}
      {dialogState?.type === "task" && (
        <TaskFormDialog
          open
          onOpenChange={() => setDialogState(null)}
          presetGoalId={goalId}
          onSubmit={(values) => {
            tasksHook.create.mutate(values as Partial<Task>, {
              onSuccess: () => toast.success("Task created!"),
              onError: (e: any) => toast.error(e.message),
            });
          }}
        />
      )}
    </div>
  );
}

/* ─── Hierarchy Section ───────────────────────────────────────────── */

interface HierarchySectionProps {
  title: string;
  items: {
    id: string;
    name: string;
    icon?: string;
    color?: string | null;
    completed?: boolean;
  }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  addLabel: string;
}

function HierarchySection({
  title,
  items,
  selectedId,
  onSelect,
  onAdd,
  addLabel,
}: HierarchySectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-primary gap-1"
          onClick={onAdd}
        >
          <Plus className="h-3.5 w-3.5" /> {addLabel}
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No {title.toLowerCase()} yet
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {items.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors text-left",
                  isSelected
                    ? "bg-accent border-primary/30 text-accent-foreground"
                    : "bg-card text-foreground hover:bg-accent/50",
                  item.completed && "line-through text-muted-foreground"
                )}
              >
                <span className="flex items-center gap-2 min-w-0 truncate">
                  {item.icon && <span>{item.icon}</span>}
                  <span className="truncate">{item.name}</span>
                </span>
                {isSelected ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Task Card ───────────────────────────────────────────────────── */

function TaskCard({
  task,
  compact = false,
}: {
  task: Task;
  compact?: boolean;
}) {
  const statusInfo = getTaskStatusInfo(task);

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
        <div
          className="h-3 w-3 rounded-full shrink-0"
          style={{ background: statusInfo.color }}
        />
        <span className="text-sm font-medium truncate flex-1">{task.name}</span>
        <span className="text-xs text-muted-foreground shrink-0">
          {statusInfo.label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <div
        className="h-4 w-4 rounded-full shrink-0 mt-0.5"
        style={{ background: statusInfo.color }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{task.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">{statusInfo.label}</span>
          {task.scheduled_date && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              {format(new Date(task.scheduled_date), "MMM d")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
