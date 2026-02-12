import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parseISO } from "date-fns";
import { PrioritySelector } from "./PrioritySelector";
import { ExamFields } from "./ExamFields";
import { HierarchyCombobox } from "./HierarchyCombobox";
import { useGoals } from "@/hooks/useGoals";
import { useAllHierarchy } from "@/hooks/useAllHierarchy";
import { useTaskTypes } from "@/hooks/useTaskTypes";
import { useStudySessions } from "@/hooks/useStudySessions";
import { useTaskTemplates } from "@/hooks/useTaskTemplates";
import { DEFAULT_TASK_TYPES, EXAM_TASK_TYPES } from "@/types/database";
import type { Task } from "@/types/database";
import { toast } from "sonner";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Partial<Task>) => void;
  defaultValues?: Partial<Task>;
  presetGoalId?: string;
  presetSubjectId?: string;
  presetChapterId?: string;
  presetTopicId?: string;
  isEditing?: boolean;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  presetGoalId,
  presetSubjectId,
  presetChapterId,
  presetTopicId,
  isEditing = false,
}: TaskFormDialogProps) {
  const { data: goals = [] } = useGoals();
  const { allTypes, seedDefaults } = useTaskTypes();
  const { data: sessions = [] } = useStudySessions();
  const { templates } = useTaskTemplates();

  // Use comprehensive hierarchy hook
  const hierarchy = useAllHierarchy();

  const [name, setName] = useState(defaultValues?.name ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [goalId, setGoalId] = useState(defaultValues?.goal_id ?? presetGoalId ?? "");
  const [subjectId, setSubjectId] = useState(defaultValues?.subject_id ?? "");
  const [chapterId, setChapterId] = useState(defaultValues?.chapter_id ?? "");
  const [topicId, setTopicId] = useState(defaultValues?.topic_id ?? "");
  const [taskType, setTaskType] = useState(defaultValues?.task_type ?? "study");
  const [priorityNumber, setPriorityNumber] = useState(defaultValues?.priority_number ?? 1000);
  const [scheduledDate, setScheduledDate] = useState(defaultValues?.scheduled_date ?? "");
  const [estimatedDuration, setEstimatedDuration] = useState(defaultValues?.estimated_duration ?? null);
  const [scheduledTime, setScheduledTime] = useState(defaultValues?.scheduled_time_slot ?? "");
  const [sessionId, setSessionId] = useState(defaultValues?.preferred_session_id ?? "");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("none");

  // Seed default task types if none exist
  useEffect(() => {
    if (allTypes.length === 0 && open) {
      seedDefaults.mutate();
    }
  }, [allTypes.length, open]);

  // Handle template selection - fills everything EXCEPT name and description
  const handleTemplateSelect = (tId: string) => {
    setSelectedTemplateId(tId);
    if (tId === "none") return;

    const template = templates.find(t => t.template_id === tId);
    if (template) {
      // DON'T fill name and description - user provides these
      // setName(template.name); // ❌

      // DO fill everything else:
      setTaskType(template.task_type);
      setPriorityNumber(template.priority_number);

      if (template.estimated_duration) {
        setEstimatedDuration(template.estimated_duration);
      }

      // Hierarchy fields
      if (template.goal_id) setGoalId(template.goal_id);
      if (template.subject_id) setSubjectId(template.subject_id);
      if (template.chapter_id) setChapterId(template.chapter_id);
      if (template.topic_id) setTopicId(template.topic_id);

      // Scheduling fields
      if (template.scheduled_time_slot) setScheduledTime(template.scheduled_time_slot);
      if (template.preferred_session_id) setSessionId(template.preferred_session_id);
    }
  };

  // Smart selection handlers with bidirectional logic
  const handleGoalChange = (newGoalId: string) => {
    setGoalId(newGoalId);
    // Don't reset children if editing
    if (!isEditing && !presetSubjectId && !presetChapterId && !presetTopicId) {
      setSubjectId("");
      setChapterId("");
      setTopicId("");
    }
  };

  const handleSubjectChange = (newSubjectId: string) => {
    setSubjectId(newSubjectId);

    if (newSubjectId) {
      // Backtrace: auto-fill Goal
      const traced = hierarchy.backtraceFromSubject(newSubjectId);
      if (traced) {
        setGoalId(traced.goalId);
      }
    }

    // Reset children
    if (!isEditing && !presetChapterId && !presetTopicId) {
      setChapterId("");
      setTopicId("");
    }
  };

  const handleChapterChange = (newChapterId: string) => {
    setChapterId(newChapterId);

    if (newChapterId) {
      // Backtrace: auto-fill Subject and Goal
      const traced = hierarchy.backtraceFromChapter(newChapterId);
      if (traced) {
        setGoalId(traced.goalId);
        setSubjectId(traced.subjectId);
      }
    }

    // Reset topic
    if (!isEditing && !presetTopicId) {
      setTopicId("");
    }
  };

  const handleTopicChange = (newTopicId: string) => {
    setTopicId(newTopicId);

    if (newTopicId) {
      // Backtrace: auto-fill all parents
      const traced = hierarchy.backtraceFromTopic(newTopicId);
      if (traced) {
        setGoalId(traced.goalId);
        setSubjectId(traced.subjectId);
        setChapterId(traced.chapterId);
      }
    }
  };

  // Pre-fill from context (Goals page)
  useEffect(() => {
    if (open && !isEditing) {
      if (presetTopicId) {
        // Backtrace from topic
        const traced = hierarchy.backtraceFromTopic(presetTopicId);
        if (traced) {
          setGoalId(traced.goalId);
          setSubjectId(traced.subjectId);
          setChapterId(traced.chapterId);
          setTopicId(traced.topicId);
        }
      } else if (presetChapterId) {
        // Backtrace from chapter
        const traced = hierarchy.backtraceFromChapter(presetChapterId);
        if (traced) {
          setGoalId(traced.goalId);
          setSubjectId(traced.subjectId);
          setChapterId(traced.chapterId);
        }
      } else if (presetSubjectId) {
        // Backtrace from subject
        const traced = hierarchy.backtraceFromSubject(presetSubjectId);
        if (traced) {
          setGoalId(traced.goalId);
          setSubjectId(traced.subjectId);
        }
      } else if (presetGoalId) {
        setGoalId(presetGoalId);
      }
    }
  }, [open, presetGoalId, presetSubjectId, presetChapterId, presetTopicId, isEditing]);

  const handleSessionSelect = (sId: string) => {
    setSessionId(sId);
    if (sId === "none" || !sId) {
      setSessionId("");
      return;
    }

    const session = sessions.find(s => s.session_config_id === sId);
    if (session) {
      // Calculate duration
      const start = new Date(`2000-01-01T${session.start_time}`);
      let end = new Date(`2000-01-01T${session.end_time}`);
      if (session.is_overnight) {
        end = new Date(`2000-01-02T${session.end_time}`);
      }

      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      setEstimatedDuration(diffMins);
      setScheduledTime(`${session.start_time.slice(0, 5)} - ${session.end_time.slice(0, 5)}`);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Task name is required");
      return;
    }
    if (!goalId) {
      toast.error("Please select a goal");
      return;
    }

    const values: Partial<Task> = {
      name: name.trim(),
      description: description.trim() || null,
      goal_id: goalId,
      subject_id: subjectId || null,
      chapter_id: chapterId || null,
      topic_id: topicId || null,
      task_type: taskType,
      priority_number: priorityNumber,
      scheduled_date: scheduledDate || null,
      estimated_duration: estimatedDuration,
      scheduled_time_slot: scheduledTime || null,
      preferred_session_id: sessionId || null,
    };

    onSubmit(values);
    if (!isEditing) {
      // Reset form
      setName("");
      setDescription("");
      setTaskType("study");
      setPriorityNumber(1000);
      setScheduledDate("");
      setEstimatedDuration(null);
      setScheduledTime("");
      setSessionId("");
    }
    onOpenChange(false);
  };

  const taskTypeOptions =
    allTypes.length > 0
      ? allTypes.map((t) => ({ value: t.name, label: `${t.icon} ${t.name}` }))
      : DEFAULT_TASK_TYPES.map((t) => ({ value: t.name, label: `${t.icon} ${t.name}` }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!isEditing && templates.length > 0 && (
            <div className="space-y-1 mb-4 p-3 bg-muted/30 rounded-lg border border-dashed">
              <Label className="text-xs text-muted-foreground">Load from Template</Label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.template_id} value={t.template_id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Task Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Solve integration problems"
              className="text-base"
            />
          </div>

          {/* Hierarchy Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Hierarchy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Goal (required) */}
              <div className="space-y-2">
                <Label>Goal *</Label>
                <HierarchyCombobox
                  value={goalId}
                  onValueChange={handleGoalChange}
                  items={goals.map((g) => ({
                    value: g.goal_id,
                    label: g.name,
                    icon: g.icon,
                  }))}
                  placeholder="Select a goal"
                  searchPlaceholder="Search goals..."
                  emptyText="No goals found."
                  allowNone={false}
                />
              </div>

              {/* Subject (always visible, filtered) */}
              <div className="space-y-2">
                <Label>Subject (optional)</Label>
                <HierarchyCombobox
                  value={subjectId}
                  onValueChange={handleSubjectChange}
                  items={hierarchy.getSubjectsByGoal(goalId).map((s) => ({
                    value: s.subject_id,
                    label: s.name,
                    icon: s.icon,
                  }))}
                  placeholder="Select a subject"
                  searchPlaceholder="Search subjects..."
                  emptyText="No subjects available."
                  allowNone={true}
                />
              </div>

              {/* Chapter (always visible, filtered) */}
              <div className="space-y-2">
                <Label>Chapter (optional)</Label>
                <HierarchyCombobox
                  value={chapterId}
                  onValueChange={handleChapterChange}
                  items={hierarchy.getChaptersBySubject(subjectId).map((c) => ({
                    value: c.chapter_id,
                    label: c.chapter_number ? `Ch ${c.chapter_number}: ${c.name}` : c.name,
                    icon: "",
                  }))}
                  placeholder="Select a chapter"
                  searchPlaceholder="Search chapters..."
                  emptyText="No chapters available."
                  allowNone={true}
                />
              </div>

              {/* Topic (always visible, filtered) */}
              <div className="space-y-2">
                <Label>Topic (optional)</Label>
                <HierarchyCombobox
                  value={topicId}
                  onValueChange={handleTopicChange}
                  items={hierarchy.getTopicsByChapter(chapterId).map((t) => ({
                    value: t.topic_id,
                    label: t.name,
                    icon: "",
                  }))}
                  placeholder="Select a topic"
                  searchPlaceholder="Search topics..."
                  emptyText="No topics available."
                  allowNone={true}
                />
              </div>
            </div>
          </div>

          {/* Task Details Section */}
          <div className="space-y-4 pt-2 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Task Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Task Type */}
              <div className="space-y-2">
                <Label>Task Type</Label>
                <Select value={taskType} onValueChange={setTaskType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypeOptions.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <PrioritySelector value={priorityNumber} onChange={setPriorityNumber} />
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Scheduled Date</Label>
              <DatePicker
                date={scheduledDate ? parseISO(scheduledDate) : undefined}
                onSelect={(d) => d && setScheduledDate(format(d, "yyyy-MM-dd"))}
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <Label>Time Slot / Session</Label>
              <Select value={sessionId || "none"} onValueChange={handleSessionSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Custom Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Custom Time</SelectItem>
                  {sessions.map((s) => (
                    <SelectItem key={s.session_config_id} value={s.session_config_id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                        {s.name} ({s.start_time.slice(0, 5)})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Time Range</Label>
              <Input
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="e.g. 09:00 - 11:00"
              />
            </div>
            <div className="space-y-1">
              <Label>Est. Duration (min)</Label>
              <Input
                type="number"
                min={1}
                value={estimatedDuration ?? ""}
                onChange={(e) =>
                  setEstimatedDuration(e.target.value ? parseInt(e.target.value) : null)
                }
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              placeholder="Task details..."
            />
          </div>



          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? "Save" : "Create Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
