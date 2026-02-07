import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface StreakConfig {
  min_minutes: number;
  min_tasks: number;
  require_all_tasks: boolean;
  mode: "any" | "all";
}

export function StreakSettings() {
  const { user } = useAuth();
  const [config, setConfig] = useState<StreakConfig>({
    min_minutes: 30,
    min_tasks: 1,
    require_all_tasks: false,
    mode: "any",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_profiles")
      .select("streak_settings")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.streak_settings) {
          setConfig({ ...config, ...data.streak_settings });
        }
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_profiles")
      .update({ streak_settings: config })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save streak settings");
    } else {
      toast.success("Streak settings saved");
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Streak Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 max-w-md">
        <div className="space-y-2">
          <Label>Mode</Label>
          <Select
            value={config.mode}
            onValueChange={(v) => setConfig({ ...config, mode: v as "any" | "all" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any condition (OR)</SelectItem>
              <SelectItem value="all">All conditions (AND)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {config.mode === "any"
              ? "Streak maintained if ANY condition is met"
              : "Streak maintained only if ALL conditions are met"}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Minimum Study Time (minutes)</Label>
          <Input
            type="number"
            min={1}
            max={480}
            value={config.min_minutes}
            onChange={(e) =>
              setConfig({ ...config, min_minutes: parseInt(e.target.value) || 30 })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Minimum Tasks Completed</Label>
          <Input
            type="number"
            min={1}
            max={50}
            value={config.min_tasks}
            onChange={(e) =>
              setConfig({ ...config, min_tasks: parseInt(e.target.value) || 1 })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Require All Scheduled Tasks</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Must complete every task scheduled for the day
            </p>
          </div>
          <Switch
            checked={config.require_all_tasks}
            onCheckedChange={(v) =>
              setConfig({ ...config, require_all_tasks: v })
            }
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
