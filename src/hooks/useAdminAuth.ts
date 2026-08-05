import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

interface UserRole {
    role: "admin" | "moderator" | "user";
}

export function useAdminAuth() {
    const { user, loading: authLoading } = useAuth();

    const { data: roleData, isLoading: roleLoading } = useQuery({
        queryKey: ["userRoles", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", user.id);

            if (error) {
                console.error("Error fetching user roles:", error);
                return [];
            }
            return (data as UserRole[]).map(r => r.role);
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const roles = roleData ?? [];
    const isAdmin = roles.includes("admin");
    const isModerator = roles.includes("moderator");
    const isAdminOrModerator = isAdmin || isModerator;
    const loading = authLoading || roleLoading;

    return {
        user,
        isAdmin,
        isModerator,
        isAdminOrModerator,
        roles,
        loading,
    };
}
