import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PRIORITY_PRESETS } from "@/types/database";

interface PrioritySelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  const getColor = (priority: number) => {
    if (priority >= 7500) return "text-destructive border-destructive/30 bg-destructive/5";
    if (priority >= 5000) return "text-warning border-warning/30 bg-warning/5";
    if (priority >= 2500) return "text-primary border-primary/30 bg-primary/5";
    return "text-muted-foreground border-border bg-muted/30";
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {PRIORITY_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            type="button"
            size="sm"
            variant="outline"
            className={cn(
              "flex-1 text-xs h-7",
              value === preset.value && getColor(preset.value)
            )}
            onClick={() => onChange(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={9999}
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (v >= 1 && v <= 9999) onChange(v);
          }}
          className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <span className="text-xs text-muted-foreground whitespace-nowrap">1–9999</span>
      </div>
    </div>
  );
}
