import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useTimerStore } from "@/stores/timerStore";

export function PomodoroSettings() {
  const config = useTimerStore((s) => s.pomodoroConfig);
  const setConfig = useTimerStore((s) => s.setPomodoroConfig);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pomodoro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 max-w-md">
        {/* Focus */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Focus Duration</Label>
            <span className="text-sm font-medium">{config.focusDuration} min</span>
          </div>
          <Slider
            value={[config.focusDuration]}
            onValueChange={([v]) => setConfig({ focusDuration: v })}
            min={5}
            max={120}
            step={5}
          />
        </div>

        {/* Short Break */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Short Break</Label>
            <span className="text-sm font-medium">{config.shortBreak} min</span>
          </div>
          <Slider
            value={[config.shortBreak]}
            onValueChange={([v]) => setConfig({ shortBreak: v })}
            min={1}
            max={30}
            step={1}
          />
        </div>

        {/* Long Break */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Long Break</Label>
            <span className="text-sm font-medium">{config.longBreak} min</span>
          </div>
          <Slider
            value={[config.longBreak]}
            onValueChange={([v]) => setConfig({ longBreak: v })}
            min={5}
            max={60}
            step={5}
          />
        </div>

        {/* Cycles */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Cycles Before Long Break</Label>
            <span className="text-sm font-medium">{config.cyclesBeforeLongBreak}</span>
          </div>
          <Slider
            value={[config.cyclesBeforeLongBreak]}
            onValueChange={([v]) => setConfig({ cyclesBeforeLongBreak: v })}
            min={1}
            max={10}
            step={1}
          />
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Auto-start Break</Label>
            <Switch
              checked={config.autoStartBreak}
              onCheckedChange={(v) => setConfig({ autoStartBreak: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Auto-start Focus</Label>
            <Switch
              checked={config.autoStartFocus}
              onCheckedChange={(v) => setConfig({ autoStartFocus: v })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
