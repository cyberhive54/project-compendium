import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
        <Settings className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Settings page coming in Phase 7</p>
      </div>
    </div>
  );
}
