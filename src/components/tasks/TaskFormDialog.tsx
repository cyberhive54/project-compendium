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
import { PrioritySelector } from "./PrioritySelector";
import { ExamFields } from "./ExamFields";
import { useGoals } from "@/hooks/useGoals";
import { useSubjects } from "@/hooks/useSubjects";
import { useChapters } from "@/hooks/useChapters";
import { useTopics } from "@/hooks/useTopics";
import { useTaskTypes } from "@/hooks/useTaskTypes";
import { DEFAULT_TASK_TYPES, EXAM_TASK_TYPES } from "@/types/database";
import type { Task } from "@/types/database";
import { toast } from "sonner";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Partial<Task>) => void;
  defaultValues?: Partial<Task>;
  presetGoalId?: string;
  isEditing?: boolean;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  presetGoalId,
  isEditing = false,
}: TaskFormDialogProps) {
  const { data: goals = [] } = useGoals();
  const { allTypes, seedDefaults } = useTaskTypes();

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
  const [examFields, setExamFields] = useState({
    total_questions: defaultValues?.total_questions ?? null,
    attempted_questions: defaultValues?.attempted_questions ?? null,
    correct_answers: defaultValues?.correct_answers ?? null,
    wrong_answers: defaultValues?.wrong_answers ?? null,
    marks_per_question: defaultValues?.marks_per_question ?? null,
    negative_marking: defaultValues?.negative_marking ?? null,
    time_taken_minutes: defaultValues?.time_taken_minutes ?? null,
    marks_obtained: defaultValues?.marks_obtained ?? null,
  });

  const { data: subjects = [] } = useSubjects(goalId || undefined);
  const { data: chapters = [] } = useChapters(subjectId || undefined);
  const { data: topics = [] } = useTopics(chapterId || undefined);

  // Seed default task types if none exist
  useEffect(() => {
    if (allTypes.length === 0 && open) {
      seedDefaults.mutate();
    }
  }, [allTypes.length, open]);

  // Reset cascading selectors
  useEffect(() => {
    if (!isEditing) {
      setSubjectId("");
      setChapterId("");
      setTopicId("");
    }
  }, [goalId]);

  useEffect(() => {
    if (!isEditing) {
      setChapterId("");
      setTopicId("");
    }
  }, [subjectId]);

  useEffect(() => {
    if (!isEditing) {
      setTopicId("");
    }
  }, [chapterId]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Task name is required");
      return;
    }
    if (!goalId) {
      toast.error("Please select a goal");
      return;
    }

    // Validate exam fields
    if (EXAM_TASK_TYPES.includes(taskType)) {
      const { attempted_questions, correct_answers, wrong_answers, total_questions } = examFields;
      if (attempted_questions !== null && total_questions !== null && attempted_questions > total_questions) {
        toast.error("Attempted cannot exceed total questions");
        return;
      }
      if (correct_answers !== null && attempted_questions !== null && correct_answers > attempted_questions) {
        toast.error("Correct answers cannot exceed attempted");
        return;
      }
      if (wrong_answers !== null && attempted_questions !== null && wrong_answers > attempted_questions) {
        toast.error("Wrong answers cannot exceed attempted");
        return;
      }
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
      ...(EXAM_TASK_TYPES.includes(taskType) ? examFields : {}),
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
      setExamFields({
        total_questions: null,
        attempted_questions: null,
        correct_answers: null,
        wrong_answers: null,
        marks_per_question: null,
        negative_marking: null,
        time_taken_minutes: null,
        marks_obtained: null,
      });
    }
    onOpenChange(false);
  };

  const taskTypeOptions =
    allTypes.length > 0
      ? allTypes.map((t) => ({ value: t.name, label: `${t.icon} ${t.name}` }))
      : DEFAULT_TASK_TYPES.map((t) => ({ value: t.name, label: `${t.icon} ${t.name}` }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label>Task Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Solve integration problems"
            />
          </div>

          {/* Goal (required) */}
          <div className="space-y-1">
            <Label>Goal *</Label>
            <Select value={goalId} onValueChange={setGoalId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((g) => (
                  <SelectItem key={g.goal_id} value={g.goal_id}>
                    {g.icon} {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cascading selectors */}
          {goalId && subjects.length > 0 && (
            <div className="space-y-1">
              <Label>Subject (optional)</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s.subject_id} value={s.subject_id}>
                      {s.icon} {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {subjectId && chapters.length > 0 && (
            <div className="space-y-1">
              <Label>Chapter (optional)</Label>
              <Select value={chapterId} onValueChange={setChapterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {chapters.map((c) => (
                    <SelectItem key={c.chapter_id} value={c.chapter_id}>
                      {c.chapter_number ? `Ch ${c.chapter_number}: ` : ""}
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {chapterId && topics.length > 0 && (
            <div className="space-y-1">
              <Label>Topic (optional)</Label>
              <Select value={topicId} onValueChange={setTopicId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {topics.map((t) => (
                    <SelectItem key={t.topic_id} value={t.topic_id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Task Type */}
          <div className="space-y-1">
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
          <div className="space-y-1">
            <Label>Priority</Label>
            <PrioritySelector value={priorityNumber} onChange={setPriorityNumber} />
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Scheduled Date</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
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

          {/* Exam Fields */}
          <ExamFields
            taskType={taskType}
            values={examFields}
            onChange={(field, value) =>
              setExamFields((prev) => ({ ...prev, [field]: value }))
            }
          />

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
