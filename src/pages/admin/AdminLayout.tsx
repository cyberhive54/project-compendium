import { useEffect } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2, ShieldAlert, Users, Database, MessageSquare, FileText, LayoutDashboard, LogOut, Book, Award, Activity, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
    const { user, isAdmin, isModerator, isAdminOrModerator, loading } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login?redirect=/admin");
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAdminOrModerator) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
                <ShieldAlert className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">
                    You do not have permission to access the admin area.
                </p>
                <Button onClick={() => navigate("/")}>Return to App</Button>
            </div>
        );
    }

    // Moderators only see Feedback and Contact pages
    const isModeratorOnly = isModerator && !isAdmin;
    const navItems = isModeratorOnly
        ? [
            { href: "/admin/feedback", label: "Reviews", icon: MessageSquare },
            { href: "/admin/contact-us", label: "Messages", icon: Mail },
        ]
        : [
            { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
            { href: "/admin/users", label: "Users", icon: Users },
            { href: "/admin/badges", label: "Badges", icon: Award },
            { href: "/admin/feedback", label: "Reviews", icon: MessageSquare },
            { href: "/admin/contact-us", label: "Messages", icon: Mail },
            { href: "/admin/health", label: "System Health", icon: Activity },
        ];

    return (
        <div className="flex h-screen w-full flex-col">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold tracking-tight">Admin</span>
                </div>
                <nav className="flex-1 flex items-center justify-center">
                    <ul className="flex gap-1">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    to={item.href}
                                    className={cn(
                                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        location.pathname === item.href || (item.exact && location.pathname === item.href)
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="flex items-center gap-2">
                    <Link to="/">
                        <Button variant="ghost" size="sm">
                            <LogOut className="mr-2 h-4 w-4" />
                            Back to App
                        </Button>
                    </Link>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-6">
                <Outlet />
            </main>
        </div>
    );
}