import { useState, useMemo } from "react";
import { format } from "date-fns";
import { LayoutTemplate, Plus, Clock, Repeat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaskTemplates, type TaskTemplate } from "@/hooks/useTaskTemplates";
import { useTasks } from "@/hooks/useTasks";
import { TemplateTaskDialog } from "./TemplateTaskDialog";
import { toast } from "sonner";

export function DashboardTemplates() {
    const { templates, isLoading } = useTaskTemplates();
    const { create } = useTasks();
    const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

    // Filter templates scheduled for today
    const todayTemplates = useMemo(() => {
        const today = new Date();
        const todayStr = format(today, "yyyy-MM-dd");

        return templates.filter((t) => {
            if (!t.is_active) return false;
            if (t.schedule_start && t.schedule_start > todayStr) return false;
            if (t.schedule_end && t.schedule_end < todayStr) return false;
            if (t.recurrence === "daily") return true;
            if (t.recurrence === "weekday") return today.getDay() >= 1 && today.getDay() <= 5;
            if (t.recurrence === "weekly") return true;
            return true;
        });
    }, [templates]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <LayoutTemplate className="h-4 w-4 text-violet-500" />
                        Templates
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-12" />
                </CardContent>
            </Card>
        );
    }

    if (!todayTemplates.length) return null;

    const handleSubmit = async (name: string, description: string) => {
        if (!selectedTemplate) return;
        try {
            const today = format(new Date(), "yyyy-MM-dd");
            await create.mutateAsync({
                name,
                description: description || undefined,
                goal_id: selectedTemplate.goal_id!,
                subject_id: selectedTemplate.subject_id,
                chapter_id: selectedTemplate.chapter_id,
                topic_id: selectedTemplate.topic_id,
                task_type: selectedTemplate.task_type as any,
                priority_number: selectedTemplate.priority_number,
                estimated_duration: selectedTemplate.estimated_duration,
                scheduled_date: today,
                scheduled_time_slot: selectedTemplate.scheduled_time_slot,
                preferred_session_id: selectedTemplate.preferred_session_id,
                status: "scheduled" as any,
            });
            toast.success(`Task "${name}" created for today`);
            setSelectedTemplate(null);
        } catch (err: any) {
            toast.error(err.message || "Failed to create task");
        }
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <LayoutTemplate className="h-4 w-4 text-violet-500" />
                    Templates
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                        {todayTemplates.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
                {todayTemplates.map((t) => (
                    <div
                        key={t.template_id}
                        className="flex items-center gap-2 p-2 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{t.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted-foreground capitalize">{t.task_type}</span>
                                {t.estimated_duration && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                        <Clock className="h-2.5 w-2.5" />
                                        {t.estimated_duration}m
                                    </span>
                                )}
                                {t.recurrence && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                        <Repeat className="h-2.5 w-2.5" />
                                        {t.recurrence}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1 shrink-0"
                            onClick={() => setSelectedTemplate(t)}
                        >
                            <Plus className="h-3 w-3" />
                            Add
                        </Button>
                    </div>
                ))}
            </CardContent>

            <TemplateTaskDialog
                open={!!selectedTemplate}
                onOpenChange={(open) => !open && setSelectedTemplate(null)}
                template={selectedTemplate}
                onSubmit={handleSubmit}
                isSubmitting={create.isPending}
            />
        </Card>
    );
}
