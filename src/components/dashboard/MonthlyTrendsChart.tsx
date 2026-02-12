import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { useMonthlyTrends } from "@/hooks/useAnalyticsData";
import { format } from "date-fns";

export function MonthlyTrendsChart() {
    const { data, isLoading } = useMonthlyTrends();
    const [hovered, setHovered] = useState<number | null>(null);
    const monthLabel = format(new Date(), "MMMM yyyy");

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Monthly Trends — {monthLabel}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!data?.length) return null;

    const maxStudy = Math.max(1, ...data.map((d) => d.studyMinutes));
    const maxTasks = Math.max(1, ...data.map((d) => d.tasksCompleted));
    const totalStudy = data.reduce((s, d) => s + d.studyMinutes, 0);
    const totalTasks = data.reduce((s, d) => s + d.tasksCompleted, 0);

    const width = 800;
    const height = 200;
    const padLeft = 36;
    const padRight = 16;
    const padTop = 16;
    const padBottom = 28;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const xStep = data.length > 1 ? plotW / (data.length - 1) : plotW;

    const getX = (i: number) => padLeft + i * xStep;
    const getStudyY = (i: number) => padTop + plotH - (data[i].studyMinutes / maxStudy) * plotH;
    const getTaskY = (i: number) => padTop + plotH - (data[i].tasksCompleted / maxTasks) * plotH;

    // Build SVG path strings
    const studyPoints = data.map((_, i) => `${getX(i)},${getStudyY(i)}`);
    const taskPoints = data.map((_, i) => `${getX(i)},${getTaskY(i)}`);

    const studyArea = `M ${padLeft},${padTop + plotH} L ${studyPoints.join(" L ")} L ${getX(data.length - 1)},${padTop + plotH} Z`;
    const studyLine = `M ${studyPoints.join(" L ")}`;
    const taskLine = `M ${taskPoints.join(" L ")}`;

    const labelInterval = data.length > 15 ? 5 : data.length > 7 ? 3 : 1;

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Monthly Trends
                    </CardTitle>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span>{formatDuration(totalStudy)} · {totalTasks} tasks</span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-0.5 bg-blue-500 rounded-full inline-block" />
                            Study
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-0.5 bg-emerald-500 rounded-full inline-block" />
                            Tasks
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
                        <line
                            key={frac}
                            x1={padLeft}
                            x2={width - padRight}
                            y1={padTop + plotH * (1 - frac)}
                            y2={padTop + plotH * (1 - frac)}
                            stroke="currentColor"
                            strokeOpacity={0.06}
                            strokeWidth={1}
                        />
                    ))}

                    {/* Study area fill */}
                    <path d={studyArea} fill="hsl(217, 91%, 60%)" fillOpacity={0.08} />

                    {/* Study line */}
                    <path d={studyLine} fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

                    {/* Tasks line */}
                    <path d={taskLine} fill="none" stroke="hsl(152, 69%, 53%)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="4 2" />

                    {/* Hover vertical line */}
                    {hovered !== null && (
                        <line
                            x1={getX(hovered)}
                            x2={getX(hovered)}
                            y1={padTop}
                            y2={padTop + plotH}
                            stroke="currentColor"
                            strokeOpacity={0.2}
                            strokeWidth={1}
                            strokeDasharray="3 3"
                        />
                    )}

                    {/* Data points */}
                    {data.map((d, i) => (
                        <g key={i}>
                            {/* Study dot */}
                            <circle
                                cx={getX(i)}
                                cy={getStudyY(i)}
                                r={hovered === i ? 4 : 2}
                                fill="hsl(217, 91%, 60%)"
                                className="transition-all duration-150"
                            />
                            {/* Task dot */}
                            <circle
                                cx={getX(i)}
                                cy={getTaskY(i)}
                                r={hovered === i ? 4 : 2}
                                fill="hsl(152, 69%, 53%)"
                                className="transition-all duration-150"
                            />
                            {/* Invisible hit area for hover */}
                            <rect
                                x={getX(i) - xStep / 2}
                                y={padTop}
                                width={xStep}
                                height={plotH}
                                fill="transparent"
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                            />
                        </g>
                    ))}

                    {/* X-axis labels */}
                    {data.map((d, i) => {
                        if (i % labelInterval !== 0 && i !== data.length - 1) return null;
                        return (
                            <text
                                key={`label-${i}`}
                                x={getX(i)}
                                y={height - 4}
                                textAnchor="middle"
                                className={`fill-muted-foreground ${hovered === i ? "font-bold" : ""}`}
                                fontSize={9}
                            >
                                {d.day}
                            </text>
                        );
                    })}

                    {/* Y-axis labels */}
                    <text x={padLeft - 4} y={padTop + 3} textAnchor="end" className="fill-muted-foreground" fontSize={8}>
                        {formatDuration(maxStudy)}
                    </text>
                    <text x={padLeft - 4} y={padTop + plotH + 3} textAnchor="end" className="fill-muted-foreground" fontSize={8}>
                        0
                    </text>
                </svg>

                {/* Hover tooltip */}
                {hovered !== null && data[hovered] && (
                    <div
                        className="absolute bg-popover border rounded-lg px-3 py-2 shadow-lg pointer-events-none z-10 text-xs min-w-[120px]"
                        style={{
                            left: `${((getX(hovered)) / width) * 100}%`,
                            top: `${((getStudyY(hovered) - 12) / height) * 100}%`,
                            transform: `translate(${hovered > data.length * 0.7 ? "-100%" : hovered < data.length * 0.3 ? "0" : "-50%"}, -100%)`,
                        }}
                    >
                        <div className="font-medium mb-1">
                            {format(new Date(data[hovered].date), "EEE, MMM d")}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-muted-foreground">Study:</span>
                            <span className="font-medium">{formatDuration(data[hovered].studyMinutes)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-muted-foreground">Tasks:</span>
                            <span className="font-medium">{data[hovered].tasksCompleted}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function formatDuration(minutes: number): string {
    if (minutes === 0) return "0m";
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
