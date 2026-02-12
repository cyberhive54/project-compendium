import { useState } from "react";
import {
    Book,
    Code,
    Database,
    Globe,
    Layers,
    Server,
    ShieldCheck,
    LayoutDashboard,
    Target,
    ClipboardList,
    Timer,
    Settings,
    Search,
    Menu,
    X
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Documentation Data Structure
const docsData = [
    {
        id: "getting-started",
        title: "Getting Started",
        icon: Globe,
        sections: [
            {
                id: "intro",
                title: "Introduction",
                content: (
                    <div className="space-y-4">
                        <p><strong>StudyTracker</strong> is a comprehensive academic management system designed to help students organize their studies, track progress, and stay motivated through gamification.</p>
                        <p>It aims to replace scattered tools like paper planners, isolated timer apps, and spreadsheet trackers with a single, unified platform.</p>
                    </div>
                )
            },
            {
                id: "core-concepts",
                title: "Core Concepts",
                content: (
                    <div className="space-y-4">
                        <p>The application is built around a specific hierarchy of information:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Projects:</strong> The highest level of organization (e.g., "Semester 1", "Competitive Exams").</li>
                            <li><strong>Goals:</strong> Specific objectives within a project (e.g., "Score 90% in Math").</li>
                            <li><strong>Subjects:</strong> The topics of study linked to goals (e.g., "Calculus", "Physics").</li>
                            <li><strong>Tasks:</strong> Actionable items to complete (e.g., "Read Chapter 4", "Solve 20 problems").</li>
                            <li><strong>Sessions:</strong> Time records reflecting actual work done on tasks.</li>
                        </ul>
                    </div>
                )
            }
        ]
    },
    {
        id: "features",
        title: "Feature Guide",
        icon: Layers,
        sections: [
            {
                id: "dashboard",
                title: "Dashboard",
                content: (
                    <div className="space-y-4">
                        <p>The control center of the application. It provides:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Today's Schedule:</strong> A timeline view of tasks planned for the day.</li>
                            <li><strong>Task List:</strong> A quick view of high-priority and pending tasks.</li>
                            <li><strong>Quick Actions:</strong> Buttons to immediately start a timer or add a new task.</li>
                            <li><strong>Analytics Snapshot:</strong> Brief charts showing study time trends.</li>
                        </ul>
                    </div>
                )
            },
            {
                id: "timer",
                title: "Timer & Focus",
                content: (
                    <div className="space-y-4">
                        <p>The application features a robust timer system:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Pomodoro Mode:</strong> Standard 25/5 minute work/break intervals.</li>
                            <li><strong>Stopwatch Mode:</strong> Open-ended tracking for flexible sessions.</li>
                            <li><strong>Task Linking:</strong> Every session must be linked to a task or subject to ensure data quality.</li>
                            <li><strong>Postponing:</strong> If a user cannot finish a task, they can "postpone" it, moving it to a future date.</li>
                        </ul>
                    </div>
                )
            },
            {
                id: "hierarchy",
                title: "Hierarchy Management",
                content: (
                    <div className="space-y-4">
                        <p>Users manage their structure via the <strong>Hierarchy</strong> page.</p>
                        <div className="bg-muted p-4 rounded-md">
                            <strong>Constraint:</strong> You cannot delete a Project if it has active Goals. You must archive or delete the Goals first. This prevents accidental data loss.
                        </div>
                    </div>
                )
            }
        ]
    },
    {
        id: "admin-guides",
        title: "Admin Guides",
        icon: ShieldCheck,
        sections: [
            {
                id: "managing-users",
                title: "Managing Users",
                content: (
                    <div className="space-y-4">
                        <p>User management interface is currently in development.</p>
                        <p><strong>Planned Capabilities:</strong></p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>View user details (email, signup date).</li>
                            <li>Disable accounts (prevent login).</li>
                            <li>Promote users to specific roles (Moderator, Admin).</li>
                        </ul>
                    </div>
                )
            },
            {
                id: "feedback",
                title: "Handling Feedback",
                content: (
                    <div className="space-y-4">
                        <p>Users submit feedback via the in-app form. These appear in the <strong>Messages</strong> section of the Admin Console.</p>
                        <p><strong>Workflow:</strong></p>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li>Review the incoming message.</li>
                            <li>If it's a bug, verify it and log it for developers.</li>
                            <li>If it's a feature request, tag it accordingly.</li>
                            <li>Mark the message as "Read" or "Archived" to keep the inbox clean.</li>
                        </ol>
                    </div>
                )
            }
        ]
    },
    {
        id: "tech-overview",
        title: "Technical Overview",
        icon: Code,
        sections: [
            {
                id: "stack",
                title: "Tech Stack",
                content: (
                    <div className="space-y-4">
                        <p>For technical stakeholders, the application uses:</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Frontend</h4>
                                <ul className="list-disc pl-4 text-sm space-y-1">
                                    <li>React 18</li>
                                    <li>TypeScript</li>
                                    <li>Tailwind CSS</li>
                                    <li>Shadcn UI</li>
                                    <li>Vite</li>
                                </ul>
                            </div>
                            <div className="border p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Backend</h4>
                                <ul className="list-disc pl-4 text-sm space-y-1">
                                    <li>Supabase (PostgreSQL)</li>
                                    <li>RLS Policies (Security)</li>
                                    <li>Edge Functions</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )
            }
        ]
    }
];

export default function DevDocsPage() {
    const [activeSection, setActiveSection] = useState("getting-started");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const activeDoc = docsData.find(d => d.id === activeSection) || docsData[0];

    return (
        <div className="flex h-[calc(100vh-100px)] -m-4 md:-m-8">
            {/* Sidebar */}
            <aside className={cn(
                "bg-muted/30 border-r w-64 flex-shrink-0 flex flex-col transition-all duration-300 absolute inset-y-0 left-0 z-20 md:relative",
                !sidebarOpen && "-ml-64"
            )}>
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Book className="h-4 w-4" /> Documentation
                    </h2>
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-1">
                        {docsData.map(doc => (
                            <button
                                key={doc.id}
                                onClick={() => setActiveSection(doc.id)}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    activeSection === doc.id
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <doc.icon className="h-4 w-4" />
                                {doc.title}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-background h-full">
                <div className="border-b p-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" className={cn("md:hidden", sidebarOpen && "hidden")} onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-4 w-4" />
                    </Button>
                    <h1 className="text-xl font-bold truncate">StudyTracker Manual</h1>
                </div>

                <ScrollArea className="flex-1 p-6 md:p-10">
                    <div className="max-w-3xl mx-auto space-y-10 pb-20">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-primary">{activeDoc.title}</h1>
                            <p className="text-lg text-muted-foreground">Detailed guide and reference.</p>
                        </div>

                        <div className="space-y-12">
                            {activeDoc.sections.map(section => (
                                <div key={section.id} id={section.id} className="scroll-mt-20">
                                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">{section.title}</h2>
                                    <div className="text-muted-foreground leading-relaxed">
                                        {section.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollArea>
            </main>
        </div>
    );
}
