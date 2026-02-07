import { Timer } from "lucide-react";

export default function TimerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Timer</h1>
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
        <Timer className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Study timer coming in Phase 4</p>
      </div>
    </div>
  );
}
