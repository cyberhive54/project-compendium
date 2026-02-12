import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Zap } from "lucide-react";

interface TimerModeSelectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (mode: "focus" | "pomodoro") => void;
}

export function TimerModeSelectDialog({
    open,
    onOpenChange,
    onSelect,
}: TimerModeSelectDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Start Timer</DialogTitle>
                    <DialogDescription>
                        Choose how you want to track your time.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <Button
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5"
                        onClick={() => onSelect("focus")}
                    >
                        <Clock className="h-8 w-8 text-primary" />
                        <span className="font-semibold">Focus Timer</span>
                        <span className="text-xs text-muted-foreground font-normal">
                            Stopwatch style
                        </span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:bg-orange-500/5"
                        onClick={() => onSelect("pomodoro")}
                    >
                        <Zap className="h-8 w-8 text-orange-500" />
                        <span className="font-semibold">Pomodoro</span>
                        <span className="text-xs text-muted-foreground font-normal">
                            25m Work / 5m Break
                        </span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
