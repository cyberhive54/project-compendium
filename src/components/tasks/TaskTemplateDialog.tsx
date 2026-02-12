import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { HierarchyCombobox } from "./HierarchyCombobox";
import { useGoals } from "@/hooks/useGoals";
import { useAllHierarchy } from "@/hooks/useAllHierarchy";
import { useStudySessions } from "@/hooks/useStudySessions";
import { useTaskTypes } from "@/hooks/useTaskTypes";
import type { TaskTemplate } from "@/hooks/useTaskTemplates";
import { toast } from "sonner";
import { PrioritySelector } from "@/components/tasks/PrioritySelector";
import { format, parseISO } from "date-fns";

const DEFAULT_TASK_TYPES = [
    { name: "Study", icon: "📚" },
    { name: "Revision", icon: "🔄" },
    { name: "Assignment", icon: "📝" },
    { name: "Project", icon: "🚀" },
    { name: "Exam", icon: "📊" },
];

const templateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    goal_id: z.string().optional(),
    subject_id: z.string().optional(),
    chapter_id: z.string().optional(),
    topic_id: z.string().optional(),
    task_type: z.string().min(1, "Task type is required"),
    priority_number: z.coerce.number().min(0).max(9999),
    estimated_duration: z.coerce.number().min(0).optional(),
    scheduled_time_slot: z.string().optional(),
    preferred_session_id: z.string().optional(),
    schedule_start: z.string().optional(),
    schedule_end: z.string().optional(),
    recurrence: z.enum(["daily", "weekly", "monthly", "none"]).default("none"),
    is_active: z.boolean().default(true),
});

interface TaskTemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: TaskTemplate;
    onSubmit: (data: any) => void;
}

