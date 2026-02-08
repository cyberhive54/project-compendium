import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GoalFormDialog } from "@/components/goals/GoalFormDialog";
import { useGoals } from "@/hooks/useGoals";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Target, Loader2 } from "lucide-react";
import type { Goal } from "@/types/database";

interface AddGoalToProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onCreateGoal: (values: Record<string, any>) => void;
}

export function AddGoalToProjectDialog({
  open,
  onOpenChange,
  projectId,
  onCreateGoal,
}: AddGoalToProjectDialogProps) {
  const { data: allGoals = [] } = useGoals();
  const qc = useQueryClient();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [tab, setTab] = useState("create");

  const unassignedGoals = useMemo(
    () => allGoals.filter((g) => !g.project_id),
    [allGoals]
  );

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleAssign = async () => {
    if (!selectedGoals.length) return;
    setAssigning(true);

    const { error } = await supabase
      .from("goals")
      .update({ project_id: projectId })
      .in("goal_id", selectedGoals);

    setAssigning(false);

    if (error) {
      toast.error("Failed to assign goals");
    } else {
      toast.success(`${selectedGoals.length} goal(s) added to project`);
      setSelectedGoals([]);
      qc.invalidateQueries({ queryKey: ["goals"] });
      onOpenChange(false);
    }
  };

  // For the "Create New" tab, we use GoalFormDialog's form content inline
  // But since GoalFormDialog is already a dialog, we'll render it separately
  if (tab === "create" && open) {
    return (
      <GoalFormDialog
        open={open}
        onOpenChange={(v) => {
          if (!v) setTab("create");
          onOpenChange(v);
        }}
        onSubmit={onCreateGoal}
        presetProjectId={projectId}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Goal to Project</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="create" className="flex-1 gap-1">
              <Plus className="h-3.5 w-3.5" /> Create New
            </TabsTrigger>
            <TabsTrigger value="existing" className="flex-1 gap-1">
              <Target className="h-3.5 w-3.5" /> Add Existing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="mt-4 space-y-3">
            {unassignedGoals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  All goals are assigned to projects
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => setTab("create")}
                >
                  Create a new goal instead
                </Button>
              </div>
            ) : (
              <>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {unassignedGoals.map((goal) => (
                    <label
                      key={goal.goal_id}
                      className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedGoals.includes(goal.goal_id)}
                        onCheckedChange={() => toggleGoal(goal.goal_id)}
                      />
                      <span className="text-lg">{goal.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{goal.name}</p>
                        {goal.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                <Button
                  className="w-full"
                  disabled={selectedGoals.length === 0 || assigning}
                  onClick={handleAssign}
                >
                  {assigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add {selectedGoals.length > 0 ? `${selectedGoals.length} ` : ""}Goal
                  {selectedGoals.length !== 1 ? "s" : ""} to Project
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
