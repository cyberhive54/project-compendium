import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ListTodo, Loader2 } from "lucide-react";

interface UserTaskType {
    task_type_id: string;
    user_id: string;
    name: string;
    icon: string;
    default_duration: number | null;
    base_xp: number;
    is_custom: boolean;
    system_behavior: "study" | "practice" | "exam" | "assignment" | "revision";
    created_at: string;
}

const DEFAULT_DEFAULTS = {
    default_duration: 60,
    base_xp: 10,
    icon: "📋",
    system_behavior: "study" as const,
};

export function TaskTypeSettings() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<UserTaskType | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [icon, setIcon] = useState(DEFAULT_DEFAULTS.icon);
    const [defaultDuration, setDefaultDuration] = useState(DEFAULT_DEFAULTS.default_duration);
    const [baseXp, setBaseXp] = useState(DEFAULT_DEFAULTS.base_xp);
    const [systemBehavior, setSystemBehavior] = useState<"study" | "practice" | "exam" | "assignment" | "revision">(DEFAULT_DEFAULTS.system_behavior);

    const { data: taskTypes = [], isLoading } = useQuery({
        queryKey: ["user_task_types", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("user_task_types")
                .select("*")
                .eq("user_id", user.id)
                .order("is_custom", { ascending: true }) // System types first
                .order("name", { ascending: true });

            if (error) throw error;
            return data as UserTaskType[];
        },
        enabled: !!user,
    });

    const upsertMutation = useMutation({
        mutationFn: async (values: Partial<UserTaskType>) => {
            if (!user) throw new Error("No user");

            const payload = {
                user_id: user.id,
                name: values.name,
                icon: values.icon,
                default_duration: values.default_duration,
                base_xp: values.base_xp,
                system_behavior: values.system_behavior,
                is_custom: true, // Always custom if creating/editing from here usually
            };

            if (editingType) {
                // Update
                const { error } = await supabase
                    .from("user_task_types")
                    .update(payload)
                    .eq("task_type_id", editingType.task_type_id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from("user_task_types")
                    .insert(payload);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user_task_types"] });
            toast.success(editingType ? "Task type updated" : "Task type created");
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to save task type");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("user_task_types")
                .delete()
                .eq("task_type_id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user_task_types"] });
            toast.success("Task type deleted");
            setDeleteId(null);
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to delete task type");
        },
    });

    const resetForm = () => {
        setEditingType(null);
        setName("");
        setIcon(DEFAULT_DEFAULTS.icon);
        setDefaultDuration(DEFAULT_DEFAULTS.default_duration);
        setBaseXp(DEFAULT_DEFAULTS.base_xp);
        setSystemBehavior(DEFAULT_DEFAULTS.system_behavior);
    };

    const openCreate = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const openEdit = (type: UserTaskType) => {
        setEditingType(type);
        setName(type.name);
        setIcon(type.icon);
        setDefaultDuration(type.default_duration || 0);
        setBaseXp(type.base_xp);
        setSystemBehavior(type.system_behavior || "study");
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }
        upsertMutation.mutate({
            name: name.trim(),
            icon: icon.trim() || "📋",
            default_duration: defaultDuration,
            base_xp: baseXp,
            system_behavior: systemBehavior,
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ListTodo className="h-5 w-5" />
                            Task Types
                        </CardTitle>
                        <CardDescription>
                            Manage custom task categories, their icons, and default settings.
                        </CardDescription>
                    </div>
                    <Button onClick={openCreate} size="sm">
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add Type
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : taskTypes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No task types found.</p>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {taskTypes.map((type) => (
                            <div
                                key={type.task_type_id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background text-lg">
                                        {type.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium truncate">{type.name}</p>
                                            {!type.is_custom && (
                                                <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                                    System
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {type.default_duration}m • {type.base_xp} XP • {type.system_behavior}
                                        </p>
                                    </div>
                                </div>

                                {/* Only allow editing custom types for now, or maybe allow editing system defaults if desired? 
                    Usually system types are protected. Let's allow editing ALL but only deleting custom. */}
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground"
                                        onClick={() => openEdit(type)}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    {type.is_custom && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteId(type.task_type_id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingType ? "Edit Task Type" : "New Task Type"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Lab Work"
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-1 grid gap-2">
                                <Label htmlFor="icon">Icon</Label>
                                <Input
                                    id="icon"
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    className="text-center text-lg"
                                    maxLength={2}
                                />
                            </div>
                            <div className="col-span-3 grid gap-2">
                                <Label htmlFor="duration">Default Duration (min)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={defaultDuration}
                                    onChange={(e) => setDefaultDuration(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="behavior">System Behavior</Label>
                            <Select
                                value={systemBehavior}
                                onValueChange={(val) => setSystemBehavior(val as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select behavior" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="study">Study (Default)</SelectItem>
                                    <SelectItem value="practice">Practice</SelectItem>
                                    <SelectItem value="exam">Exam/Test</SelectItem>
                                    <SelectItem value="assignment">Assignment</SelectItem>
                                    <SelectItem value="revision">Revision</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Determines how the task completion form behaves.
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="xp">Base XP Reward</Label>
                            <Input
                                id="xp"
                                type="number"
                                value={baseXp}
                                onChange={(e) => setBaseXp(Number(e.target.value))}
                            />
                            <p className="text-xs text-muted-foreground">
                                Points awarded upon completion of this task type.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={upsertMutation.isPending}>
                            {upsertMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task Type?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this task type? Tasks currently using this type will perform correctly, but it won't be available for new tasks.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
