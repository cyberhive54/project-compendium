import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Award, LayoutDashboard, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Link to="/admin/badges">
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Badges</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Manage</div>
                            <p className="text-xs text-muted-foreground">
                                Create and edit user badges
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/admin/feedback">
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Feedback</CardTitle>
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Review</div>
                            <p className="text-xs text-muted-foreground">
                                Manage user feedback and reports
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Card className="opacity-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">
                            User management coming soon
                        </p>
                    </CardContent>
                </Card>
                <Card className="opacity-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System</CardTitle>
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">
                            System health and logs
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
