import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Task } from "@/types/database";
import { useTimerSessions } from "@/hooks/useTimerSessions";
import { useTaskTypes } from "@/hooks/useTaskTypes";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, AlertTriangle, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TaskCompletionData {
    // Manual time tracking
    is_manual_completion?: boolean;
    start_time?: string;
    actual_duration?: number;

    // Exam analysis
    analysis_completed?: boolean;
    total_questions?: number;
    attempted_questions?: number;
    correct_answers?: number;
    wrong_answers?: number;
    skipped_questions?: number;
    marks_per_question?: number;
    negative_marking?: number;
    time_taken_minutes?: number;
    marks_obtained?: number;
    total_marks?: number;
    accuracy_percentage?: number;

    // Other type-specific fields
    difficulty_level?: string;
    grade?: string;
    submission_status?: string;
    retention_score?: number;
}

interface TaskCompletionDialogProps {
    task: Task;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: (data: TaskCompletionData) => void;
    isSubmitting?: boolean;
}



export function TaskCompletionDialog({
    task,
    open,
    onOpenChange,
    onComplete,
    isSubmitting = false,
}: TaskCompletionDialogProps) {
    const { sessions } = useTimerSessions(task.task_id);
    const { allTypes } = useTaskTypes();

    // Determine system behavior from user task types
    const taskTypeBehavior = allTypes?.find(t => t.name === task.task_type)?.system_behavior || 'study';

    const isExamType = taskTypeBehavior === 'exam';
    const isPracticeType = taskTypeBehavior === 'practice';
    const isAssignmentType = taskTypeBehavior === 'assignment';
    const isRevisionType = taskTypeBehavior === 'revision';

    const isLoadingSessions = sessions.isLoading;
    const hasTimerSessions = (sessions.data?.length || 0) > 0;

    // Form State
    const [manualDate, setManualDate] = useState<Date | undefined>(new Date());
    const [manualTime, setManualTime] = useState(format(new Date(), "HH:mm"));
    const [manualDuration, setManualDuration] = useState<number>(0);
    const [includeAnalysis, setIncludeAnalysis] = useState(false);

    // Exam Analysis State
    const [totalQuestions, setTotalQuestions] = useState<number | "">("");
    const [attemptedQuestions, setAttemptedQuestions] = useState<number | "">("");
    const [correctAnswers, setCorrectAnswers] = useState<number | "">("");
    const [marksPerQuestion, setMarksPerQuestion] = useState<number>(1);
    const [negativeMarking, setNegativeMarking] = useState<number>(0);
    const [timeTaken, setTimeTaken] = useState<number | "">("");

    // Other Type State
    const [difficulty, setDifficulty] = useState("medium");
    const [grade, setGrade] = useState("");
    const [submissionStatus, setSubmissionStatus] = useState("submitted");
    const [retentionScore, setRetentionScore] = useState<number>(50);

    // Validation State
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset state when opening
    useEffect(() => {
        if (open) {
            setManualDate(new Date());
            setManualTime(format(new Date(), "HH:mm"));
            setManualDuration(task.estimated_duration || 30);
            setIncludeAnalysis(isExamType); // Default ON for exam types
            setTotalQuestions(task.total_questions || "");

            // Standard defaults
            setMarksPerQuestion(task.marks_per_question || 1);
            setNegativeMarking(task.negative_marking || 0);

            // Reset other fields
            setAttemptedQuestions("");
            setCorrectAnswers("");
            setTimeTaken("");
            setDifficulty("medium");
            setGrade("");
            setSubmissionStatus("submitted");
            setRetentionScore(50);
            setErrors({});
        }
    }, [open, task, isExamType]);

    // Calculations
    const calculations = useMemo(() => {
        const total = Number(totalQuestions) || 0;
        const attempted = Number(attemptedQuestions) || 0;
        const correct = Number(correctAnswers) || 0;
        const marks = Number(marksPerQuestion) || 0;
        const negative = Number(negativeMarking) || 0;

        const wrong = Math.max(0, attempted - correct);
        const skipped = Math.max(0, total - attempted);

        const totalMarksReq = total * marks;
        // Correct * Marks - Wrong * Negative
        const obtained = (correct * marks) - (wrong * negative);
        const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;

        return {
            wrong,
            skipped,
            totalMarks: totalMarksReq,
            marksObtained: obtained,
            accuracy,
        };
    }, [totalQuestions, attemptedQuestions, correctAnswers, marksPerQuestion, negativeMarking]);

    const showManualTime = !isLoadingSessions && !hasTimerSessions;

    const validate = () => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (showManualTime) {
            if (!manualDate) {
                newErrors.date = "Date is required";
                isValid = false;
            }
            if (!manualTime) {
                newErrors.time = "Time is required";
                isValid = false;
            }
            if (manualDuration < 0) {
                newErrors.duration = "Duration cannot be negative";
                isValid = false;
            }
        }

        if (isExamType && includeAnalysis) {
            const total = Number(totalQuestions);
            const attempted = Number(attemptedQuestions);
            const correct = Number(correctAnswers);
            const taken = Number(timeTaken);

            if (!totalQuestions || total <= 0) {
                newErrors.totalQuestions = "Total questions must be greater than 0";
                isValid = false;
            }

            if (attempted > total) {
                newErrors.attemptedQuestions = `Cannot be more than total questions (${total})`;
                isValid = false;
            }

            if (correct > attempted) {
                newErrors.correctAnswers = `Cannot be more than attempted questions (${attempted})`;
                isValid = false;
            }

            if (timeTaken === "" || taken < 0) {
                newErrors.timeTaken = "Time taken is required and must be positive";
                isValid = false;
            }

            // Exam Time <= Total Duration Validation
            const totalDuration = showManualTime ? manualDuration : (task.actual_duration || 0); // specific fallback if session exists
            // Since we don't have exact session sum here easily without summing 'sessions', 
            // and the user requirement specifically mentioned "duration after the start time , hsould always be greater to the exam time".

            if (showManualTime && taken > manualDuration) {
                newErrors.timeTaken = `Exam time (${taken}m) cannot exceed total session duration (${manualDuration}m)`;
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const data: TaskCompletionData = {};

        // 1. Time Tracking
        if (showManualTime) {
            data.is_manual_completion = true;
            // Combine Date + Time
            if (manualDate) {
                const dateTimeStr = `${format(manualDate, "yyyy-MM-dd")}T${manualTime}:00`;
                data.start_time = dateTimeStr;
            }
            data.actual_duration = manualDuration;
        } else {
            data.is_manual_completion = false;
        }

        // 2. Exam Analysis
        if (isExamType && includeAnalysis) {
            data.analysis_completed = true;
            data.total_questions = Number(totalQuestions);
            data.attempted_questions = Number(attemptedQuestions);
            data.correct_answers = Number(correctAnswers);
            data.wrong_answers = calculations.wrong;
            data.skipped_questions = calculations.skipped;
            data.marks_per_question = marksPerQuestion;
            data.negative_marking = negativeMarking;
            data.time_taken_minutes = Number(timeTaken) || manualDuration;
            data.marks_obtained = calculations.marksObtained;
            data.total_marks = calculations.totalMarks;
            data.accuracy_percentage = calculations.accuracy;
        }

        // 3. Other Types
        if (isPracticeType) {
            data.difficulty_level = difficulty;
        }
        if (isAssignmentType) {
            data.grade = grade;
            data.submission_status = submissionStatus;
        }
        if (isRevisionType) {
            data.retention_score = retentionScore;
        }

        onComplete(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Complete Task</DialogTitle>
                    <DialogDescription>
                        Mark "{task.name}" as done. verify the details below.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* 1. Timer / Manual Time Section */}
                    {isLoadingSessions ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : showManualTime ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md text-sm dark:bg-amber-950/30 dark:text-amber-400">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                <span>No timer sessions detected. Please enter details manually.</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 flex flex-col">
                                    <Label className={errors.date ? "text-destructive" : ""}>Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !manualDate && "text-muted-foreground",
                                                    errors.date && "border-destructive text-destructive"
                                                )}
                                            >
                                                {manualDate ? (
                                                    format(manualDate, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={manualDate}
                                                onSelect={setManualDate}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className={errors.time ? "text-destructive" : ""}>Time</Label>
                                    <Input
                                        type="time"
                                        value={manualTime}
                                        onChange={(e) => setManualTime(e.target.value)}
                                        className={errors.time ? "border-destructive" : ""}
                                    />
                                    {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className={errors.duration ? "text-destructive" : ""}>Total Duration (minutes)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={manualDuration}
                                        onChange={(e) => setManualDuration(Number(e.target.value))}
                                        className={errors.duration ? "border-destructive" : ""}
                                    />
                                    {errors.duration && <p className="text-xs text-destructive">{errors.duration}</p>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                            Using recorded timer sessions ({sessions.data?.length} sessions).
                        </div>
                    )}

                    <Separator />

                    {/* 2. Exam Analysis Section */}
                    {isExamType && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Exam Analysis</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Record detailed performance metrics
                                    </div>
                                </div>
                                <Switch
                                    checked={includeAnalysis}
                                    onCheckedChange={setIncludeAnalysis}
                                />
                            </div>

                            {includeAnalysis && (
                                <div className="space-y-4 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className={errors.totalQuestions ? "text-destructive" : ""}>Total Questions *</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={totalQuestions}
                                                onChange={(e) => setTotalQuestions(e.target.value === "" ? "" : Number(e.target.value))}
                                                className={errors.totalQuestions ? "border-destructive" : ""}
                                            />
                                            {errors.totalQuestions && <p className="text-xs text-destructive">{errors.totalQuestions}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className={errors.attemptedQuestions ? "text-destructive" : ""}>Attempted *</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max={Number(totalQuestions)}
                                                value={attemptedQuestions}
                                                onChange={(e) => setAttemptedQuestions(e.target.value === "" ? "" : Number(e.target.value))}
                                                className={errors.attemptedQuestions ? "border-destructive" : ""}
                                            />
                                            {errors.attemptedQuestions && <p className="text-xs text-destructive">{errors.attemptedQuestions}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className={errors.correctAnswers ? "text-destructive" : ""}>Correct Answers *</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max={Number(attemptedQuestions)}
                                                value={correctAnswers}
                                                onChange={(e) => setCorrectAnswers(e.target.value === "" ? "" : Number(e.target.value))}
                                                className={errors.correctAnswers ? "border-destructive" : ""}
                                            />
                                            {errors.correctAnswers && <p className="text-xs text-destructive">{errors.correctAnswers}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className={errors.timeTaken ? "text-destructive" : ""}>Exam Time (mins)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={timeTaken}
                                                onChange={(e) => setTimeTaken(e.target.value === "" ? "" : Number(e.target.value))}
                                                placeholder={manualDuration.toString()}
                                                className={errors.timeTaken ? "border-destructive" : ""}
                                            />
                                            {errors.timeTaken && <p className="text-xs text-destructive">{errors.timeTaken}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Marks / Q</Label>
                                            <Input
                                                type="number"
                                                step="0.25"
                                                value={marksPerQuestion}
                                                onChange={(e) => setMarksPerQuestion(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Negative Marking</Label>
                                            <Input
                                                type="number"
                                                step="0.25"
                                                value={negativeMarking}
                                                onChange={(e) => setNegativeMarking(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    {/* Auto-Calculated Results Preview */}
                                    <div className="grid grid-cols-3 gap-2 pt-2">
                                        <Card className="p-3 text-center bg-background">
                                            <div className="text-xs text-muted-foreground mb-1">Wrong</div>
                                            <div className="font-bold text-destructive">{calculations.wrong}</div>
                                        </Card>
                                        <Card className="p-3 text-center bg-background">
                                            <div className="text-xs text-muted-foreground mb-1">Score</div>
                                            <div className="font-bold text-primary">
                                                {calculations.marksObtained.toFixed(1)} / {calculations.totalMarks}
                                            </div>
                                        </Card>
                                        <Card className="p-3 text-center bg-background">
                                            <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
                                            <div className="font-bold text-green-600">
                                                {calculations.accuracy.toFixed(1)}%
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. Practice Fields */}
                    {isPracticeType && (
                        <div className="space-y-2">
                            <Label>Difficulty Level</Label>
                            <Select value={difficulty} onValueChange={setDifficulty}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* 4. Assignment Fields */}
                    {isAssignmentType && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Submission Status</Label>
                                <Select value={submissionStatus} onValueChange={setSubmissionStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="graded">Graded</SelectItem>
                                        <SelectItem value="returned">Returned</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Grade / Score</Label>
                                <Input
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    placeholder="e.g. A, 9/10"
                                />
                            </div>
                        </div>
                    )}

                    {/* 5. Revision Fields */}
                    {isRevisionType && (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label>Retention Confidence</Label>
                                <span className="text-sm font-medium">{retentionScore}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={retentionScore}
                                onChange={(e) => setRetentionScore(Number(e.target.value))}
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Forgot a lot</span>
                                <span>Remembered everything</span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Complete Task
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
