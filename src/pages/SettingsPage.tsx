import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Palette, Timer, Shield, Database, CalendarDays } from "lucide-react";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { PomodoroSettings } from "@/components/settings/PomodoroSettingsPanel";
import { StreakSettings } from "@/components/settings/StreakSettings";
import { StudySessionsSettings } from "@/components/settings/StudySessionsSettings";
import { DataManagement } from "@/components/settings/DataManagement";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="text-xs gap-1">
            <User className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs gap-1">
            <Palette className="h-3.5 w-3.5" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="pomodoro" className="text-xs gap-1">
            <Timer className="h-3.5 w-3.5" /> Pomodoro
          </TabsTrigger>
          <TabsTrigger value="streaks" className="text-xs gap-1">
            <Shield className="h-3.5 w-3.5" /> Streaks
          </TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> Sessions
          </TabsTrigger>
          <TabsTrigger value="data" className="text-xs gap-1">
            <Database className="h-3.5 w-3.5" /> Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile"><ProfileSettings /></TabsContent>
        <TabsContent value="appearance"><AppearanceSettings /></TabsContent>
        <TabsContent value="pomodoro"><PomodoroSettings /></TabsContent>
        <TabsContent value="streaks"><StreakSettings /></TabsContent>
        <TabsContent value="sessions"><StudySessionsSettings /></TabsContent>
        <TabsContent value="data"><DataManagement /></TabsContent>
      </Tabs>
    </div>
  );
}
