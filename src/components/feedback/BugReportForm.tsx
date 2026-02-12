import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Bug } from "lucide-react";
import type { Feedback } from "@/hooks/useFeedback";

interface BugReportFormProps {
    onSubmit: (data: Partial<Feedback>) => void;
    isSubmitting: boolean;
}

const PRIORITIES = [
    { value: "low", label: "Low - Minor issue", color: "text-green-600" },
    { value: "medium", label: "Medium - Noticeable problem", color: "text-yellow-600" },
    { value: "high", label: "High - Major functionality affected", color: "text-orange-600" },
    { value: "critical", label: "Critical - Blocks core features", color: "text-red-600" },
];

const CATEGORIES = [
    "Login/Authentication",
    "Tasks",
    "Goals/Projects",
    "Hierarchy",
    "Calendar",
    "Timer",
    "Analytics",
    "Settings",
    "UI/Layout",
    "Performance",
    "Other",
];

function getBrowserInfo() {
    const ua = navigator.userAgent;
    const browser = {
        name: "Unknown",
        version: "Unknown",
        os: "Unknown",
    };

    // Detect browser
    if (ua.indexOf("Firefox") > -1) {
        browser.name = "Firefox";
        browser.version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || "Unknown";
    } else if (ua.indexOf("Chrome") > -1) {
        browser.name = "Chrome";
        browser.version = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || "Unknown";
    } else if (ua.indexOf("Safari") > -1) {
        browser.name = "Safari";
        browser.version = ua.match(/Version\/(\d+\.\d+)/)?.[1] || "Unknown";
    } else if (ua.indexOf("Edge") > -1) {
        browser.name = "Edge";
        browser.version = ua.match(/Edge\/(\d+\.\d+)/)?.[1] || "Unknown";
    }

    // Detect OS
    if (ua.indexOf("Win") > -1) browser.os = "Windows";
    else if (ua.indexOf("Mac") > -1) browser.os = "macOS";
    else if (ua.indexOf("Linux") > -1) browser.os = "Linux";
    else if (ua.indexOf("Android") > -1) browser.os = "Android";
    else if (ua.indexOf("iOS") > -1) browser.os = "iOS";

    return `${browser.name} ${browser.version} on ${browser.os}\nScreen: ${window.screen.width}x${window.screen.height}`;
}

export function BugReportForm({ onSubmit, isSubmitting }: BugReportFormProps) {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState<string>("");
    const [category, setCategory] = useState("");
    const [steps, setSteps] = useState("");
    const [expected, setExpected] = useState("");
    const [actual, setActual] = useState("");
    const [browserInfo, setBrowserInfo] = useState("");

    useEffect(() => {
        setBrowserInfo(getBrowserInfo());
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !steps.trim() || !priority) {
            return;
        }

        // Combine all parts into description
        const description = `**Steps to Reproduce:**\n${steps.trim()}\n\n${expected.trim() ? `**Expected Behavior:**\n${expected.trim()}\n\n` : ""
            }${actual.trim() ? `**Actual Behavior:**\n${actual.trim()}\n\n` : ""}**Browser Info:**\n${browserInfo}`;

        onSubmit({
            type: "bug",
            title: title.trim(),
            priority: priority as Feedback["priority"],
            category: category || null,
            description,
            browser_info: browserInfo,
            steps_to_reproduce: steps.trim(),
            expected_behavior: expected.trim() || null,
            actual_behavior: actual.trim() || null,
            status: "submitted",
        });

        // Reset form
        setTitle("");
        setPriority("");
        setCategory("");
        setSteps("");
        setExpected("");
        setActual("");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="bug-title">Bug Title *</Label>
                <Input
                    id="bug-title"
                    placeholder="Brief description of the bug..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="bug-priority">Priority *</Label>
                    <Select value={priority} onValueChange={setPriority} required>
                        <SelectTrigger id="bug-priority">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            {PRIORITIES.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    <span className={p.color}>{p.label}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bug-category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="bug-category">
                            <SelectValue placeholder="Select category (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bug-steps">Steps to Reproduce *</Label>
                <Textarea
                    id="bug-steps"
                    placeholder="1. Go to...\n2. Click on...\n3. See error..."
                    className="min-h-[120px] font-mono text-sm"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    required
                />
                <p className="text-xs text-muted-foreground">
                    List the exact steps needed to reproduce the bug
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bug-expected">Expected Behavior (optional)</Label>
                <Textarea
                    id="bug-expected"
                    placeholder="What should happen?"
                    className="min-h-[80px]"
                    value={expected}
                    onChange={(e) => setExpected(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="bug-actual">Actual Behavior (optional)</Label>
                <Textarea
                    id="bug-actual"
                    placeholder="What actually happens?"
                    className="min-h-[80px]"
                    value={actual}
                    onChange={(e) => setActual(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Browser Information (auto-detected)</Label>
                <div className="p-3 bg-muted rounded-md text-sm font-mono">
                    {browserInfo}
                </div>
            </div>

            <Button type="submit" disabled={isSubmitting || !priority} className="w-full">
                {isSubmitting ? (
                    "Sending..."
                ) : (
                    <>
                        <Bug className="mr-2 h-4 w-4" /> Report Bug
                    </>
                )}
            </Button>
        </form>
    );
}
