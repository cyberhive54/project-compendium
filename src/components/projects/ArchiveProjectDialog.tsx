import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
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
import { Skeleton } from "@/components/ui/skeleton";

interface ArchiveProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  onConfirm: () => void;
}

export function ArchiveProjectDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  onConfirm,
}: ArchiveProjectDialogProps) {
  const { data: counts, isLoading } = useQuery({
    queryKey: ["project-archive-counts", projectId],
    queryFn: async () => {
      const { data: goals } = await supabase
        .from("goals")
        .select("goal_id")
        .eq("project_id", projectId)
        .eq("archived", false);

      const goalCount = goals?.length ?? 0;
      let taskCount = 0;

      if (goalCount > 0) {
        const { count } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .in(
            "goal_id",
            goals!.map((g) => g.goal_id)
          )
          .eq("archived", false);
        taskCount = count ?? 0;
      }

      return { goalCount, taskCount };
    },
    enabled: open && !!projectId,
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Archive Project &ldquo;{projectName}&rdquo;?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="space-y-2">
                <p>
                  This will archive{" "}
                  <strong>
                    {counts?.goalCount ?? 0} goal
                    {counts?.goalCount !== 1 ? "s" : ""}
                  </strong>
                  , along with all their streams, subjects, chapters, topics,
                  and{" "}
                  <strong>
                    {counts?.taskCount ?? 0} task
                    {counts?.taskCount !== 1 ? "s" : ""}
                  </strong>
                  .
                </p>
                <p className="text-xs">
                  You can restore this project and its contents from the
                  Archived Projects section later.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Archive Project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
