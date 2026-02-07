import { CalendarDays } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Calendar</h1>
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
        <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Calendar views coming in Phase 6</p>
      </div>
    </div>
  );
}
