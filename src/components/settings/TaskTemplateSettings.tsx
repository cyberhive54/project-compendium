import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { useTaskTemplates, type TaskTemplate } from "@/hooks/useTaskTemplates";
import { TaskTemplateDialog } from "@/components/tasks/TaskTemplateDialog";
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

export function TaskTemplateSettings() {
    const { templates, create, update, remove } = useTaskTemplates();
    const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<TaskTemplate | null>(null);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Task Templates</CardTitle>
                            <CardDescription>
                                Create and manage reusable task templates
                            </CardDescription>
                        </div>
                        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Template
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {templates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                            <FileText className="h-12 w-12 opacity-50" />
                            <div className="text-center">
                                <p className="font-medium">No templates yet</p>
                                <p className="text-sm">Create your first task template to get started</p>
                            </div>
                            <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="gap-2 mt-2">
                                <Plus className="h-4 w-4" />
                                Create Template
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {templates.map((template) => (
                                <div
                                    key={template.template_id}
                                    className="flex flex-col p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div className="space-y-2 flex-1">
                                        <div className="font-medium flex items-center gap-2">
                                            {template.name}
                                            {!template.is_active && (
                                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="capitalize">{template.task_type}</span>
                                                {template.estimated_duration && (
                                                    <span>• {template.estimated_duration} min</span>
                                                )}
                                                {template.recurrence !== "none" && (
                                                    <span>• {template.recurrence}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingTemplate(template)}
                                            className="flex-1"
                                        >
                                            <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteTarget(template)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

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
