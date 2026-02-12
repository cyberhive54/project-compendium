import { useEffect } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2, ShieldAlert, Users, Database, MessageSquare, FileText, LayoutDashboard, LogOut, Book, Award, Activity, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
    const { user, isAdmin, loading } = useAdminAuth();
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

    if (!isAdmin) {
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

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/badges", label: "Badges", icon: Award },
        { href: "/admin/feedback", label: "Reviews", icon: MessageSquare },
        { href: "/admin/contact-us", label: "Messages", icon: Mail },
        { href: "/admin/health", label: "Health", icon: Activity },
        { href: "/admin/notes", label: "My Notes", icon: FileText },
        { href: "/admin/docs-dev", label: "Dev Docs", icon: Book },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 border-r bg-muted/30 md:min-h-screen flex-shrink-0">
                <div className="h-16 flex items-center px-6 border-b font-bold text-lg tracking-tight">
                    Admin Console
                </div>
                <div className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = item.exact
                            ? location.pathname === item.href
                            : location.pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
                <div className="p-4 mt-auto border-t">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => navigate("/")}
                    >
                        <LogOut className="h-4 w-4" />
                        Exit Admin
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="h-16 border-b flex items-center px-6 md:px-10 justify-between">
                    <h1 className="font-semibold text-lg">
                        {navItems.find(i => i.href === location.pathname)?.label || "Administration"}
                    </h1>
                </header>
                <div className="p-6 md:p-10 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
