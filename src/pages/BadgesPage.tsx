import { useBadges } from "@/hooks/useBadges";
import { useHolidays } from "@/hooks/useHolidays";
import { useAuth } from "@/hooks/useAuth";
import { BadgeCard } from "@/components/gamification/BadgeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Award, Calendar, Plus, Trash2, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";

const BADGE_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "streak", label: "🔥 Streak" },
  { value: "time", label: "⏱️ Time" },
  { value: "task", label: "✅ Tasks" },
  { value: "exam", label: "🏆 Exams" },
  { value: "milestone", label: "🎯 Milestones" },
];

const HOLIDAY_TYPES = [
  "Holiday",
  "Festival",
  "Sick Day",
  "Family Event",
  "Travel",
  "Mental Health",
  "Other",
];

export default function BadgesPage() {
  const { profile } = useAuth();
  const { allBadges, earnedBadgeIds, earnedMap, isLoading } = useBadges();
  const { holidays, create: createHoliday, remove: removeHoliday } = useHolidays();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayType, setHolidayType] = useState("Holiday");
  const [holidayReason, setHolidayReason] = useState("");

  const filteredBadges =
    categoryFilter === "all"
      ? allBadges
      : allBadges.filter((b) => b.category === categoryFilter);

  const earnedCount = allBadges.filter((b) => earnedBadgeIds.has(b.badge_id)).length;
  const totalCount = allBadges.length;

  const handleCreateHoliday = async () => {
    if (!holidayDate) {
      toast.error("Please select a date");
      return;
    }
    try {
      await createHoliday.mutateAsync({
        date: holidayDate,
        holiday_type: holidayType,
        reason: holidayReason || undefined,
      });
      toast.success("Holiday added! Your streak will be preserved.");
      setHolidayDate("");
      setHolidayReason("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add holiday";
      toast.error(message);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
      await removeHoliday.mutateAsync(id);
      toast.success("Holiday removed");
    } catch {
      toast.error("Failed to remove holiday");
    }
  };

  // Min date: 7 days ago. Max: future is fine for planned holidays
  const minDate = format(subDays(new Date(), 7), "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Achievements
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {earnedCount} / {totalCount} badges earned · Level{" "}
            {profile?.current_level ?? 1} · {profile?.total_xp ?? 0} XP
          </p>
        </div>
      </div>

      <Tabs defaultValue="badges">
        <TabsList>
          <TabsTrigger value="badges" className="gap-1.5">
            <Award className="h-4 w-4" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="holidays" className="gap-1.5">
            <Calendar className="h-4 w-4" />
            Holidays
          </TabsTrigger>
        </TabsList>

        {/* ─── Badges Tab ─── */}
        <TabsContent value="badges" className="space-y-4">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            {BADGE_CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={categoryFilter === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">
                {totalCount > 0
                  ? Math.round((earnedCount / totalCount) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{
                  width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Badge grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-xl" />
              ))}
            </div>
          ) : filteredBadges.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No badges in this category yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Earned first, then locked */}
              {[...filteredBadges]
                .sort((a, b) => {
                  const aEarned = earnedBadgeIds.has(a.badge_id) ? 0 : 1;
                  const bEarned = earnedBadgeIds.has(b.badge_id) ? 0 : 1;
                  return aEarned - bEarned;
                })
                .map((badge) => (
                  <BadgeCard
                    key={badge.badge_id}
                    badge={badge}
                    earned={earnedBadgeIds.has(badge.badge_id)}
                    unlockedAt={earnedMap.get(badge.badge_id)}
                  />
                ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Holidays Tab ─── */}
        <TabsContent value="holidays" className="space-y-4">
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <h3 className="font-semibold">Add Holiday</h3>
            <p className="text-sm text-muted-foreground">
              Mark a day as a holiday to preserve your streak. You can mark
              holidays up to 7 days in the past.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  min={minDate}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={holidayType} onValueChange={setHolidayType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOLIDAY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Reason (optional)</Label>
                <Input
                  placeholder="Why are you taking off?"
                  value={holidayReason}
                  onChange={(e) => setHolidayReason(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleCreateHoliday}
              disabled={createHoliday.isPending}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Holiday
            </Button>
          </div>

          {/* Holidays list */}
          <div className="rounded-lg border bg-card">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Your Holidays</h3>
            </div>

            {!holidays || holidays.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No holidays marked yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {holidays.map((h) => (
                  <div
                    key={h.holiday_id}
                    className="flex items-center justify-between p-3 px-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🏖️</span>
                      <div>
                        <p className="font-medium text-sm">
                          {format(new Date(h.date), "EEEE, MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {h.holiday_type}
                          {h.reason ? ` — ${h.reason}` : ""}
                        </p>
                      </div>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Holiday?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Removing this holiday may affect your streak
                            calculation.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteHoliday(h.holiday_id)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
