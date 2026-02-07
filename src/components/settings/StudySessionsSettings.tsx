import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Clock } from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import type { StudySessionConfig } from "@/types/database";

const DEFAULT_COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4"];
const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

interface SessionForm {
  name: string;
  start_time: string;
  end_time: string;
  is_overnight: boolean;
  days_of_week: number[];
  color: string;
  is_active: boolean;
}

const emptyForm: SessionForm = {
  name: "",
  start_time: "09:00",
  end_time: "12:00",
  is_overnight: false,
  days_of_week: [1, 2, 3, 4, 5],
  color: "#3B82F6",
  is_active: true,
};

export function StudySessionsSettings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SessionForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["study-sessions-config", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_sessions_config")
        .select("*")
        .eq("user_id", user!.id)
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data as StudySessionConfig[];
    },
    enabled: !!user,
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, color: DEFAULT_COLORS[sessions.length % DEFAULT_COLORS.length] });
    setDialogOpen(true);
  };

  const openEdit = (session: StudySessionConfig) => {
    setEditingId(session.session_config_id);
    setForm({
      name: session.name,
      start_time: session.start_time.slice(0, 5),
      end_time: session.end_time.slice(0, 5),
      is_overnight: session.is_overnight,
      days_of_week: session.days_of_week ?? [],
      color: session.color,
      is_active: session.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !form.name.trim()) {
      toast.error("Session name is required");
      return;
    }

    setSaving(true);
    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      start_time: form.start_time + ":00",
      end_time: form.end_time + ":00",
      is_overnight: form.is_overnight,
      days_of_week: form.days_of_week,
      color: form.color,
      is_active: form.is_active,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase
        .from("study_sessions_config")
        .update(payload)
        .eq("session_config_id", editingId));
    } else {
      ({ error } = await supabase.from("study_sessions_config").insert(payload));
    }

    if (error) {
      toast.error("Failed to save session");
    } else {
      toast.success(editingId ? "Session updated" : "Session created");
      qc.invalidateQueries({ queryKey: ["study-sessions-config"] });
      setDialogOpen(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("study_sessions_config")
      .delete()
      .eq("session_config_id", id);
    if (error) {
      toast.error("Failed to delete session");
    } else {
      toast.success("Session deleted");
      qc.invalidateQueries({ queryKey: ["study-sessions-config"] });
    }
  };

  const toggleDay = (day: number) => {
    setForm((f) => ({
      ...f,
      days_of_week: f.days_of_week.includes(day)
        ? f.days_of_week.filter((d) => d !== day)
        : [...f.days_of_week, day].sort(),
    }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Study Sessions</CardTitle>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Session
        </Button>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No study sessions configured</p>
            <p className="text-xs mt-1">Create sessions to track when you study</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.session_config_id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: session.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{session.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.start_time.slice(0, 5)} – {session.end_time.slice(0, 5)}
                    {session.is_overnight && " (overnight)"}
                    {" · "}
                    {session.days_of_week
                      ?.map((d) => DAYS.find((dd) => dd.value === d)?.label)
                      .join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => openEdit(session)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(session.session_config_id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Session" : "New Study Session"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Morning Focus"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Overnight Session</Label>
                <Switch
                  checked={form.is_overnight}
                  onCheckedChange={(v) => setForm({ ...form, is_overnight: v })}
                />
              </div>

              {/* Days */}
              <div className="space-y-1.5">
                <Label>Days</Label>
                <div className="flex gap-1">
                  {DAYS.map((day) => (
                    <Button
                      key={day.value}
                      variant={form.days_of_week.includes(day.value) ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0 text-xs"
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label.charAt(0)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="space-y-1.5">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {DEFAULT_COLORS.map((c) => (
                    <button
                      key={c}
                      className={`h-6 w-6 rounded-full border-2 transition-transform ${
                        form.color === c ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => setForm({ ...form, color: c })}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
