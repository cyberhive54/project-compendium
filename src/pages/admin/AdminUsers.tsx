import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Shield, Ban, CheckCircle, Mail, RefreshCw, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type UserRole = "admin" | "moderator" | "user";

type UserProfile = {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string;
    meta_data: Record<string, unknown>;
    roles: UserRole[];
};

const roleLabels: Record<UserRole, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ReactNode }> = {
    admin: { label: "Admin", variant: "destructive", icon: <Shield className="h-3 w-3 mr-1" /> },
    moderator: { label: "Moderator", variant: "secondary", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
    user: { label: "User", variant: "outline", icon: <Mail className="h-3 w-3 mr-1" /> },
};

const roleOptions: { value: UserRole; label: string }[] = [
    { value: "admin", label: "Admin" },
    { value: "moderator", label: "Moderator" },
    { value: "user", label: "User (remove roles)" },
];

export default function AdminUsers() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Fetch users with roles
    const fetchUsers = useCallback(async (retryCount = 0) => {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_admin_user_list');

        if (error) {
            console.error("Error fetching users:", error);

            // Retry up to 3 times with exponential backoff
            if (retryCount < 3) {
                const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
                setTimeout(() => fetchUsers(retryCount + 1), delay);
                return;
            }

            // Final error after retries exhausted
            toast({
                variant: 'destructive',
                title: 'Error loading users',
                description: 'Failed to load users after retries. Ensure the SQL migration for get_admin_user_list is applied.'
            });
        } else {
            // Fetch roles for each user
            const userIds = (data as UserProfile[]).map(u => u.id);
            let rolesMap = new Map<string, UserRole[]>();

            if (userIds.length > 0) {
                const { data: rolesData } = await supabase
                    .from("user_roles")
                    .select("user_id, role")
                    .in("user_id", userIds);

                if (rolesData) {
                    for (const r of rolesData) {
                        if (!rolesMap.has(r.user_id)) {
                            rolesMap.set(r.user_id, []);
                        }
                        rolesMap.get(r.user_id)!.push(r.role as UserRole);
                    }
                }
            }

            setUsers((data as UserProfile[]).map(u => ({
                ...u,
                roles: rolesMap.get(u.id) ?? []
            })));
        }
        setLoading(false);
    }, [toast]);

    // Role mutation - replaces all roles with the new one
    const updateRole = useMutation({
        mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
            // First, delete all existing roles for this user
            const { error: deleteError } = await supabase
                .from("user_roles")
                .delete()
                .eq("user_id", userId);

            if (deleteError) throw deleteError;

            // Then, if newRole is not "user", insert the new role
            if (newRole !== "user") {
                const { error: insertError } = await supabase
                    .from("user_roles")
                    .insert({ user_id: userId, role: newRole })
                    .select()
                    .single();
                if (insertError) throw insertError;
            }

            return { userId, newRole };
        },
        onSuccess: ({ userId, newRole }) => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast({
                title: newRole === "user" ? "Roles removed" : "Role updated",
                description: newRole === "user"
                    ? "All roles removed from user."
                    : `User is now ${newRole}.`,
            });
        },
        onError: (error: Error) => {
            toast({
                variant: 'destructive',
                title: 'Error updating role',
                description: error.message,
            });
        },
    });

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getHighestRole = (roles: UserRole[]): UserRole => {
        if (roles.includes("admin")) return "admin";
        if (roles.includes("moderator")) return "moderator";
        return "user";
    };

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        // Prevent self-role change
        if (userId === currentUser?.id) {
            toast({
                variant: 'destructive',
                title: 'Cannot change own role',
                description: 'You cannot modify your own role.',
            });
            return;
        }
        updateRole.mutate({ userId, newRole });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                    <p className="text-muted-foreground">Manage registered accounts and roles.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search emails..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchUsers()}
                        disabled={loading}
                        className="gap-2"
                    >
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Loading users...
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => {
                                const highestRole = getHighestRole(user.roles);
                                const roleInfo = roleLabels[highestRole];

                                return (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.email}</span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">{user.id}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {user.last_sign_in_at
                                                ? new Date(user.last_sign_in_at).toLocaleDateString()
                                                : <span className="text-muted-foreground italic">Never</span>}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                <CheckCircle className="h-3 w-3 mr-1" /> Active
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={roleInfo.variant} className="gap-1">
                                                {roleInfo.icon}
                                                {roleInfo.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Select
                                                value={highestRole}
                                                onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                                                disabled={updateRole.isPending}
                                            >
                                                <SelectTrigger className="w-[160px]">
                                                    <SelectValue placeholder="Change role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roleOptions.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {updateRole.isPending && (
                                                <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
