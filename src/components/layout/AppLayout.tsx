import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { FloatingTimer } from "@/components/timer/FloatingTimer";
import { useTimerEngine } from "@/hooks/useTimerEngine";

export function AppLayout() {
  // Run timer background engine (12h auto-pause, pomodoro phase transitions, notifications)
  useTimerEngine();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <AppHeader />
          <main className="flex-1 overflow-auto pb-20 md:pb-0">
            <div className="container py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <MobileBottomNav />
      <FloatingTimer />
    </SidebarProvider>
  );
}
