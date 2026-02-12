import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

interface UserRole {
    role: "admin" | "moderator" | "user";
}

export function useAdminAuth() {
    const { user, loading: authLoading } = useAuth();

    const { data: roleData, isLoading: roleLoading } = useQuery({
        queryKey: ["userRole", user?.id],
        queryFn: async () => {
            if (!user) return null;
            const { data, error } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) {
                // If no role found, default to user (or handle error)
                console.error("Error fetching user role:", error);
                return null;
            }
            return data as UserRole;
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const isAdmin = roleData?.role === "admin";
    const loading = authLoading || roleLoading;

    return {
        user,
        isAdmin,
        role: roleData?.role,
        loading,
    };
}
