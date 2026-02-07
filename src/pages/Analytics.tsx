import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Analytics dashboard coming in Phase 7</p>
      </div>
    </div>
  );
}
