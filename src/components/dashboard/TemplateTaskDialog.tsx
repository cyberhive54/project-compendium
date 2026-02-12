import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, Repeat, LayoutTemplate } from "lucide-react";
import type { TaskTemplate } from "@/hooks/useTaskTemplates";

interface TemplateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: TaskTemplate | null;
    onSubmit: (name: string, description: string) => void;
    isSubmitting?: boolean;
}

export function TemplateTaskDialog({
    open,
    onOpenChange,
    template,
    onSubmit,
    isSubmitting = false,
}: TemplateTaskDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit(name.trim(), description.trim());
        setName("");
        setDescription("");
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setName("");
            setDescription("");
        }
        onOpenChange(open);
    };

    if (!template) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LayoutTemplate className="h-4 w-4 text-violet-500" />
                        Create Task from Template
                    </DialogTitle>
                    <DialogDescription>
                        Enter a name for the new task. Other details are pre-filled from the template.
                    </DialogDescription>
                </DialogHeader>

                {/* Template info */}
                <div className="rounded-lg border bg-muted/50 p-3 space-y-1.5">
                    <p className="text-sm font-medium">{template.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] capitalize">
                            {template.task_type}
                        </Badge>
                        {template.estimated_duration && (
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                <Clock className="h-2.5 w-2.5" />
                                {template.estimated_duration}m
                            </span>
                        )}
                        {template.recurrence && (
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                <Repeat className="h-2.5 w-2.5" />
                                {template.recurrence}
                            </span>
                        )}
                        {template.scheduled_time_slot && (
                            <Badge variant="secondary" className="text-[10px]">
                                {template.scheduled_time_slot}
                            </Badge>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="task-name">Task Name *</Label>
                        <Input
                            id="task-name"
                            placeholder="Enter task name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="task-desc">Description (optional)</Label>
                        <Textarea
                            id="task-desc"
                            placeholder="Add a description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!name.trim() || isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Task"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
