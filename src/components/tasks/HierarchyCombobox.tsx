import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface HierarchyComboboxProps {
    value: string;
    onValueChange: (value: string) => void;
    items: Array<{ value: string; label: string; icon?: string }>;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    className?: string;
    allowNone?: boolean;
    disabled?: boolean;
}

export function HierarchyCombobox({
    value,
    onValueChange,
    items,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    emptyText = "No items found.",
    className,
    allowNone = false,
    disabled = false,
}: HierarchyComboboxProps) {
    const [open, setOpen] = useState(false);

    const selectedItem = items.find((item) => item.value === value);
    const displayValue = selectedItem
        ? `${selectedItem.icon || ""} ${selectedItem.label}`.trim()
        : placeholder;

    const allItems = allowNone
        ? [{ value: "", label: "None", icon: "" }, ...items]
        : items;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                    disabled={disabled}
                >
                    <span className="truncate">{displayValue}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {allItems.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.label}
                                    onSelect={() => {
                                        onValueChange(item.value === value ? "" : item.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.icon && <span className="mr-2">{item.icon}</span>}
                                    <span>{item.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
