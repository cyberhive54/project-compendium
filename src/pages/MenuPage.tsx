import { Link } from "react-router-dom";
import {
    LayoutDashboard,
    ClipboardList,
    Target,
    FolderKanban,
    Layers,
    CalendarDays,
    BarChart3,
    Umbrella,
    Trophy,
    Settings,
    Timer,
    BookOpen,
    MessageCircle,
    ArrowLeft
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, color: "text-blue-500" },
    { title: "Tasks", url: "/tasks", icon: ClipboardList, color: "text-emerald-500" },
    { title: "Calendar", url: "/calendar", icon: CalendarDays, color: "text-orange-500" },
    { title: "Timer", url: "/timer", icon: Timer, color: "text-purple-500" },
    { title: "Goals", url: "/goals", icon: Target, color: "text-red-500" },
    { title: "Projects", url: "/projects", icon: FolderKanban, color: "text-indigo-500" },
    { title: "Hierarchy", url: "/hierarchy", icon: Layers, color: "text-cyan-500" },
    { title: "Analytics", url: "/analytics", icon: BarChart3, color: "text-chart-1" },
    { title: "Journal", url: "/journal", icon: BookOpen, color: "text-pink-500" },
    { title: "Badges", url: "/badges", icon: Trophy, color: "text-yellow-500" },
    { title: "Holidays", url: "/holidays", icon: Umbrella, color: "text-teal-500" },
    { title: "Settings", url: "/settings", icon: Settings, color: "text-gray-500" },
    { title: "Feedback", url: "/feedback", icon: MessageCircle, color: "text-indigo-400" },
];

export default function MenuPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background pb-20 md:pb-0">
            <div className="container py-6 space-y-6">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">Menu</h1>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {menuItems.map((item) => (
                        <Link key={item.title} to={item.url}>
                            <Card className="h-full hover:bg-accent/50 transition-colors border-muted">
                                <CardContent className="flex flex-col items-center justify-center p-6 gap-3 text-center h-full">
                                    <div className={cn("p-3 rounded-full bg-accent/50 ring-1 ring-border", item.color)}>
                                        <item.icon className="h-6 w-6" />
                                    </div>
                                    <span className="font-medium text-sm">{item.title}</span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Helper for admin users */}
                {/* We could add logic to show Admin link here if user is admin, similar to Sidebar */}
            </div>
        </div>
    );
}
