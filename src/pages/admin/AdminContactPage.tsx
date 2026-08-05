import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Mail, Trash2, CheckCircle, Archive, Eye, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type ContactSubmission = {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: "new" | "read" | "archived";
    created_at: string;
};

export default function AdminContactPage() {
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
    const { toast } = useToast();

    const fetchSubmissions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("contact_submissions")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast({
                variant: "destructive",
                title: "Error fetching messages",
                description: error.message,
            });
        } else {
            setSubmissions(data as ContactSubmission[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const updateStatus = async (id: string, status: "read" | "archived", closeDialog = false) => {
        const { error } = await supabase
            .from("contact_submissions")
            .update({ status })
            .eq("id", id);

        if (error) {
            toast({ variant: "destructive", title: "Update failed", description: error.message });
        } else {
            toast({ title: "Status updated" });
            fetchSubmissions();
            if (closeDialog) setSelectedSubmission(null);
        }
    };

    const deleteSubmission = async (id: string, closeDialog = false) => {
        const { error } = await supabase
            .from("contact_submissions")
            .delete()
            .eq("id", id);

        if (error) {
            toast({ variant: "destructive", title: "Delete failed", description: error.message });
        } else {
            toast({ title: "Message deleted" });
            fetchSubmissions();
            if (closeDialog) setSelectedSubmission(null);
        }
    };

    const openViewModal = (submission: ContactSubmission) => {
        setSelectedSubmission(submission);
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Contact Messages</h2>
                    <p className="text-muted-foreground">Manage inquiries from the contact form.</p>
                </div>
                <Button onClick={fetchSubmissions} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inbox</CardTitle>
                    <CardDescription>
                        You have {submissions.filter(s => s.status === 'new').length} new messages.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No messages found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                submissions.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Badge variant={item.status === 'new' ? 'default' : item.status === 'read' ? 'secondary' : 'outline'}>
                                                {item.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(item.created_at), "MMM d, yyyy")}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{item.name}</span>
                                                <span className="text-xs text-muted-foreground">{item.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[300px]">
                                                <div className="font-medium truncate">{item.subject}</div>
                                                <div className="text-xs text-muted-foreground truncate">{item.message}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {/* View Button */}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    title="View Message"
                                                    onClick={() => openViewModal(item)}
                                                    className="text-primary hover:text-primary/80"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>

                                                {/* Inline Quick Actions */}
                                                {item.status === 'new' && (
                                                    <Button size="icon" variant="ghost" title="Mark as Read" onClick={() => updateStatus(item.id, 'read')}>
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    </Button>
                                                )}
                                                {item.status !== 'archived' && (
                                                    <Button size="icon" variant="ghost" title="Archive" onClick={() => updateStatus(item.id, 'archived')}>
                                                        <Archive className="h-4 w-4 text-orange-500" />
                                                    </Button>
                                                )}

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="icon" variant="ghost" title="Delete">
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently remove the message from {item.name}.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteSubmission(item.id)} className="bg-destructive hover:bg-destructive/90">
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* View Message Modal */}
            <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Message Details</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedSubmission(null)}
                                className="h-8 w-8"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogTitle>
                        <DialogDescription>
                            Full message content and actions
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSubmission && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">From</p>
                                    <p className="font-medium">{selectedSubmission.name}</p>
                                    <p className="text-muted-foreground">{selectedSubmission.email}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Received</p>
                                    <p className="font-medium">{format(new Date(selectedSubmission.created_at), "MMMM d, yyyy 'at' h:mm a")}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-muted-foreground">Subject</p>
                                    <p className="font-medium">{selectedSubmission.subject}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-muted-foreground">Status</p>
                                    <Badge variant={selectedSubmission.status === 'new' ? 'default' : selectedSubmission.status === 'read' ? 'secondary' : 'outline'}>
                                        {selectedSubmission.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <p className="text-muted-foreground mb-2">Message</p>
                                <ScrollArea className="h-64 rounded-md border p-4 bg-muted/30">
                                    <p className="whitespace-pre-wrap text-sm">{selectedSubmission.message}</p>
                                </ScrollArea>
                            </div>

                            <DialogFooter className="flex flex-col sm:flex-row gap-2 border-t pt-4">
                                {selectedSubmission.status === 'new' && (
                                    <Button
                                        onClick={() => updateStatus(selectedSubmission!.id, 'read', true)}
                                        className="gap-2"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Mark as Read
                                    </Button>
                                )}
                                {selectedSubmission.status !== 'archived' && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => updateStatus(selectedSubmission!.id, 'archived', true)}
                                        className="gap-2"
                                    >
                                        <Archive className="h-4 w-4" />
                                        Archive
                                    </Button>
                                )}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="gap-2">
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently remove the message from {selectedSubmission.name}.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteSubmission(selectedSubmission!.id, true)} className="bg-destructive hover:bg-destructive/90">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                                    Close
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}