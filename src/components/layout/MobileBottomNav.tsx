import {
  LayoutDashboard,
  CalendarDays,
  Timer,
  BarChart3,
  User,
} from "lucide-react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Timer", url: "/timer", icon: Timer },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Profile", url: "/settings", icon: User },
];

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-bottom-nav border-t bg-background md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <RouterNavLink
            key={item.title}
            to={item.url}
            end={item.url === "/dashboard"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] min-h-[56px] text-muted-foreground transition-colors",
                isActive && "text-primary"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-tight">{item.title}</span>
          </RouterNavLink>
        ))}
      </div>
    </nav>
  );
}
