import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  FolderKanban,
  Target,
  Settings,
  Trophy,
  Umbrella,
  ClipboardList,
  BookOpen,
  Timer,
  Layers,
  ShieldAlert,
  MessageCircle,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function AppSidebar() {
  const { role } = useAdminAuth();
  const isAdmin = role === "admin";
  const isModerator = role === "moderator";

  return (
    <Sidebar collapsible="icon" className="border-r hidden md:flex">
      <SidebarContent className="pt-2 no-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel>Focus</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <NavLink to="/dashboard" end activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                    <LayoutDashboard className="h-5 w-5 shrink-0" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Tasks">
                  <NavLink to="/tasks" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                    <ClipboardList className="h-5 w-5 shrink-0" />
                    <span>Tasks</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Calendar">
                  <NavLink to="/calendar" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                    <CalendarDays className="h-5 w-5 shrink-0" />
                    <span>Calendar</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Timer">
                  <NavLink to="/timer" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                    <Timer className="h-5 w-5 shrink-0" />
                    <span>Timer</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Journal">
                  <NavLink to="/journal" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                    <BookOpen className="h-5 w-5 shrink-0" />
                    <span>Journal</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Organize</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Goals">
                  <NavLink to="/goals" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                    <Target className="h-5 w-5 shrink-0" />
                    <span>Goals</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Projects">
                  <NavLink to="/projects" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                    <FolderKanban className="h-5 w-5 shrink-0" />
                    <span>Projects</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Hierarchy">
                  <NavLink to="/hierarchy" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                    <Layers className="h-5 w-5 shrink-0" />
                    <span>Hierarchy</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Insights</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Analytics">
                  <NavLink to="/analytics" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                    <BarChart3 className="h-5 w-5 shrink-0" />
                    <span>Analytics</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Badges">
                  <NavLink to="/badges" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                    <Trophy className="h-5 w-5 shrink-0" />
                    <span>Badges</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Holidays">
                  <NavLink to="/holidays" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                    <Umbrella className="h-5 w-5 shrink-0" />
                    <span>Holidays</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(isAdmin || isModerator) && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admin Area">
                    <NavLink to="/admin" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <ShieldAlert className="h-5 w-5 shrink-0" />
                      <span>Admin</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Feedback">
              <NavLink to="/feedback" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                <MessageCircle className="h-5 w-5 shrink-0" />
                <span>Feedback</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <NavLink to="/settings" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                <Settings className="h-5 w-5 shrink-0" />
                <span>Settings</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
