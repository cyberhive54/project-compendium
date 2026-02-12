import { BookOpen, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <nav className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
                <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
                    <Link to="/" className="flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                        <span className="text-lg font-bold tracking-tight">StudyTracker</span>
                    </Link>
                    <Link to="/">
                        <Button variant="ghost" size="sm" className="gap-1">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="mx-auto max-w-3xl px-6 py-12 md:py-20">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Privacy Policy</h1>
                <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Welcome to StudyTracker. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you as to how we look after your personal data when you visit our website
                            and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">2. The Data We Collect</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data</strong> includes email address.</li>
                            <li><strong>Usage Data</strong> includes information about how you use our website and study tools (timers, tasks, etc.).</li>
                            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Data</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                            <li>To register you as a new customer.</li>
                            <li>To provide the study tracking services you requested.</li>
                            <li>To manage our relationship with you.</li>
                            <li>To improve our website, products/services, marketing and customer relationships.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Security</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">5. Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have any questions about this privacy policy or our privacy practices, please contact us at:
                            <br />
                            <a href="mailto:support@studytracker.com" className="text-primary hover:underline">support@studytracker.com</a>
                        </p>
                    </section>
                </div>
            </main>

            <footer className="border-t py-8 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} StudyTracker. All rights reserved.
            </footer>
        </div>
    );
}
