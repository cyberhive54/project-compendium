import { useState, useMemo } from "react";
import {
  Plus,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  List,
  MoreVertical,
  Pencil,
  Trash2,
  CalendarDays,
  Archive,
  Check,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [taskViewMode, setTaskViewMode] = useState<"grid" | "list">("grid");
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [showArchived, setShowArchived] = useState(false); // New Toggle State

  // State for editing task
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  // State for editing hierarchy items
  const [editingItem, setEditingItem] = useState<{
    type: "stream" | "subject" | "chapter" | "topic";
    id: string;
    data: any;
  } | null>(null);

  // Data hooks
  const { data: streams = [] } = useStreams(goalId, showArchived);
  const streamsHook = useStreams(goalId, showArchived);

  const activeStreamId = selectedStreamId;
  const { data: subjects = [] } = useSubjects(
    goalId,
    streams.length > 0 ? activeStreamId : undefined,
    showArchived
  );
  const subjectsHook = useSubjects(goalId, streams.length > 0 ? activeStreamId : undefined, showArchived);

  const { data: chapters = [] } = useChapters(selectedSubjectId ?? undefined, showArchived);
  const chaptersHook = useChapters(selectedSubjectId ?? undefined, showArchived);

  const { data: topics = [] } = useTopics(selectedChapterId ?? undefined, showArchived);
  const topicsHook = useTopics(selectedChapterId ?? undefined, showArchived);

  const tasksHook = useTasks({
    goalId,
    subjectId: selectedSubjectId ?? undefined,
    chapterId: selectedChapterId ?? undefined,
    topicId: selectedTopicId ?? undefined,
    archived: showArchived,
  });
  const tasks = tasksHook.data ?? [];

  // Handlers
  const handleStreamSelect = (streamId: string) => {
    setSelectedStreamId(streamId === selectedStreamId ? null : streamId);
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
    setSelectedTopicId(null);
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubjectId(subjectId === selectedSubjectId ? null : subjectId);
    setSelectedChapterId(null);
    setSelectedTopicId(null);
  };

  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapterId(chapterId === selectedChapterId ? null : chapterId);
    setSelectedTopicId(null);
  };

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId === selectedTopicId ? null : topicId);
  };

  const handleAddItem = (
    level: "stream" | "subject" | "chapter" | "topic",
    values: Record<string, any>
  ) => {
    // ... existing implementation ...
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

  const handleEditItem = (values: any) => {
    if (!editingItem) return;
    const { type, id } = editingItem;

    const callbacks = {
      onSuccess: () => {
        toast.success(`${type} updated`);
        setEditingItem(null);
      },
      onError: (e: any) => toast.error(`Failed to update ${type}`),
    };

    switch (type) {
      case "stream":
        streamsHook.update.mutate({ id, ...values } as any, callbacks);
        break;
      case "subject":
        subjectsHook.update.mutate({ id, ...values } as any, callbacks);
        break;
      case "chapter":
        chaptersHook.update.mutate({ id, ...values } as any, callbacks);
        break;
      case "topic":
        topicsHook.update.mutate({ id, ...values } as any, callbacks);
        break;
    }
  };

  const handleDeleteItem = (type: "stream" | "subject" | "chapter" | "topic", id: string) => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      switch (type) {
        case "stream": streamsHook.remove.mutate(id); break;
        case "subject": subjectsHook.remove.mutate(id); break;
        case "chapter": chaptersHook.remove.mutate(id); break;
        case "topic": topicsHook.remove.mutate(id); break;
      }
      toast.success(`${type} deleted`);
    }
  };

  const handleArchiveItem = (type: "stream" | "subject" | "chapter" | "topic", id: string) => {
    if (confirm(`Are you sure you want to archive this ${type}? It will be hidden from view.`)) {
      switch (type) {
        case "stream": streamsHook.archive.mutate(id); break;
        case "subject": subjectsHook.archive.mutate(id); break;
        case "chapter": chaptersHook.archive.mutate(id); break;
        case "topic": topicsHook.archive.mutate(id); break;
      }
      toast.success(`${type} archived`);
    }
  };

  const handleToggleTopicComplete = (id: string, currentStatus: boolean) => {
    topicsHook.toggleComplete.mutate({ id, completed: !currentStatus }, {
      onSuccess: () => toast.success(`Topic marked ${!currentStatus ? "complete" : "incomplete"}`),
      onError: (e: any) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showArchived"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="showArchived" className="text-sm text-muted-foreground cursor-pointer select-none">
            Show Archived
          </label>
        </div>
      </div>

      {/* Stream Tabs */}
      {streams.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Streams
            </h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 items-center">
            {streams.map((stream) => (
              <div key={stream.stream_id} className="relative group">
                <button
                  onClick={() => handleStreamSelect(stream.stream_id)}
                  className={cn(
                    "shrink-0 rounded-lg border px-4 py-2 text-sm font-medium transition-colors pr-8",
                    selectedStreamId === stream.stream_id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-accent",
                    stream.archived && "opacity-60"
                  )}
                >
                  {stream.name}
                </button>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingItem({ type: "stream", id: stream.stream_id, data: stream })}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchiveItem("stream", stream.stream_id)}>
                        <Archive className="mr-2 h-4 w-4" /> Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteItem("stream", stream.stream_id)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="h-9 px-3 border-dashed text-muted-foreground hover:text-primary hover:border-primary shrink-0"
              onClick={() => setDialogState({ type: "stream" })}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>
      )}

      {/* No streams — show add stream button */}
      {/* No streams — show add stream button */}
      {streams.length === 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            className="border-dashed text-muted-foreground hover:text-primary hover:border-primary"
            onClick={() => setDialogState({ type: "stream" })}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Stream
          </Button>
        </div>
      )}

      {/* Subjects Section */}
      {/* Subjects Section */}
      <HierarchySection
        title="Subjects"
        items={subjects.map((s) => ({
          id: s.subject_id,
          name: s.name,
          icon: s.icon,
          color: s.color,
        }))}
        level="subject"
        selectedId={selectedSubjectId}
        onSelect={handleSubjectSelect}
        onAdd={() =>
          setDialogState({
            type: "subject",
            streamId: selectedStreamId,
          })
        }
        addLabel="Add Subject"
        onEdit={(id) => {
          const subject = subjects.find(s => s.subject_id === id);
          if (subject) setEditingItem({ type: "subject", id, data: subject });
        }}
        onDelete={(id) => handleDeleteItem("subject", id)}
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
          level="chapter"
          selectedId={selectedChapterId}
          onSelect={handleChapterSelect}
          onAdd={() =>
            setDialogState({ type: "chapter", subjectId: selectedSubjectId })
          }
          addLabel="Add Chapter"
          onEdit={(id) => {
            const chapter = chapters.find(c => c.chapter_id === id);
            if (chapter) setEditingItem({ type: "chapter", id, data: chapter });
          }}
          onDelete={(id) => handleDeleteItem("chapter", id)}
        />
      )}

      {/* Topics Section */}
      {selectedChapterId && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Topics
            </h3>
          </div>
          {topics.length === 0 ? (
            <div className="flex justify-start">
              <Button
                variant="outline"
                className="h-10 border-dashed text-muted-foreground hover:text-primary hover:border-primary"
                onClick={() =>
                  setDialogState({ type: "topic", chapterId: selectedChapterId })
                }
              >
                <Plus className="h-4 w-4 mr-2" /> Add Topic
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {topics.map((topic) => (
                <div key={topic.topic_id} className="relative group">
                  <button
                    onClick={() => handleTopicSelect(topic.topic_id)}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-sm text-left transition-colors pr-8",
                      selectedTopicId === topic.topic_id
                        ? "bg-accent border-primary/30 text-accent-foreground"
                        : "bg-card text-foreground hover:bg-accent/50",
                      topic.completed && "line-through text-muted-foreground",
                      topic.archived && "opacity-60"
                    )}
                  >
                    <span className="mr-1.5 text-xs">
                      {topic.difficulty === "easy"
                        ? "🟢"
                        : topic.difficulty === "hard"
                          ? "🔴"
                          : "🟡"}
                    </span>
                    <span className="truncate block">{topic.name}</span>
                  </button>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleTopicComplete(topic.topic_id, topic.completed)}>
                          <Check className="mr-2 h-4 w-4" /> {topic.completed ? "Mark Incomplete" : "Mark Complete"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingItem({ type: "topic", id: topic.topic_id, data: topic })}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchiveItem("topic", topic.topic_id)}>
                          <Archive className="mr-2 h-4 w-4" /> Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteItem("topic", topic.topic_id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="h-auto min-h-[40px] border-dashed text-muted-foreground hover:text-primary hover:border-primary"
                onClick={() =>
                  setDialogState({ type: "topic", chapterId: selectedChapterId })
                }
              >
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
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
              <TaskCard
                key={task.task_id}
                task={task}
                onEdit={() => setEditingTask(task)}
                onDelete={() => tasksHook.remove.mutate(task.task_id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.task_id}
                task={task}
                compact
                onEdit={() => setEditingTask(task)}
                onDelete={() => tasksHook.remove.mutate(task.task_id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Item Dialog */}
      {editingItem && (
        <HierarchyItemForm
          key={editingItem.id}
          open={!!editingItem}
          onOpenChange={(op) => !op && setEditingItem(null)}
          level={editingItem.type}
          defaultValues={editingItem.data}
          isEditing
          onSubmit={handleEditItem}
        />
      )}

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
      {/* Edit Task Dialog */}
      {editingTask && (
        <TaskFormDialog
          key={editingTask.task_id}
          open={!!editingTask}
          onOpenChange={(op) => !op && setEditingTask(null)}
          defaultValues={editingTask}
          presetGoalId={goalId}
          presetSubjectId={selectedSubjectId ?? undefined}
          presetChapterId={selectedChapterId ?? undefined}
          presetTopicId={selectedTopicId ?? undefined}
          isEditing
          onSubmit={(values) => {
            tasksHook.update.mutate(
              { id: editingTask.task_id, ...values } as any,
              {
                onSuccess: () => {
                  toast.success("Task updated");
                  setEditingTask(null);
                },
                onError: (e: any) => toast.error(e.message),
              }
            );
          }}
        />
      )}

      {dialogState?.type === "task" && (
        <TaskFormDialog
          open
          onOpenChange={() => setDialogState(null)}
          presetGoalId={goalId}
          presetSubjectId={selectedSubjectId ?? undefined}
          presetChapterId={selectedChapterId ?? undefined}
          presetTopicId={selectedTopicId ?? undefined}
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
    archived?: boolean;
  }[];
  level?: "subject" | "chapter";
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  addLabel: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
}

function HierarchySection({
  title,
  items,
  selectedId,
  onSelect,
  onAdd,
  addLabel,
  onEdit,
  onDelete,
  onArchive
}: HierarchySectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      {items.length === 0 ? (
        <div className="flex justify-start">
          <Button
            variant="outline"
            className="h-14 w-full sm:w-48 border-dashed text-muted-foreground hover:text-primary hover:border-primary flex flex-col gap-1 items-center justify-center p-4"
            onClick={onAdd}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">{addLabel}</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {items.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <div key={item.id} className="relative group h-full">
                <button
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors text-left w-full h-full pr-8",
                    isSelected
                      ? "bg-accent border-primary/30 text-accent-foreground"
                      : "bg-card text-foreground hover:bg-accent/50",
                    item.completed && "line-through text-muted-foreground",
                    item.archived && "opacity-60"
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

                <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(item.id)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onArchive?.(item.id)}>
                        <Archive className="mr-2 h-4 w-4" /> Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete?.(item.id)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}

          <Button
            variant="outline"
            className="h-full min-h-[46px] border-dashed text-muted-foreground hover:text-primary hover:border-primary flex items-center justify-center gap-2"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─── Task Card ───────────────────────────────────────────────────── */

function TaskCard({
  task,
  compact = false,
  onEdit,
  onDelete,
}: {
  task: Task;
  compact?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const statusInfo = getTaskStatusInfo(task);

  const actions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 group">
        <div
          className="h-3 w-3 rounded-full shrink-0"
          style={{ background: statusInfo.color }}
        />
        <span className="text-sm font-medium truncate flex-1">{task.name}</span>
        <span className="text-xs text-muted-foreground shrink-0">
          {statusInfo.label}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          {actions}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3 group">
      <div
        className="h-4 w-4 rounded-full shrink-0 mt-0.5"
        style={{ background: statusInfo.color }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium truncate">{task.name}</p>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1">
            {actions}
          </div>
        </div>

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


