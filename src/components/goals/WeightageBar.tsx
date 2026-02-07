import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface WeightageBarProps {
  items: { name: string; weightage: number }[];
  className?: string;
}

export function WeightageBar({ items, className }: WeightageBarProps) {
  const total = items.reduce((sum, item) => sum + Number(item.weightage), 0);
  const isValid = Math.abs(total - 100) <= 0.01;
  const isEmpty = items.length === 0;

  if (isEmpty) return null;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Weightage</span>
        <span
          className={cn(
            "font-medium",
            isValid ? "text-success" : "text-destructive"
          )}
        >
          {total.toFixed(1)}%
          {!isValid && total < 100 && ` (${(100 - total).toFixed(1)}% remaining)`}
          {!isValid && total > 100 && ` (${(total - 100).toFixed(1)}% over)`}
        </span>
      </div>
      <Progress
        value={Math.min(total, 100)}
        className={cn(
          "h-2",
          isValid
            ? "[&>div]:bg-success"
            : total > 100
            ? "[&>div]:bg-destructive"
            : "[&>div]:bg-warning"
        )}
      />
    </div>
  );
}

export function autoBalanceWeightage(
  items: { id: string; weightage: number }[],
  targetTotal = 100
): { id: string; weightage: number }[] {
  if (items.length === 0) return [];
  const evenWeight = Math.round((targetTotal / items.length) * 100) / 100;
  const result = items.map((item) => ({ ...item, weightage: evenWeight }));
  // Adjust last item to account for rounding
  const currentTotal = result.reduce((sum, i) => sum + i.weightage, 0);
  const diff = targetTotal - currentTotal;
  if (result.length > 0) {
    result[result.length - 1].weightage =
      Math.round((result[result.length - 1].weightage + diff) * 100) / 100;
  }
  return result;
}