export function TaskTemplateDialog({
    open,
    onOpenChange,
    initialData,
    onSubmit,
}: TaskTemplateDialogProps) {
    const { data: goals = [] } = useGoals();
    const hierarchy = useAllHierarchy();
    const { data: sessions = [] } = useStudySessions();
    const { allTypes } = useTaskTypes();

    const [goalId, setGoalId] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [chapterId, setChapterId] = useState("");
    const [topicId, setTopicId] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [priorityNumber, setPriorityNumber] = useState(1000);
    const [estimatedDuration, setEstimatedDuration] = useState<number | null>(30);
    const [scheduledTime, setScheduledTime] = useState("");

    const form = useForm<z.infer<typeof templateSchema>>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: "",
            goal_id: "",
            subject_id: "",
            chapter_id: "",
            topic_id: "",
            task_type: "study",
            priority_number: 1000,
            estimated_duration: 30,
            scheduled_time_slot: "",
            preferred_session_id: "",
            schedule_start: "",
            schedule_end: "",
            recurrence: "none",
            is_active: true,
        },
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                setGoalId(initialData.goal_id || "");
                setSubjectId(initialData.subject_id || "");
                setChapterId(initialData.chapter_id || "");
                setTopicId(initialData.topic_id || "");
                setSessionId(initialData.preferred_session_id || "");
                setPriorityNumber(initialData.priority_number);
                setEstimatedDuration(initialData.estimated_duration || 30);
                setScheduledTime(initialData.scheduled_time_slot || "");

                form.reset({
                    name: initialData.name,
                    goal_id: initialData.goal_id,
                    subject_id: initialData.subject_id || "",
                    chapter_id: initialData.chapter_id || "",
                    topic_id: initialData.topic_id || "",
                    task_type: initialData.task_type,
                    priority_number: initialData.priority_number,
                    estimated_duration: initialData.estimated_duration,
                    scheduled_time_slot: initialData.scheduled_time_slot || "",
                    preferred_session_id: initialData.preferred_session_id || "",
                    schedule_start: initialData.schedule_start || "",
                    schedule_end: "",
                    recurrence: (initialData.recurrence as any) || "none",
                    is_active: initialData.is_active,
                });
            } else {
                setGoalId("");
                setSubjectId("");
                setChapterId("");
                setTopicId("");
                setSessionId("");
                setPriorityNumber(1000);
                setEstimatedDuration(30);
                setScheduledTime("");

                form.reset({
                    name: "",
                    goal_id: "",
                    subject_id: "",
                    chapter_id: "",
                    topic_id: "",
                    task_type: allTypes.length > 0 ? allTypes[0].name.toLowerCase() : "study",
                    priority_number: 1000,
                    estimated_duration: 30,
                    scheduled_time_slot: "",
                    preferred_session_id: "",
                    schedule_start: "",
                    schedule_end: "",
                    recurrence: "none",
                    is_active: true,
                });
            }
        }
    }, [open, initialData, form, allTypes]);

    const handleGoalChange = (value: string) => {
        setGoalId(value);
        form.setValue("goal_id", value);
    };

    const handleSubjectChange = (value: string) => {
        setSubjectId(value);
        form.setValue("subject_id", value);
        if (value) {
            const traced = hierarchy.backtraceFromSubject(value);
            if (traced) {
                setGoalId(traced.goalId);
                form.setValue("goal_id", traced.goalId);
            }
        }
    };

    const handleChapterChange = (value: string) => {
        setChapterId(value);
        form.setValue("chapter_id", value);
        if (value) {
            const traced = hierarchy.backtraceFromChapter(value);
            if (traced) {
                setGoalId(traced.goalId);
                setSubjectId(traced.subjectId);
                form.setValue("goal_id", traced.goalId);
                form.setValue("subject_id", traced.subjectId);
            }
        }
    };

    const handleTopicChange = (value: string) => {
        setTopicId(value);
        form.setValue("topic_id", value);
        if (value) {
            const traced = hierarchy.backtraceFromTopic(value);
            if (traced) {
                setGoalId(traced.goalId);
                setSubjectId(traced.subjectId);
                setChapterId(traced.chapterId);
                form.setValue("goal_id", traced.goalId);
                form.setValue("subject_id", traced.subjectId);
                form.setValue("chapter_id", traced.chapterId);
            }
        }
    };

    // Session selection auto-fills time and duration - SAME AS TASK DIALOG
    const handleSessionSelect = (sId: string) => {
        setSessionId(sId);
        form.setValue("preferred_session_id", sId);

        if (sId === "none" || !sId) {
            setSessionId("");
            form.setValue("preferred_session_id", "");
            return;
        }

        const session = sessions.find((s) => s.session_config_id === sId);
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
            form.setValue("estimated_duration", diffMins);

            const timeSlot = `${session.start_time.slice(0, 5)} - ${session.end_time.slice(0, 5)}`;
            setScheduledTime(timeSlot);
            form.setValue("scheduled_time_slot", timeSlot);
        }
    };

    const taskTypeOptions =
        allTypes.length > 0
            ? allTypes.map((t) => ({ value: t.name.toLowerCase(), label: `${t.icon} ${t.name}` }))
            : DEFAULT_TASK_TYPES.map((t) => ({ value: t.name.toLowerCase(), label: `${t.icon} ${t.name}` }));

    // Get selected goal to check date constraints (target_date or end_date)
    const selectedGoal = goals.find((g) => g.goal_id === goalId);
    const maxDate = selectedGoal?.target_date
        ? new Date(selectedGoal.target_date)
        : selectedGoal?.end_date
            ? new Date(selectedGoal.end_date)
            : undefined;
    const maxDateLabel = selectedGoal?.target_date
        ? `target: ${new Date(selectedGoal.target_date).toLocaleDateString()}`
        : selectedGoal?.end_date
            ? `end: ${new Date(selectedGoal.end_date).toLocaleDateString()}`
            : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Edit Template" : "Create Template"}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? "Update your task template settings"
                            : "Create a reusable template for recurring tasks"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((values) => {
                            // Clean up empty strings - convert to null/undefined for database
                            const cleanedData = {
                                ...values,
                                goal_id: values.goal_id || undefined,
                                subject_id: values.subject_id || null,
                                chapter_id: values.chapter_id || null,
                                topic_id: values.topic_id || null,
                                scheduled_time_slot: values.scheduled_time_slot || null,
                                preferred_session_id: values.preferred_session_id || null,
                                schedule_start: values.schedule_start || null,
                                schedule_end: values.schedule_end || null,
                                estimated_duration: values.estimated_duration || null,
                            };
                            onSubmit(cleanedData);
                            onOpenChange(false);
                        })}
                        className="space-y-6"
                    >
                        {/* Template Name */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Template Name *</Label>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g. Daily Math Practice"
                                                className="text-base"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Hierarchy Section */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Hierarchy
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Goal */}
                                <div className="space-y-2">
                                    <Label>Goal</Label>
                                    <HierarchyCombobox
                                        value={goalId}
                                        onValueChange={handleGoalChange}
                                        items={goals.map((g) => ({
                                            value: g.goal_id,
                                            label: g.name,
                                            icon: g.icon,
                                        }))}
                                        placeholder="Select goal"
                                        searchPlaceholder="Search goals..."
                                        emptyText="No goals available."
                                        allowNone={true}
                                    />
                                </div>

                                {/* Subject */}
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
                                        placeholder="Select subject"
                                        searchPlaceholder="Search subjects..."
                                        emptyText="No subjects available."
                                        allowNone={true}
                                    />
                                </div>

                                {/* Chapter */}
                                <div className="space-y-2">
                                    <Label>Chapter (optional)</Label>
                                    <HierarchyCombobox
                                        value={chapterId}
                                        onValueChange={handleChapterChange}
                                        items={hierarchy.getChaptersBySubject(subjectId).map((c) => ({
                                            value: c.chapter_id,
                                            label: c.chapter_number
                                                ? `Ch ${c.chapter_number}: ${c.name}`
                                                : c.name,
                                            icon: "",
                                        }))}
                                        placeholder="Select chapter"
                                        searchPlaceholder="Search chapters..."
                                        emptyText="No chapters available."
                                        allowNone={true}
                                    />
                                </div>

                                {/* Topic */}
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
                                        placeholder="Select topic"
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
                                {/* Type */}
                                <div className="space-y-2">
                                    <Label>Task Type</Label>
                                    <FormField
                                        control={form.control}
                                        name="task_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {taskTypeOptions.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Priority */}
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <PrioritySelector
                                        value={priorityNumber}
                                        onChange={(val) => {
                                            setPriorityNumber(val);
                                            form.setValue("priority_number", val);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Scheduling Section */}
                        <div className="space-y-4 pt-2 border-t">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Scheduling
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Session (auto-fills time) */}
                                <div className="space-y-2">
                                    <Label>Study Session (auto-fills time)</Label>
                                    <Select value={sessionId} onValueChange={handleSessionSelect}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select session" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {sessions.map((session) => (
                                                <SelectItem
                                                    key={session.session_config_id}
                                                    value={session.session_config_id}
                                                >
                                                    {session.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Time Slot (auto-filled by session) */}
                                <div className="space-y-2">
                                    <Label>Time Slot</Label>
                                    <Input
                                        value={scheduledTime}
                                        onChange={(e) => {
                                            setScheduledTime(e.target.value);
                                            form.setValue("scheduled_time_slot", e.target.value);
                                        }}
                                        placeholder="Auto-filled by session"
                                        readOnly={!!sessionId && sessionId !== "none"}
                                    />
                                </div>

                                {/* Duration */}
                                <div className="space-y-2">
                                    <Label>Duration (minutes)</Label>
                                    <Input
                                        type="number"
                                        value={estimatedDuration || ""}
                                        onChange={(e) => {
                                            const val = e.target.value ? parseInt(e.target.value) : null;
                                            setEstimatedDuration(val);
                                            form.setValue("estimated_duration", val || 0);
                                        }}
                                        placeholder="e.g., 60"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Template-Specific Fields */}
                        <div className="space-y-4 pt-2 border-t">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Template Settings
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="recurrence"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Recurrence / Frequency</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">One-off</SelectItem>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Recurrence Start Date */}
                                <FormField
                                    control={form.control}
                                    name="schedule_start"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    date={field.value ? parseISO(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                                    className="w-full"
                                                    placeholder="Select start date"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Recurrence End Date */}
                                <FormField
                                    control={form.control}
                                    name="schedule_end"
                                    render={({ field }) => {
                                        return (
                                            <FormItem>
                                                <FormLabel>
                                                    End Date {maxDateLabel && `(max ${maxDateLabel})`}
                                                </FormLabel>
                                                <FormControl>
                                                    <DatePicker
                                                        date={field.value ? parseISO(field.value) : undefined}
                                                        onSelect={(date) => {
                                                            // Validate against goal target_date
                                                            if (date && maxDate && date > maxDate) {
                                                                toast.error(`End date cannot exceed goal target date (${maxDate.toLocaleDateString()})`);
                                                                return;
                                                            }
                                                            field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                                                        }}
                                                        className="w-full"
                                                        placeholder={selectedGoal?.target_date ? "Must be within goal deadline" : "Select a goal first"}
                                                        toDate={maxDate}
                                                        disabled={!selectedGoal}
                                                    />
                                                </FormControl>
                                                {!selectedGoal && (
                                                    <p className="text-xs text-muted-foreground">Select a goal to enable end date</p>
                                                )}
                                                {selectedGoal && !selectedGoal.target_date && !selectedGoal.end_date && (
                                                    <p className="text-xs text-amber-600">⚠️ Selected goal has no target or end date</p>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel>Active Template</FormLabel>
                                            <div className="text-sm text-muted-foreground">
                                                Enable this template for task creation
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">{initialData ? "Update" : "Create"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
