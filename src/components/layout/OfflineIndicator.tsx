import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-modal bg-warning text-warning-foreground text-center py-1.5 text-xs font-medium flex items-center justify-center gap-1.5 animate-fade-in">
      <WifiOff className="h-3.5 w-3.5" />
      You're offline — changes will sync when connection is restored
    </div>
  );
}
