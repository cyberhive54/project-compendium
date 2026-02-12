import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHolidays, type Holiday } from "@/hooks/useHolidays";
import { toast } from "sonner";
import {
  Plus,
  Search,
  CalendarDays,
  Pencil,
  Trash2,
  Umbrella,
  ArrowUpDown,
  Loader2,
  LayoutGrid,
  List,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

const HOLIDAY_TYPES = ["Holiday", "Sick Leave", "Family Event", "Travel", "Festival", "Other"];

type SortField = "date" | "type" | "created_at";
type SortDir = "asc" | "desc";

export default function HolidaysPage() {
  const { holidays, isLoading, create, update, remove } = useHolidays();

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Holiday | null>(null);
  const [formDate, setFormDate] = useState("");
  const [formType, setFormType] = useState("Holiday");
  const [formReason, setFormReason] = useState("");
  const [formStudyPct, setFormStudyPct] = useState(0);

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...holidays];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (h) =>
          h.holiday_type.toLowerCase().includes(q) ||
          h.reason?.toLowerCase().includes(q) ||
          h.date.includes(q)
      );
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = a.date.localeCompare(b.date);
      else if (sortField === "type") cmp = a.holiday_type.localeCompare(b.holiday_type);
      else cmp = a.created_at.localeCompare(b.created_at);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [holidays, search, sortField, sortDir]);

  const openCreate = () => {
    setEditing(null);
    setFormDate(format(new Date(), "yyyy-MM-dd"));
    setFormType("Holiday");
    setFormReason("");
    setFormStudyPct(0);
    setFormOpen(true);
  };

  const openEdit = (h: Holiday) => {
    setEditing(h);
    setFormDate(h.date);
    setFormType(h.holiday_type);
    setFormReason(h.reason ?? "");
    setFormStudyPct(h.study_percentage ?? 0);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!formDate) {
      toast.error("Date is required");
      return;
    }
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.holiday_id,
          date: formDate,
          holiday_type: formType,
          reason: formReason || undefined,
          study_percentage: formStudyPct,
        });
        toast.success("Holiday updated");
      } else {
        await create.mutateAsync({
          date: formDate,
          holiday_type: formType,
          reason: formReason || undefined,
          study_percentage: formStudyPct,
        });
        toast.success("Holiday added");
      }
      setFormOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      toast.success("Holiday deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // ... (existing code)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Umbrella className="h-6 w-6 text-primary" />
            Holidays
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage holidays and streak freezes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md p-1 bg-muted/50">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Holiday
          </Button>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* ... (existing search code) */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by type, reason, or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("date")}
            className={sortField === "date" ? "border-primary" : ""}
          >
            <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
            Date
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("type")}
            className={sortField === "type" ? "border-primary" : ""}
          >
            <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
            Type
          </Button>
        </div>
      </div>

      {/* Holiday List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No holidays found.</p>
            <p className="text-xs mt-1">Add holidays to preserve your streaks.</p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h) => (
            <Card key={h.holiday_id} className="group hover:border-primary/50 transition-colors">
              <CardContent className="flex items-center justify-between py-4 px-5">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="text-center shrink-0">
                    <div className="text-xs text-muted-foreground uppercase">
                      {format(parseISO(h.date), "MMM")}
                    </div>
                    <div className="text-xl font-bold">
                      {format(parseISO(h.date), "dd")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(parseISO(h.date), "EEE")}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{h.holiday_type}</span>
                      {(h.study_percentage ?? 0) > 0 && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {h.study_percentage}% study
                        </Badge>
                      )}
                    </div>
                    {h.reason && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {h.reason}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(h)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteId(h.holiday_id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="divide-y">
            {filtered.map((h) => (
              <div key={h.holiday_id} className="flex items-center justify-between p-4 bg-card hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 md:gap-8 flex-1 min-w-0">
                  <div className="flex items-center gap-3 shrink-0 w-24">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{format(parseISO(h.date), "MMM dd")}</span>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{h.holiday_type}</span>
                      {(h.study_percentage ?? 0) > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {h.study_percentage}% study
                        </Badge>
                      )}
                    </div>
                    {h.reason && (
                      <span className="text-sm text-muted-foreground truncate">
                        {h.reason}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 pl-4 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(h)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteId(h.holiday_id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Holiday" : "Add Holiday"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <DatePicker
                date={formDate ? parseISO(formDate) : undefined}
                onSelect={(d) => d && setFormDate(format(d, "yyyy-MM-dd"))}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={formType} onValueChange={setFormType}>
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
              <Textarea
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                placeholder="Why are you taking this holiday?"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Study Percentage:{" "}
                <span className="font-bold text-primary">{formStudyPct}%</span>
              </Label>
              <Slider
                value={[formStudyPct]}
                onValueChange={([v]) => setFormStudyPct(v)}
                min={0}
                max={100}
                step={10}
              />
              <p className="text-xs text-muted-foreground">
                {formStudyPct === 0
                  ? "Full holiday — streak is frozen for this day."
                  : `Partial holiday — you plan to study ${formStudyPct}% of your normal routine.`}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={create.isPending || update.isPending}
            >
              {(create.isPending || update.isPending) && (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              )}
              {editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Holiday</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the holiday and may affect your streak calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
