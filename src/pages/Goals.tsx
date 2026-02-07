import { Target } from "lucide-react";

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Goals</h1>
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
        <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Goal management coming in Phase 2</p>
      </div>
    </div>
  );
}
