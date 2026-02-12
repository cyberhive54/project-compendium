import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Mail, Trash2, CheckCircle, Archive } from "lucide-react";
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

    const updateStatus = async (id: string, status: "read" | "archived") => {
        const { error } = await supabase
            .from("contact_submissions")
            .update({ status })
            .eq("id", id);

        if (error) {
            toast({ variant: "destructive", title: "Update failed", description: error.message });
        } else {
            toast({ title: "Status updated" });
            fetchSubmissions();
        }
    };

    const deleteSubmission = async (id: string) => {
        const { error } = await supabase
            .from("contact_submissions")
            .delete()
            .eq("id", id);

        if (error) {
            toast({ variant: "destructive", title: "Delete failed", description: error.message });
        } else {
            toast({ title: "Message deleted" });
            fetchSubmissions();
        }
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
                                            <div className="flex items-center gap-2">
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
        </div>
    );
}
