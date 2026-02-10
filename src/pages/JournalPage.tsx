import { useState, useMemo } from "react";
import { format, parseISO, startOfToday } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
import { useJournals, type Journal } from "@/hooks/useJournals";
import { toast } from "sonner";
import {
  BookOpen,
  Save,
  Search,
  Loader2,
  CalendarDays,
  Trash2,
} from "lucide-react";

export default function JournalPage() {
  const { journals, isLoading, upsert, remove } = useJournals();

  const today = format(startOfToday(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState(today);
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Load entry when date changes or data arrives
  const existingEntry = journals.find((j) => j.date === selectedDate);
  if (!initialized && journals.length >= 0 && !isLoading) {
    if (existingEntry) setContent(existingEntry.content);
    else setContent("");
    setInitialized(true);
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const entry = journals.find((j) => j.date === date);
    setContent(entry?.content ?? "");
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Write something before saving");
      return;
    }
    try {
      await upsert.mutateAsync({ date: selectedDate, content: content.trim() });
      toast.success("Journal saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      toast.success("Entry deleted");
      if (journals.find((j) => j.journal_id === deleteId)?.date === selectedDate) {
        setContent("");
      }
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  const filteredJournals = useMemo(() => {
    if (!search.trim()) return journals;
    const q = search.toLowerCase();
    return journals.filter(
      (j) =>
        j.content.toLowerCase().includes(q) || j.date.includes(q)
    );
  }, [journals, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Journal
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Reflect on your daily study experience
        </p>
      </div>

      {/* Editor */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-auto"
            />
            <span className="text-sm text-muted-foreground">
              {format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")}
            </span>
            {existingEntry && (
              <span className="text-xs text-success font-medium ml-auto">
                Saved
              </span>
            )}
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How was your study day? What did you learn? What challenges did you face?"
            rows={8}
            className="resize-y"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={upsert.isPending || !content.trim()}
            >
              {upsert.isPending ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1.5" />
              )}
              Save Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Past Entries</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredJournals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No journal entries yet.</p>
              <p className="text-xs mt-1">
                Start writing about your study days above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredJournals.map((j) => (
              <Card
                key={j.journal_id}
                className={`group cursor-pointer transition-colors ${
                  j.date === selectedDate
                    ? "border-primary"
                    : "hover:border-primary/30"
                }`}
                onClick={() => handleDateChange(j.date)}
              >
                <CardContent className="py-4 px-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {format(parseISO(j.date), "EEEE, MMMM d, yyyy")}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(j.journal_id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {j.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this journal entry.
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
