import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
}

interface BreadcrumbNavProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
    if (!items.length) return null;

    return (
        <nav className={cn("flex items-center text-sm text-muted-foreground", className)}>
            <Link
                to="/dashboard"
                className="flex items-center hover:text-foreground transition-colors"
            >
                <Home className="h-4 w-4" />
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
                    {item.href ? (
                        <Link
                            to={item.href}
                            className="hover:text-foreground transition-colors truncate max-w-[150px] sm:max-w-[200px]"
                            title={item.label}
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span
                            className="text-foreground font-medium truncate max-w-[150px] sm:max-w-[200px]"
                            title={item.label}
                        >
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
