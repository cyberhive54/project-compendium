import { useMemo } from "react";
import { type Task } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface FocusDistributionCardProps {
    tasks: (Task & { subjects?: { color: string; name: string } | null })[];
    timerSessions: { task_id: string | null; duration_seconds: number | null }[];
}

export function FocusDistributionCard({ tasks, timerSessions }: FocusDistributionCardProps) {
    const data = useMemo(() => {
        const stats: Record<string, { name: string; value: number; color: string }> = {};

        // Map sessions to tasks to subjects
        timerSessions.forEach((session) => {
            if (!session.task_id || !session.duration_seconds) return;

            const task = tasks.find((t) => t.task_id === session.task_id);
            if (task?.subjects) {
                const { name, color } = task.subjects;
                if (!stats[name]) {
                    stats[name] = { name, value: 0, color };
                }
                stats[name].value += Math.round(session.duration_seconds / 60);
            }
        });

        // Also include tasks with actual_duration if valid (optional, but good for manual entry)
        // For now, let's stick to timer sessions as "Focus" distribution

        return Object.values(stats).sort((a, b) => b.value - a.value);
    }, [tasks, timerSessions]);

    const totalMinutes = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

    if (totalMinutes === 0) return null;

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Focus</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[120px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={50}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => [`${value}m`, 'Duration']}
                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Total */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="text-lg font-bold">{totalMinutes}</span>
                            <span className="text-[10px] text-muted-foreground block -mt-1">min</span>
                        </div>
                    </div>
                </div>
                {/* Legend */}
                <div className="mt-2 space-y-1">
                    {data.slice(0, 3).map(d => (
                        <div key={d.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                                <span className="truncate max-w-[80px] text-muted-foreground">{d.name}</span>
                            </div>
                            <span className="font-medium">{d.value}m</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
