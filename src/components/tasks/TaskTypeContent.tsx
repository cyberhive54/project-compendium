import {
    Trophy,
    Target,
    AlertCircle,
    HelpCircle,
    GraduationCap,
    FileText,
    Brain,
    Pencil
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types/database";
import { useTaskTypes } from "@/hooks/useTaskTypes";

interface TaskTypeContentProps {
    task: Task;
    onEdit: () => void;
}

export function TaskTypeContent({ task, onEdit }: TaskTypeContentProps) {
    const { allTypes } = useTaskTypes();

    if (task.status !== "done") return null;

    // Determine system behavior from user task types
    const taskTypeBehavior = allTypes?.find(t => t.name === task.task_type)?.system_behavior || 'study';

    const isExamType = taskTypeBehavior === 'exam';
    const isAssignment = taskTypeBehavior === 'assignment';
    const isRevision = taskTypeBehavior === 'revision';
    const isPractice = taskTypeBehavior === 'practice';

    if (isExamType && (task.total_questions || task.marks_obtained !== null)) {
        const accuracy = task.accuracy_percentage || 0;
        const marks = task.marks_obtained || 0;
        const totalMarks = task.total_marks || 0; // Assuming this might exist or we inferred it? DB schema shows total_marks? Let's check. 
        // Actually schema has total_questions, correct_answers, wrong_answers, skipped_questions, marks_obtained.
        // We don't have total_marks in schema explicitly in the previous read?
        // Let's rely on what we have.

        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Performance Analysis
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onEdit}>
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase">Score</span>
                            <div className="flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-primary" />
                                <span className="text-2xl font-bold">{marks}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase">Accuracy</span>
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-green-500" />
                                <span className="text-2xl font-bold">{accuracy}%</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase">Wrong</span>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span className="text-2xl font-bold">{task.wrong_answers || 0}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase">Skipped</span>
                            <div className="flex items-center gap-2">
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                <span className="text-2xl font-bold">{task.skipped_questions || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Accuracy</span>
                            <span>{accuracy}%</span>
                        </div>
                        <Progress value={accuracy} className="h-2 bg-muted" indicatorClassName={
                            accuracy >= 80 ? "bg-green-500" : accuracy >= 50 ? "bg-yellow-500" : "bg-red-500"
                        } />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isAssignment) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Assignment Result
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onEdit}>
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-8">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase">Grade</span>
                            <div className="text-2xl font-bold">{task.grade || "N/A"}</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase">Status</span>
                            <Badge variant={task.submission_status === 'submitted' ? 'default' : 'secondary'}>
                                {task.submission_status || "Completed"}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isRevision) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Retention Check
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onEdit}>
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Retention Score</span>
                                <span className="text-2xl font-bold">{task.retention_score || 0}%</span>
                            </div>
                            <Progress value={task.retention_score || 0} className="h-2" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isPractice && task.difficulty_level) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Practice Details
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onEdit}>
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase">Difficulty</span>
                        <div className="text-lg font-medium">{task.difficulty_level}</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
}
