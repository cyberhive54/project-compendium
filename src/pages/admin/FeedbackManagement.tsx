import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useFeedback, type Feedback } from "@/hooks/useFeedback";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import { MessageSquare, Lightbulb, Bug, Filter, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_OPTIONS: Feedback["status"][] = [
    "submitted",
    "in_review",
    "planned",
    "in_progress",
    "completed",
    "resolved",
    "rejected",
    "duplicate",
];

export default function FeedbackManagement() {
    const { allFeedback, updateFeedbackStatus } = useFeedback();
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [newStatus, setNewStatus] = useState<Feedback["status"]>("submitted");
    const [adminNotes, setAdminNotes] = useState("");

    const filteredFeedback = allFeedback.data?.filter((f) => {
        if (typeFilter !== "all" && f.type !== typeFilter) return false;
        if (statusFilter !== "all" && f.status !== statusFilter) return false;
        if (priorityFilter !== "all" && f.priority !== priorityFilter) return false;
        return true;
    }) || [];

    const stats = {
        total: allFeedback.data?.length || 0,
        feedback: allFeedback.data?.filter((f) => f.type === "feedback").length || 0,
        features: allFeedback.data?.filter((f) => f.type === "feature").length || 0,
        bugs: allFeedback.data?.filter((f) => f.type === "bug").length || 0,
        pending: allFeedback.data?.filter((f) => f.status === "submitted").length || 0,
    };

    const handleUpdateStatus = () => {
        if (!selectedFeedback) return;
        updateFeedbackStatus.mutate({
            id: selectedFeedback.feedback_id,
            status: newStatus,
            admin_notes: adminNotes.trim() || undefined,
        });
        setSelectedFeedback(null);
        setAdminNotes("");
    };

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Feedback Management</h1>
                <p className="text-muted-foreground mb-4">
                    Review and manage user feedback, feature requests, and bug reports
                </p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">Total Submissions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-blue-600">{stats.feedback}</div>
                            <p className="text-xs text-muted-foreground">Feedback</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-purple-600">{stats.features}</div>
                            <p className="text-xs text-muted-foreground">Features</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-600">{stats.bugs}</div>
                            <p className="text-xs text-muted-foreground">Bugs</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground">Pending</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="feedback">💬 Feedback</SelectItem>
                                    <SelectItem value="feature">💡 Features</SelectItem>
                                    <SelectItem value="bug">🐛 Bugs</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {STATUS_OPTIONS.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status.replace("_", " ")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Feedback List */}
            <div className="space-y-4">
                {allFeedback.isLoading ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            Loading feedback...
                        </CardContent>
                    </Card>
                ) : filteredFeedback.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No feedback found matching the selected filters.
                        </CardContent>
                    </Card>
                ) : (
                    filteredFeedback.map((feedback) => (
                        <Card key={feedback.feedback_id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {feedback.type === "feedback" && <MessageSquare className="h-4 w-4" />}
                                            {feedback.type === "feature" && <Lightbulb className="h-4 w-4" />}
                                            {feedback.type === "bug" && <Bug className="h-4 w-4" />}
                                            <h3 className="font-semibold">{feedback.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline">{feedback.status.replace("_", " ")}</Badge>
                                            {feedback.priority && (
                                                <Badge variant="outline">{feedback.priority}</Badge>
                                            )}
                                            {feedback.category && (
                                                <Badge variant="secondary">{feedback.category}</Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setSelectedFeedback(feedback);
                                            setNewStatus(feedback.status);
                                            setAdminNotes(feedback.admin_notes || "");
                                        }}
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Update Status
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap text-muted-foreground line-clamp-3">
                                    {feedback.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Update Status Dialog */}
            <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Update Feedback Status</DialogTitle>
                        <DialogDescription>
                            Change the status and add admin notes for this submission
                        </DialogDescription>
                    </DialogHeader>

                    {selectedFeedback && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-1">{selectedFeedback.title}</h4>
                                <p className="text-sm text-muted-foreground">{selectedFeedback.description}</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={newStatus} onValueChange={(val) => setNewStatus(val as Feedback["status"])}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status.replace("_", " ").toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Admin Notes (optional)</Label>
                                <Textarea
                                    placeholder="Add internal notes or a message for the user..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setSelectedFeedback(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdateStatus} disabled={updateFeedbackStatus.isPending}>
                                    {updateFeedbackStatus.isPending ? "Updating..." : "Update Status"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
