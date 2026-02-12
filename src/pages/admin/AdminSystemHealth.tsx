import { useEffect, useState } from "react";
import { Activity, Database, Server, Smartphone, Users, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default function AdminSystemHealth() {
    const [stats, setStats] = useState({
        dbConnected: false,
        latency: 0,
        userCount: 0,
        taskCount: 0,
        version: "1.0.0",
        lastCheck: new Date()
    });

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    const checkHealth = async () => {
        const start = performance.now();

        // 1. Check DB Connection & Latency
        const { error, count } = await supabase.from('user_roles').select('*', { count: 'exact', head: true });
        const end = performance.now();
        const latency = Math.round(end - start);

        // 2. Get Counts (Approximate)
        // Note: For real apps, these might be heavy queries. 
        // We Use simple counts here.
        const { count: users } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
        // Using user_profiles as proxy for users since auth.users is protected

        const { count: tasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true });

        setStats({
            dbConnected: !error,
            latency,
            userCount: users || 0,
            taskCount: tasks || 0,
            version: "1.0.0",
            lastCheck: new Date()
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
                    <p className="text-muted-foreground">Real-time performance monitoring.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    <Clock className="h-3 w-3" />
                    Updated: {stats.lastCheck.toLocaleTimeString()}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Database Status</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className={`text-2xl font-bold ${stats.dbConnected ? 'text-green-600' : 'text-red-600'}`}>
                                {stats.dbConnected ? 'Online' : 'Offline'}
                            </div>
                            {stats.dbConnected && <CheckCircle className="h-5 w-5 text-green-600" />}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Latency: {stats.latency}ms
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.userCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Registered accounts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.taskCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Tasks created systems-wide
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">App Version</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.version}</div>
                        <p className="text-xs text-muted-foreground">
                            Stable Release
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Environment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm font-medium">Frontend</span>
                            <span className="text-sm text-muted-foreground">React 18 + Vite</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm font-medium">Backend</span>
                            <span className="text-sm text-muted-foreground">Supabase (PostgreSQL 15)</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm font-medium">Client Info</span>
                            <span className="text-sm text-muted-foreground max-w-[200px] truncate" title={navigator.userAgent}>
                                {navigator.userAgent}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 bg-amber-50/50 dark:bg-amber-900/10 border-amber-200">
                    <CardHeader>
                        <CardTitle className="text-amber-700 dark:text-amber-500 flex items-center gap-2">
                            <Smartphone className="h-5 w-5" /> Maintenance Mode
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Maintenance mode prevents users from logging in. Use this only for critical updates.
                        </p>
                        <button className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors opacity-50 cursor-not-allowed" disabled>
                            Enable Maintenance (Disabled)
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
