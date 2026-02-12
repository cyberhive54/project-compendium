import { useRef } from "react";
import {
    Target,
    Timer,
    Trophy,
    BarChart3,
    Shield,
    Zap,
    Users,
    Layout,
    BookOpen,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Feature data
const mainFeatures = [
    {
        icon: Target,
        title: "Project-Based Learning",
        description: "Break down ambitious study goals into manageable projects, subjects, and topics. Track progress at every level.",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        icon: Timer,
        title: "Advanced Timer",
        description: "Customizable Pomodoro timer that tracks focus time against specific tasks. Includes auto-break and session analytics.",
        color: "text-orange-500",
        bg: "bg-orange-500/10",
    },
    {
        icon: Trophy,
        title: "Gamification Engine",
        description: "Earn XP, level up, and unlock badges for consistency and milestones. Make studying addictive.",
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
    },
    {
        icon: BarChart3,
        title: "Deep Analytics",
        description: "Visualize your habits with heatmaps, trend lines, and subject distribution charts. Know exactly how you study.",
        color: "text-green-500",
        bg: "bg-green-500/10",
    },
];

const secondaryFeatures = [
    { icon: Shield, title: "Private & Secure", desc: "Your data is yours. Secure authentication and privacy-first design." },
    { icon: Zap, title: "Lightning Fast", desc: "Built with modern tech for instant loads and smooth interactions." },
    { icon: Users, title: "Community Focused", desc: "Join a growing community of students aiming for excellence." },
    { icon: Layout, title: "Responsive Design", desc: "Study on any device - mobile, tablet, or desktop." },
];

export default function FeaturesPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="min-h-screen bg-background" ref={containerRef}>
            {/* Navbar */}
            <nav className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Link to="/" className="flex items-center gap-2">
                        <BookOpen className="h-7 w-7 text-primary" />
                        <span className="text-xl font-bold tracking-tight">StudyTracker</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium hover:underline underline-offset-4">
                            Login
                        </Link>
                        <Button asChild size="sm">
                            <Link to="/signup">Get Started</Link>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] [mask-image:linear-gradient(0deg,transparent,black)]" />
                <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10 text-center">
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Features that empower <br className="hidden sm:block" /> your academic journey.
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
                        Discover the tools designed to transform how you learn, track, and succeed.
                    </p>
                </div>
            </section>

            {/* Main Features Grid */}
            <section className="py-12 bg-muted/30">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        {mainFeatures.map((feature, idx) => (
                            <Card key={idx} className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
                                <div className="flex flex-col md:flex-row h-full">
                                    <div className={cn("p-6 flex items-start justify-center md:basis-1/4", feature.bg)}>
                                        <feature.icon className={cn("h-10 w-10", feature.color)} />
                                    </div>
                                    <div className="p-6 md:basis-3/4">
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                                        <p className="text-muted-foreground">{feature.description}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Detailed Capabilities */}
            <section className="py-20">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Why choose StudyTracker?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            We've thought of everything so you can focus on what matters: learning.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {secondaryFeatures.map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Interactive CTA */}
            <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
                    </svg>
                </div>
                <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10 text-center">
                    <h2 className="text-3xl sm:text-5xl font-bold mb-6">Ready to get started?</h2>
                    <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
                        Join thousands of students who are already using StudyTracker to ace their exams.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" variant="secondary" className="px-8 text-base font-semibold" asChild>
                            <Link to="/signup">Start for Free</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="px-8 text-base bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" asChild>
                            <Link to="/contact">Contact Sales</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-background border-t">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 grid md:grid-cols-4 gap-8">
                    <div className="col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <BookOpen className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold">StudyTracker</span>
                        </Link>
                        <p className="text-muted-foreground max-w-xs">
                            The all-in-one platform for students to track, manage, and gamify their learning journey.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/features" className="hover:text-primary">Features</Link></li>
                            <li><Link to="/pricing" className="hover:text-primary">Pricing</Link></li>
                            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-primary">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} StudyTracker. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
