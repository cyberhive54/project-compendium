import { Link } from "react-router-dom";
import {
  BookOpen,
  Target,
  Timer,
  Trophy,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

const features = [
  {
    icon: Target,
    title: "Organized Hierarchy",
    description:
      "Structure your studies from Projects → Goals → Subjects → Chapters → Topics. Everything in its place.",
  },
  {
    icon: Timer,
    title: "Smart Timer",
    description:
      "Built-in Pomodoro timer with session tracking. Know exactly where your time goes.",
  },
  {
    icon: Trophy,
    title: "Gamified Progress",
    description:
      "Earn XP, unlock badges, and maintain streaks. Turn studying into an engaging challenge.",
  },
  {
    icon: BarChart3,
    title: "Visual Analytics",
    description:
      "Heatmaps, trend charts, and performance insights. Data-driven improvement at your fingertips.",
  },
];

const steps = [
  {
    step: "01",
    title: "Set up your goals",
    description: "Create projects and goals, then break them down into subjects, chapters, and topics.",
  },
  {
    step: "02",
    title: "Track your study sessions",
    description: "Use the built-in timer to log focused study sessions linked to your tasks.",
  },
  {
    step: "03",
    title: "Review and improve",
    description: "Check your analytics dashboard to identify patterns and optimize your study routine.",
  },
];

const stats = [
  { value: "10,000+", label: "Study sessions tracked" },
  { value: "500+", label: "Active students" },
  { value: "95%", label: "Improved consistency" },
  { value: "4.8★", label: "Student rating" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">StudyTracker</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: "hsl(var(--primary))" }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-5"
            style={{ background: "hsl(var(--chart-4))" }}
          />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Master Your Studies with{" "}
                <span className="text-primary">StudyTracker</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Organize your entire study workflow — goals, subjects, tasks, and timers — all in one place. Track progress, earn rewards, and stay consistent.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <Button size="lg" asChild className="text-base px-8">
                  <Link to="/signup">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base px-8">
                  <a href="#features">Learn More</a>
                </Button>
              </div>
            </div>

            {/* Decorative visual */}
            <div className="hidden lg:flex justify-center">
              <div className="relative w-80 h-80">
                <div
                  className="absolute inset-0 rounded-3xl rotate-6 opacity-20"
                  style={{ background: "hsl(var(--primary))" }}
                />
                <div className="absolute inset-0 rounded-3xl bg-card border shadow-lg flex flex-col items-center justify-center gap-4 p-8">
                  <div className="flex gap-3">
                    <span className="text-4xl">📚</span>
                    <span className="text-4xl">🎯</span>
                    <span className="text-4xl">⏱️</span>
                  </div>
                  <div className="w-full space-y-3 mt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" style={{ color: "hsl(var(--success))" }} />
                      <div className="h-3 rounded-full bg-muted flex-1" />
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" style={{ color: "hsl(var(--success))" }} />
                      <div className="h-3 rounded-full bg-muted flex-1" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary shrink-0" />
                      <div className="h-3 rounded-full bg-secondary flex-1 relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 w-3/5 rounded-full" style={{ background: "hsl(var(--primary))" }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 shrink-0" style={{ borderColor: "hsl(var(--muted-foreground))" }} />
                      <div className="h-3 rounded-full bg-muted flex-1" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-2xl">🏆</span>
                    <span className="text-2xl">🔥</span>
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-24 bg-muted/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need to study smarter
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete study management system designed by students, for students.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="bg-card border hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "hsl(var(--primary) / 0.1)" }}
                  >
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps to a more productive study routine.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-primary-foreground mb-4"
                  style={{ background: "hsl(var(--primary))" }}
                >
                  {s.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl sm:text-4xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to level up your study game?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of students who study smarter, not harder.
          </p>
          <Button size="lg" asChild className="mt-8 text-base px-8">
            <Link to="/signup">
              Sign Up Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>© 2026 StudyTracker. Built for students.</span>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/login" className="hover:text-foreground transition-colors">
              Login
            </Link>
            <Link to="/signup" className="hover:text-foreground transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
