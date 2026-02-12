import { useState, useEffect } from "react";
import { Plus, Trash2, Save, FileText, Pin, PinOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { cn } from "@/lib/utils";

type AdminNote = {
    id: string;
    title: string;
    content: string;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
};

export default function AdminNotesPage() {
    const { user } = useAdminAuth();
    const { toast } = useToast();
    const [notes, setNotes] = useState<AdminNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<AdminNote | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const fetchNotes = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("admin_notes")
            .select("*")
            .eq("user_id", user.id)
            .order("is_pinned", { ascending: false })
            .order("updated_at", { ascending: false });

        if (error) {
            toast({ variant: "destructive", title: "Failed to load notes", description: error.message });
        } else {
            setNotes(data as AdminNote[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNotes();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        if (!title.trim() && !content.trim()) return;

        const payload = {
            user_id: user.id,
            title,
            content,
        };

        let error;

        if (editingNote) {
            const { error: updateError } = await supabase
                .from("admin_notes")
                .update(payload)
                .eq("id", editingNote.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from("admin_notes")
                .insert(payload);
            error = insertError;
        }

        if (error) {
            toast({ variant: "destructive", title: "Error saving note", description: error.message });
        } else {
            toast({ title: editingNote ? "Note updated" : "Note created" });
            setIsDialogOpen(false);
            resetForm();
            fetchNotes();
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("admin_notes").delete().eq("id", id);
        if (error) {
            toast({ variant: "destructive", title: "Error deleting note", description: error.message });
        } else {
            // toast({ title: "Note deleted" });
            setNotes(prev => prev.filter(n => n.id !== id));
        }
    };

    const togglePin = async (note: AdminNote) => {
        const { error } = await supabase
            .from("admin_notes")
            .update({ is_pinned: !note.is_pinned })
            .eq("id", note.id);

        if (!error) fetchNotes();
    };

    const openEdit = (note: AdminNote) => {
        setEditingNote(note);
        setTitle(note.title);
        setContent(note.content);
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingNote(null);
        setTitle("");
        setContent("");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Personal Notes</h2>
                    <p className="text-muted-foreground">Keep track of ideas, bugs, and tasks for this project.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> New Note
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingNote ? "Edit Note" : "Create Note"}</DialogTitle>
                            <DialogDescription>
                                Notes are private and visible only to you.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="Note Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="font-medium text-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Textarea
                                    placeholder="Write something..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="min-h-[200px] resize-none"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={!title && !content}>
                                <Save className="h-4 w-4 mr-2" /> Save Note
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {notes.map((note) => (
                    <Card key={note.id} className={cn("group relative flex flex-col transition-all hover:shadow-md", note.is_pinned && "border-primary/50 bg-primary/5")}>
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-lg font-semibold leading-tight line-clamp-1" title={note.title}>
                                    {note.title || "Untitled Note"}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-6 w-6 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity", note.is_pinned && "opacity-100 text-primary")}
                                    onClick={(e) => { e.stopPropagation(); togglePin(note); }}
                                >
                                    {note.is_pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {new Date(note.updated_at).toLocaleDateString()}
                            </p>
                        </CardHeader>
                        <CardContent className="flex-1 cursor-pointer" onClick={() => openEdit(note)}>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">
                                {note.content}
                            </p>
                        </CardContent>
                        <CardFooter className="pt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 w-8 text-destructive p-0" onClick={() => handleDelete(note.id)}>
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {notes.length === 0 && !loading && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <FileText className="h-10 w-10 mb-3 opacity-20" />
                        <p className="text-lg font-medium">No notes yet</p>
                        <p className="text-sm">Create your first note to remember important details.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
