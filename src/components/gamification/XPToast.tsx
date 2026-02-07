import { useEffect } from "react";
import { useGamificationStore } from "@/stores/gamificationStore";
import { toast } from "sonner";

export function XPToast() {
  const { lastXPGain, setLastXPGain } = useGamificationStore();

  useEffect(() => {
    if (!lastXPGain) return;

    const { total, breakdown } = lastXPGain;

    toast(
      <div className="space-y-1">
        <p className="font-semibold text-primary">+{total} XP earned! ⚡</p>
        <div className="text-xs text-muted-foreground space-y-0.5">
          {Object.entries(breakdown).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <span>{label}</span>
              <span className="font-medium">+{value}</span>
            </div>
          ))}
        </div>
      </div>,
      { duration: 3000 }
    );

    setLastXPGain(null);
  }, [lastXPGain, setLastXPGain]);

  return null;
}
