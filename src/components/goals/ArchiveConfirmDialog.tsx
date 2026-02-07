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

interface ArchiveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
  childCount?: number;
  isPermanentDelete?: boolean;
}

export function ArchiveConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  childCount = 0,
  isPermanentDelete = false,
}: ArchiveConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPermanentDelete ? "Permanently Delete" : "Archive"} "{itemName}"?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPermanentDelete ? (
              <>
                This action cannot be undone. This will permanently delete "
                {itemName}" and all associated data.
              </>
            ) : childCount > 0 ? (
              <>
                This will archive "{itemName}" and{" "}
                <strong>{childCount} child item{childCount !== 1 ? "s" : ""}</strong>.
                Archived items can be restored later.
              </>
            ) : (
              <>
                This will archive "{itemName}". Archived items can be restored
                later.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              isPermanentDelete
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
          >
            {isPermanentDelete ? "Delete Forever" : "Archive"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
