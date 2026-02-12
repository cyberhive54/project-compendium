import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BadgeLevelEditor } from "./BadgeLevelEditor";
import type { BadgeDefinition, BadgeLevel } from "@/hooks/useBadges";

const badgeSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    icon: z.string().min(1, "Icon is required"), // Emojis are fine
    category: z.enum(["streak", "time", "task", "exam", "subject", "milestone"]),
    tier: z.enum(["bronze", "silver", "gold", "platinum"]),
    xp_reward: z.coerce.number().min(0),
    is_default: z.boolean().default(false),
    // Condition is JSON string
    unlock_condition_json: z.string().min(2, "Invalid JSON"),
});

interface BadgeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: BadgeDefinition;
    onSubmit: (data: any) => void;
}

export function BadgeFormDialog({
    open,
    onOpenChange,
    initialData,
    onSubmit,
}: BadgeFormDialogProps) {
    const [levels, setLevels] = useState<BadgeLevel[]>([]);

    const form = useForm<z.infer<typeof badgeSchema>>({
        resolver: zodResolver(badgeSchema),
        defaultValues: {
            name: "",
            description: "",
            icon: "🏅",
            category: "task",
            tier: "bronze",
            xp_reward: 100,
            is_default: false,
            unlock_condition_json: JSON.stringify({}, null, 2),
        },
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    name: initialData.name,
                    description: initialData.description,
                    icon: initialData.icon,
                    category: initialData.category as any,
                    tier: initialData.tier as any,
                    xp_reward: initialData.xp_reward,
                    is_default: initialData.is_default ?? false,
                    unlock_condition_json: JSON.stringify(initialData.unlock_condition, null, 2),
                });
                setLevels(initialData.levels ?? []);
            } else {
                form.reset({
                    name: "",
                    description: "",
                    icon: "🏅",
                    category: "task",
                    tier: "bronze",
                    xp_reward: 100,
                    is_default: false,
                    unlock_condition_json: JSON.stringify({}, null, 2),
                });
                setLevels([]);
            }
        }
    }, [open, initialData, form]);

    const handleSubmit = (values: z.infer<typeof badgeSchema>) => {
        try {
            const unlock_condition = JSON.parse(values.unlock_condition_json);
            onSubmit({
                ...values,
                unlock_condition,
                levels,
            });
            onOpenChange(false);
        } catch (e) {
            form.setError("unlock_condition_json", {
                message: "Invalid JSON format",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Edit Badge" : "Create Badge"}
                    </DialogTitle>
                    <DialogDescription>
                        Configure badge details, unlock conditions, and levels.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="icon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Icon (Emoji)</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="streak">Streak</SelectItem>
                                                <SelectItem value="time">Time</SelectItem>
                                                <SelectItem value="task">Task</SelectItem>
                                                <SelectItem value="exam">Exam</SelectItem>
                                                <SelectItem value="subject">Subject</SelectItem>
                                                <SelectItem value="milestone">Milestone</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tier</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select tier" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="bronze">Bronze</SelectItem>
                                                <SelectItem value="silver">Silver</SelectItem>
                                                <SelectItem value="gold">Gold</SelectItem>
                                                <SelectItem value="platinum">Platinum</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 items-end">
                            <FormField
                                control={form.control}
                                name="xp_reward"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>XP Reward (Base)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="is_default"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Default</FormLabel>
                                            <FormDescription className="text-xs">
                                                Granted to new users?
                                            </FormDescription>
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

                        <FormField
                            control={form.control}
                            name="unlock_condition_json"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Unlock Condition (JSON)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            className="font-mono text-xs h-[100px]"
                                            placeholder='{ "type": "total_study_time", "threshold": 60 }'
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Raw JSON logic defining how this badge is unlocked.
                                    </FormDescription>
                                    <FormMessage />

                                    <div className="mt-2 text-xs border rounded-md p-3 bg-muted/50 space-y-2">
                                        <p className="font-semibold text-muted-foreground">Common Examples (Click to copy)</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const val = `{\n  "type": "streak",\n  "days": 7\n}`;
                                                    form.setValue("unlock_condition_json", val);
                                                }}
                                                className="text-left p-2 border rounded hover:bg-background transition-colors"
                                            >
                                                <div className="font-medium">🔥 Streak</div>
                                                <div className="text-[10px] text-muted-foreground font-mono">"type": "streak"</div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const val = `{\n  "type": "tasks_completed",\n  "count": 100\n}`;
                                                    form.setValue("unlock_condition_json", val);
                                                }}
                                                className="text-left p-2 border rounded hover:bg-background transition-colors"
                                            >
                                                <div className="font-medium">✅ Task Count</div>
                                                <div className="text-[10px] text-muted-foreground font-mono">"type": "tasks_completed"</div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const val = `{\n  "type": "total_time",\n  "hours": 50\n}`;
                                                    form.setValue("unlock_condition_json", val);
                                                }}
                                                className="text-left p-2 border rounded hover:bg-background transition-colors"
                                            >
                                                <div className="font-medium">⏱️ Study Time</div>
                                                <div className="text-[10px] text-muted-foreground font-mono">"type": "total_time"</div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const val = `{\n  "type": "exam_accuracy",\n  "percentage": 90\n}`;
                                                    form.setValue("unlock_condition_json", val);
                                                }}
                                                className="text-left p-2 border rounded hover:bg-background transition-colors"
                                            >
                                                <div className="font-medium">🏆 Exam Score</div>
                                                <div className="text-[10px] text-muted-foreground font-mono">"type": "exam_accuracy"</div>
                                            </button>
                                        </div>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <BadgeLevelEditor levels={levels} onChange={setLevels} />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {initialData ? "Update Badge" : "Create Badge"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
