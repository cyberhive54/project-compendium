import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { useTaskTemplates, type TaskTemplate } from "@/hooks/useTaskTemplates";
import { TaskTemplateDialog } from "./TaskTemplateDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TemplateManagerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TemplateManagerDialog({
    open,
    onOpenChange,
}: TemplateManagerDialogProps) {
    const { templates, create, update, remove } = useTaskTemplates();
    const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<TaskTemplate | null>(null);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-[600px] max-h-[80vh] flex flex-col">
                    <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <DialogTitle>Task Templates</DialogTitle>
                        <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" /> New Template
                        </Button>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden min-h-[300px]">
                        {templates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                                <FileText className="h-8 w-8 opacity-50" />
                                <p>No templates yet.</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-full pr-4">
                                <div className="space-y-3">
                                    {templates.map((template) => (
                                        <div
                                            key={template.template_id}
                                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="space-y-1">
                                                <div className="font-medium flex items-center gap-2">
                                                    {template.name}
                                                    {!template.is_active && (
                                                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex gap-2">
                                                    <span className="capitalize">{template.task_type}</span>
                                                    {template.estimated_duration && (
                                                        <span>• {template.estimated_duration} min</span>
                                                    )}
                                                    {template.recurrence !== "none" && (
                                                        <span>• {template.recurrence}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEditingTemplate(template)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setDeleteTarget(template)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create/Edit Dialog */}
            {(isCreateOpen || editingTemplate) && (
                <TaskTemplateDialog
                    open={isCreateOpen || !!editingTemplate}
                    onOpenChange={(open) => {
                        if (!open) {
                            setIsCreateOpen(false);
                            setEditingTemplate(null);
                        }
                    }}
                    initialData={editingTemplate || undefined}
                    onSubmit={(data) => {
                        if (editingTemplate) {
                            update.mutate({ id: editingTemplate.template_id, ...data });
                        } else {
                            create.mutate(data);
                        }
                    }}
                />
            )}

            {/* Delete Confirmation */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleteTarget) {
                                    remove.mutate(deleteTarget.template_id);
                                    setDeleteTarget(null);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
