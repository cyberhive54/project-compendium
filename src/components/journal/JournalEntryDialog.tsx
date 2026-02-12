import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";

interface JournalEntryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: string | null;
    content: string;
}

export function JournalEntryDialog({
    open,
    onOpenChange,
    date,
    content,
}: JournalEntryDialogProps) {
    if (!date) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                        {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                        {content}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
