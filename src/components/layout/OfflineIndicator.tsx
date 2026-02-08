import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [justWentOffline, setJustWentOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustWentOffline(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setJustWentOffline(true);
      // Remove the pulse after a few seconds
      setTimeout(() => setJustWentOffline(false), 3000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            "fixed top-3 right-3 z-50 p-2 rounded-full bg-warning/15 text-warning hover:bg-warning/25 transition-colors",
            justWentOffline && "animate-pulse"
          )}
          aria-label="Offline indicator"
        >
          <WifiOff className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[220px] text-center">
        <p className="text-xs">You're offline — changes will sync when connection is restored</p>
      </TooltipContent>
    </Tooltip>
  );
}
