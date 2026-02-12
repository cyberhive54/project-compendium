import { useTimerStore } from "@/stores/timerStore";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { PomodoroIndicator } from "@/components/timer/PomodoroIndicator";
import { TimerSessionHistory } from "@/components/timer/TimerSessionHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minimize2, BookOpen, Zap } from "lucide-react";

interface FullscreenTimerModalProps {
    onStop: () => void;
    onMinimize: () => void;
}

export function FullscreenTimerModal({ onStop, onMinimize }: FullscreenTimerModalProps) {
    const {
        taskId,
        taskName,
        isPomodoroMode,
    } = useTimerStore();

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center min-h-screen gap-8 p-4">
            {/* Task Info */}
            <div className="flex items-center gap-2 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-xl font-medium">{taskName}</span>
                {isPomodoroMode && (
                    <Badge variant="secondary" className="gap-1 ml-2">
                        <Zap className="h-3 w-3" /> Pomodoro
                    </Badge>
                )}
            </div>

            {/* Timer */}
            <div className="scale-125 transform transition-all duration-1000">
                <TimerDisplay size="lg" />
            </div>

            {/* Pomodoro Indicator */}
            <PomodoroIndicator />

            {/* Controls */}
            <div className="flex flex-col items-center gap-4">
                <TimerControls onStop={onStop} size="lg" />

                {/* Minimize button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMinimize}
                    className="gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Minimize2 className="h-4 w-4" />
                    Minimize
                </Button>
            </div>

            {/* Session History */}
            {taskId && (
                <Card className="w-full max-w-md mt-4 bg-card/50 backdrop-blur-sm border-primary/10">
                    <CardContent className="pt-4">
                        <TimerSessionHistory taskId={taskId} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
