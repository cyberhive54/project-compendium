import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GOAL_TYPES } from "@/types/database";
import { useProjects } from "@/hooks/useProjects";
import type { Goal } from "@/types/database";

const goalSchema = z.object({
  project_id: z.string().default("__none__"),
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  goal_type: z.enum(["board", "competitive", "semester", "custom"]),
  target_date: z.string().optional(),
  color: z.string().default("#10B981"),
  icon: z.string().default("🎯"),
});

type GoalFormValues = z.infer<typeof goalSchema>;

interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Record<string, any>) => void;
  defaultValues?: Partial<Goal>;
  isEditing?: boolean;
  presetProjectId?: string | null;
}

export function GoalFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing = false,
  presetProjectId,
}: GoalFormDialogProps) {
  const { data: projects = [] } = useProjects();

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      project_id: defaultValues?.project_id ?? presetProjectId ?? "__none__",
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      goal_type: defaultValues?.goal_type ?? "custom",
      target_date: defaultValues?.target_date ?? "",
      color: defaultValues?.color ?? "#10B981",
      icon: defaultValues?.icon ?? "🎯",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        project_id:
          defaultValues?.project_id ?? presetProjectId ?? "__none__",
        name: defaultValues?.name ?? "",
        description: defaultValues?.description ?? "",
        goal_type: defaultValues?.goal_type ?? "custom",
        target_date: defaultValues?.target_date ?? "",
        color: defaultValues?.color ?? "#10B981",
        icon: defaultValues?.icon ?? "🎯",
      });
    }
  }, [open]);

  const handleSubmit = (values: GoalFormValues) => {
    const { project_id, ...rest } = values;
    onSubmit({
      ...rest,
      project_id: project_id === "__none__" ? null : project_id,
      target_date: rest.target_date || null,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Goal" : "Create New Goal"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Project selector */}
            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project (optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="No Project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">No Project</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.project_id} value={p.project_id}>
                          {p.icon} {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., JEE Advanced 2025"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goal_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GOAL_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of this goal..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input
                        type="color"
                        className="h-10 cursor-pointer"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input placeholder="🎯" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Save" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
