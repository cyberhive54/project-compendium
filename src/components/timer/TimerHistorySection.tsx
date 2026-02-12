import { useState } from "react";
import { format, subDays, startOfDay, endOfDay, isSameDay } from "date-fns";
import { useTimerHistory, TimerSessionWithTask } from "@/hooks/useTimerHistory";
import { SessionDetailModal } from "./SessionDetailModal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "./TimerDisplay";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";

export function TimerHistorySection() {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const [period, setPeriod] = useState("this_week");
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 7),
        to: new Date(),
    });

    const { data, isLoading } = useTimerHistory({
        page,
        pageSize,
        startDate: dateRange?.from,
        endDate: dateRange?.to,
    });

    const [selectedSession, setSelectedSession] = useState<TimerSessionWithTask | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const handlePeriodChange = (val: string) => {
        setPeriod(val);
        const today = new Date();
        switch (val) {
            case "today":
                setDateRange({ from: startOfDay(today), to: endOfDay(today) });
                break;
            case "yesterday":
                const yest = subDays(today, 1);
                setDateRange({ from: startOfDay(yest), to: endOfDay(yest) });
                break;
            case "this_week":
                setDateRange({ from: subDays(today, 7), to: today });
                break;
            case "this_month":
                setDateRange({ from: subDays(today, 30), to: today });
                break;
            case "custom":
                // Keep current range or clear
                break;
        }
        setPage(1); // Reset page on filter change
    };

    const handleRowClick = (session: TimerSessionWithTask) => {
        setSelectedSession(session);
        setDetailOpen(true);
    };

    const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg font-medium">Recent Sessions</CardTitle>
                    <div className="flex items-center gap-2">
                        <Select value={period} onValueChange={handlePeriodChange}>
                            <SelectTrigger className="w-[140px] h-8">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="yesterday">Yesterday</SelectItem>
                                <SelectItem value="this_week">Last 7 Days</SelectItem>
                                <SelectItem value="this_month">Last 30 Days</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>

                        {period === "custom" && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[240px] h-8 justify-start text-left font-normal",
                                            !dateRange && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                                    {format(dateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={(range) => {
                                            setDateRange(range);
                                            if (range?.from && range?.to) setPage(1);
                                        }}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Duration</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <div className="flex justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : data?.sessions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No sessions found for this period.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.sessions.map((session) => (
                                        <TableRow
                                            key={session.session_id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleRowClick(session)}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{format(new Date(session.start_time), "MMM d, yyyy")}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(session.start_time), "HH:mm")}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="line-clamp-1">
                                                    {session.tasks?.name || "Unknown Task"}
                                                </span>
                                                {session.tasks?.goals?.projects?.name && (
                                                    <span className="text-xs text-muted-foreground line-clamp-1">
                                                        {session.tasks.goals.projects.name}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="flex w-fit items-center gap-1 font-normal">
                                                    {session.is_pomodoro ? <Zap className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                                    {session.is_pomodoro ? "Pomodoro" : "Focus"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatTime(session.duration_seconds || 0)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-end space-x-2 py-4">
                            <span className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || isLoading}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <SessionDetailModal
                session={selectedSession}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />
        </div>
    );
}
