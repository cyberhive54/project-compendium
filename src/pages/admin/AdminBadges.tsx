import { useState } from "react";
import { useBadges, type BadgeDefinition } from "@/hooks/useBadges";
import { Button } from "@/components/ui/button";
import { BadgeFormDialog } from "@/components/admin/BadgeFormDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2, Award } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

export default function AdminBadges() {
    const { allBadges, isLoading, create, update, remove } = useBadges();
    const [createOpen, setCreateOpen] = useState(false);
    const [editingBadge, setEditingBadge] = useState<BadgeDefinition | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<BadgeDefinition | null>(null);

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Badges</h2>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <a href="/admin/badges/docs">Documentation</a>
                    </Button>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Badge
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allBadges.map((badge) => (
                    <Card key={badge.badge_id} className="relative group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                <span className="text-2xl mr-2">{badge.icon}</span>
                                {badge.name}
                            </CardTitle>
                            <Badge variant="outline" className="capitalize">
                                {badge.tier}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mb-3">
                                {badge.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <Badge variant="secondary" className="text-[10px]">
                                    {badge.category}
                                </Badge>
                                {badge.is_default && (
                                    <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-600">
                                        Default
                                    </Badge>
                                )}
                                {badge.levels?.length > 0 && (
                                    <Badge variant="secondary" className="text-[10px]">
                                        {badge.levels.length} Levels
                                    </Badge>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono truncate">
                                {JSON.stringify(badge.unlock_condition)}
                            </div>

                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-card/80 p-1 rounded-md">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setEditingBadge(badge)}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteTarget(badge)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Create Dialog */}
            <BadgeFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSubmit={(data) => create.mutate(data)}
            />

            {/* Edit Dialog */}
            {editingBadge && (
                <BadgeFormDialog
                    open={!!editingBadge}
                    onOpenChange={(open) => !open && setEditingBadge(null)}
                    initialData={editingBadge}
                    onSubmit={(data) =>
                        update.mutate({ id: editingBadge.badge_id, ...data })
                    }
                />
            )}

            {/* Delete Confirmation */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            badge "{deleteTarget?.name}" and remove it from all users who have
                            earned it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleteTarget) {
                                    remove.mutate(deleteTarget.badge_id);
                                    setDeleteTarget(null);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
