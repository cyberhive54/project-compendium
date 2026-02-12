import { useState } from "react";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface PostponeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPostpone: (date: Date) => void;
    currentDate?: Date;
    isSubmitting?: boolean;
}

export function PostponeDialog({
    open,
    onOpenChange,
    onPostpone,
    currentDate,
    isSubmitting = false,
}: PostponeDialogProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        currentDate ? addDays(currentDate, 1) : addDays(new Date(), 1)
    );

    const handlePostpone = () => {
        if (selectedDate) {
            onPostpone(selectedDate);
        }
    };

    const quickOptions = [
        { label: "Tomorrow", date: addDays(new Date(), 1) },
        { label: "In 2 Days", date: addDays(new Date(), 2) },
        { label: "Next Week", date: addDays(new Date(), 7) },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Postpone Task</DialogTitle>
                    <DialogDescription>
                        Choose a new date for this task.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <div className="flex gap-2">
                        {quickOptions.map((opt) => (
                            <Button
                                key={opt.label}
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={() => setSelectedDate(opt.date)}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>

                    <div className="border rounded-md p-3 mx-auto">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePostpone}
                        disabled={!selectedDate || isSubmitting}
                        className="w-full sm:w-auto"
                    >
                        {isSubmitting ? "Saving..." : (
                            <>
                                Postpone to {selectedDate ? format(selectedDate, "MMM d") : "..."}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
