import { useState } from "react";
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

export type HierarchyLevel = "stream" | "subject" | "chapter" | "topic";

const schemas: Record<HierarchyLevel, z.ZodObject<any>> = {
  stream: z.object({
    name: z.string().trim().min(1, "Name is required").max(100),
    weightage: z.coerce.number().min(0).max(100).default(0),
    color: z.string().optional(),
  }),
  subject: z.object({
    name: z.string().trim().min(1, "Name is required").max(100),
    weightage: z.coerce.number().min(0).max(100).default(0),
    color: z.string().optional(),
    icon: z.string().default("📖"),
  }),
  chapter: z.object({
    name: z.string().trim().min(1, "Name is required").max(200),
    chapter_number: z.coerce.number().int().positive().optional(),
    weightage: z.coerce.number().min(0).max(100).default(0),
    description: z.string().max(500).optional(),
    estimated_hours: z.coerce.number().min(0).optional(),
  }),
  topic: z.object({
    name: z.string().trim().min(1, "Name is required").max(200),
    weightage: z.coerce.number().min(0).max(100).default(0),
    difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
    notes: z.string().max(1000).optional(),
  }),
};

const labels: Record<HierarchyLevel, string> = {
  stream: "Stream",
  subject: "Subject",
  chapter: "Chapter",
  topic: "Topic",
};

interface HierarchyItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: HierarchyLevel;
  onSubmit: (values: Record<string, any>) => void;
  defaultValues?: Record<string, any>;
  isEditing?: boolean;
  currentWeightageTotal?: number;
}

export function HierarchyItemForm({
  open,
  onOpenChange,
  level,
  onSubmit,
  defaultValues,
  isEditing = false,
  currentWeightageTotal = 0,
}: HierarchyItemFormProps) {
  const schema = schemas[level];

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      name: "",
      weightage: 0,
      difficulty: "medium",
    },
  });

  const handleSubmit = (values: Record<string, any>) => {
    onSubmit(values);
    form.reset();
    onOpenChange(false);
  };

  const suggestedWeightage = Math.max(0, 100 - currentWeightageTotal);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit ${labels[level]}` : `Add ${labels[level]}`}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`${labels[level]} name`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weightage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Weightage %{" "}
                    {!isEditing && suggestedWeightage > 0 && (
                      <span className="text-muted-foreground font-normal">
                        ({suggestedWeightage.toFixed(1)}% remaining)
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {level === "chapter" && (
              <>
                <FormField
                  control={form.control}
                  name="chapter_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chapter Number (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estimated_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Hours (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" min="0" {...field} />
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
                        <Textarea className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {level === "topic" && (
              <>
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
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
                          <SelectItem value="easy">🟢 Easy</SelectItem>
                          <SelectItem value="medium">🟡 Medium</SelectItem>
                          <SelectItem value="hard">🔴 Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {(level === "subject" || level === "stream") && (
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color (optional)</FormLabel>
                    <FormControl>
                      <Input type="color" className="h-10 cursor-pointer" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Save" : "Add"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
