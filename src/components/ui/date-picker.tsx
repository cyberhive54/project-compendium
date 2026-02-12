import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarProps } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DatePickerProps extends Omit<CalendarProps, "mode" | "selected" | "onSelect" | "className"> {
    date?: Date;
    onSelect?: (date: Date | undefined) => void;
    className?: string;
    placeholder?: string;
}

export function DatePicker({
    date,
    onSelect,
    className,
    placeholder = "Pick a date",
    ...props
}: DatePickerProps) {
    const [month, setMonth] = React.useState<Date>(date || new Date());

    // Update internal month state when date prop changes
    React.useEffect(() => {
        if (date) {
            setMonth(date);
        }
    }, [date]);

    const years = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 10; i <= currentYear + 10; i++) {
            years.push(i);
        }
        return years;
    }, []);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handleYearChange = (year: string) => {
        const newDate = new Date(month);
        newDate.setFullYear(parseInt(year));
        setMonth(newDate);
    };

    const handleMonthChange = (monthName: string) => {
        const newDate = new Date(month);
        newDate.setMonth(months.indexOf(monthName));
        setMonth(newDate);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex items-center gap-2 p-3 border-b">
                    <Select
                        value={months[month.getMonth()]}
                        onValueChange={handleMonthChange}
                    >
                        <SelectTrigger className="w-[120px] h-8">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((m) => (
                                <SelectItem key={m} value={m}>
                                    {m}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={month.getFullYear().toString()}
                        onValueChange={handleYearChange}
                    >
                        <SelectTrigger className="w-[80px] h-8">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((y) => (
                                <SelectItem key={y} value={y.toString()}>
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={onSelect}
                    month={month}
                    onMonthChange={setMonth}
                    initialFocus
                    {...props}
                />
            </PopoverContent>
        </Popover>
    );
}
