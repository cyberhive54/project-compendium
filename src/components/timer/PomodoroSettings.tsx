import { useTimerStore, type PomodoroConfig } from "@/stores/timerStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Settings2 } from "lucide-react";
import { useState } from "react";

export function PomodoroSettings() {
  const { pomodoroConfig, setPomodoroConfig } = useTimerStore();
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<PomodoroConfig>(pomodoroConfig);

  const handleOpen = (v: boolean) => {
    if (v) setLocal(pomodoroConfig);
    setOpen(v);
  };

  const save = () => {
    setPomodoroConfig(local);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Settings2 className="h-4 w-4" />
          Pomodoro Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pomodoro Settings</DialogTitle>
          <DialogDescription>
            Configure your focus and break durations.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <SliderField
            label="Focus Duration"
            value={local.focusDuration}
            min={5}
            max={120}
            step={5}
            unit="min"
            onChange={(v) => setLocal({ ...local, focusDuration: v })}
          />
          <SliderField
            label="Short Break"
            value={local.shortBreak}
            min={1}
            max={30}
            step={1}
            unit="min"
            onChange={(v) => setLocal({ ...local, shortBreak: v })}
          />
          <SliderField
            label="Long Break"
            value={local.longBreak}
            min={5}
            max={60}
            step={5}
            unit="min"
            onChange={(v) => setLocal({ ...local, longBreak: v })}
          />
          <SliderField
            label="Cycles Before Long Break"
            value={local.cyclesBeforeLongBreak}
            min={1}
            max={10}
            step={1}
            unit=""
            onChange={(v) => setLocal({ ...local, cyclesBeforeLongBreak: v })}
          />

          <div className="flex items-center justify-between">
            <Label>Auto-start break</Label>
            <Switch
              checked={local.autoStartBreak}
              onCheckedChange={(v) => setLocal({ ...local, autoStartBreak: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Auto-start focus</Label>
            <Switch
              checked={local.autoStartFocus}
              onCheckedChange={(v) => setLocal({ ...local, autoStartFocus: v })}
            />
          </div>
        </div>
        <Button onClick={save} className="w-full">
          Save Settings
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm font-medium text-primary">
          {value}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}
