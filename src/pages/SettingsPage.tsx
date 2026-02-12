import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  User, Palette, Timer, Shield, Database,
  CalendarDays, ListTodo, FileInput, FileClock,
  ChevronRight,
} from "lucide-react";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { PomodoroSettings } from "@/components/settings/PomodoroSettingsPanel";
import { StreakSettings } from "@/components/settings/StreakSettings";
import { StudySessionsSettings } from "@/components/settings/StudySessionsSettings";
import { DataManagement } from "@/components/settings/DataManagement";
import { TaskTypeSettings } from "@/components/settings/TaskTypeSettings";
import { SyllabusImportSettings } from "@/components/settings/SyllabusImportSettings";
import { TaskTemplateSettings } from "@/components/settings/TaskTemplateSettings";

const sections = [
  {
    group: "Account",
    items: [
      { id: "profile", label: "Profile", icon: User, description: "Username, avatar, password" },
      { id: "appearance", label: "Appearance", icon: Palette, description: "Theme & display" },
    ],
  },
  {
    group: "Study",
    items: [
      { id: "pomodoro", label: "Pomodoro", icon: Timer, description: "Focus & break durations" },
      { id: "streaks", label: "Streaks", icon: Shield, description: "Streak conditions" },
      { id: "sessions", label: "Sessions", icon: CalendarDays, description: "Study time windows" },
      { id: "tasktypes", label: "Task Types", icon: ListTodo, description: "Custom task categories" },
    ],
  },
  {
    group: "Data",
    items: [
      { id: "import", label: "Import", icon: FileInput, description: "Syllabus import" },
      { id: "templates", label: "Templates", icon: FileClock, description: "Recurring templates" },
      { id: "data", label: "Backup", icon: Database, description: "Export & restore" },
    ],
  },
];

const sectionComponents: Record<string, React.FC> = {
  profile: ProfileSettings,
  appearance: AppearanceSettings,
  pomodoro: PomodoroSettings,
  streaks: StreakSettings,
  sessions: StudySessionsSettings,
  tasktypes: TaskTypeSettings,
  import: SyllabusImportSettings,
  templates: TaskTemplateSettings,
  data: DataManagement,
};

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [mobileNavOpen, setMobileNavOpen] = useState(true);

  const ActiveComponent = sectionComponents[activeSection];
  const activeItem = sections.flatMap((s) => s.items).find((i) => i.id === activeSection);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, study preferences, and data
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <nav className="lg:w-64 shrink-0">
          {/* Mobile: Collapsible button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden flex items-center justify-between w-full px-4 py-3 rounded-lg border bg-card text-card-foreground mb-2"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              {activeItem && <activeItem.icon className="h-4 w-4 text-primary" />}
              {activeItem?.label}
            </div>
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                mobileNavOpen && "rotate-90"
              )}
            />
          </button>

          {/* Nav items */}
          <div
            className={cn(
              "space-y-6 lg:block",
              mobileNavOpen ? "block" : "hidden"
            )}
          >
            {sections.map((section) => (
              <div key={section.group}>
                <h3 className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.group}
                </h3>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setMobileNavOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-all duration-150",
                          isActive
                            ? "bg-primary/10 text-primary font-medium shadow-sm border border-primary/20"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        <div className="min-w-0">
                          <div className="text-sm">{item.label}</div>
                          <div className={cn(
                            "text-[11px] truncate",
                            isActive ? "text-primary/70" : "text-muted-foreground/70"
                          )}>
                            {item.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
}
