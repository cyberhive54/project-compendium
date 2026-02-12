import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { BadgeLevel } from "@/hooks/useBadges";

interface BadgeLevelEditorProps {
    levels: BadgeLevel[];
    onChange: (levels: BadgeLevel[]) => void;
}

export function BadgeLevelEditor({ levels, onChange }: BadgeLevelEditorProps) {
    const addLevel = () => {
        const nextLevel = levels.length + 1;
        onChange([
            ...levels,
            { level: nextLevel, threshold: 0, count: 0, xp_reward: 0 },
        ]);
    };

    const updateLevel = (index: number, field: keyof BadgeLevel, value: number) => {
        const newLevels = [...levels];
        newLevels[index] = { ...newLevels[index], [field]: value };
        onChange(newLevels);
    };

    const removeLevel = (index: number) => {
        onChange(levels.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Badge Levels</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLevel}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" /> Add Level
                </Button>
            </div>

            <div className="space-y-3">
                {levels.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">
                        No levels defined. Badge will use base configuration.
                    </div>
                ) : (
                    levels.map((level, index) => (
                        <div
                            key={index}
                            className="grid gap-4 sm:grid-cols-4 items-end border p-3 rounded-md bg-muted/20"
                        >
                            <div className="space-y-1">
                                <Label className="text-xs">Level</Label>
                                <div className="flex items-center h-9 px-3 rounded-md border bg-background text-sm">
                                    {level.level}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Threshold (≥)</Label>
                                <Input
                                    type="number"
                                    value={level.threshold}
                                    onChange={(e) =>
                                        updateLevel(index, "threshold", parseInt(e.target.value) || 0)
                                    }
                                />
                            </div>
                            {/* Count is optional depending on badge logic but let's include it */}
                            <div className="space-y-1">
                                <Label className="text-xs">Count/Val</Label>
                                <Input
                                    type="number"
                                    value={level.count}
                                    onChange={(e) =>
                                        updateLevel(index, "count", parseInt(e.target.value) || 0)
                                    }
                                />
                            </div>
                            <div className="space-y-1 relative">
                                <Label className="text-xs">XP Reward</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={level.xp_reward}
                                        onChange={(e) =>
                                            updateLevel(index, "xp_reward", parseInt(e.target.value) || 0)
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => removeLevel(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <p className="text-xs text-muted-foreground">
                Define criteria for each level. The system will auto-assign the highest achieved level.
            </p>
        </div>
    );
}
