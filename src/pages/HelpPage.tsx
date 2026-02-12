import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Contact, HelpCircle, Book, Search, Timer, Target, Layers, Settings, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// FAQ Data with categories
const faqs = [
    {
        category: "Getting Started",
        question: "How do I create a Study Schedule?",
        answer: "Go to Settings > Study Sessions to define your preferred study times. Then, when creating tasks, you can assign them to these sessions or let the auto-scheduler slot them in."
    },
    {
        category: "Getting Started",
        question: "What is the difference between a Goal and a Project?",
        answer: "A Project is a high-level container (e.g., 'Class 12 Board Prep'). A Goal is a specific target within that project (e.g., 'Physics Board Exam'). Tasks belong to goals."
    },
    {
        category: "Timer",
        question: "How does the Timer work?",
        answer: "The timer (Pomodoro or Stopwatch) tracks your actual study time. You can start it from the Dashboard, Task List, or Timer page. Completed sessions award XP and update the 'Actual Duration' of the linked task."
    },
    {
        category: "Organize",
        question: "Can I import my syllabus?",
        answer: "Yes! Go to the Hierarchy page in the sidebar (under Organize) and click 'Import JSON'. This allows you to bulk-create subjects and topics."
    },
    {
        category: "Organize",
        question: "How do I delete a subject?",
        answer: "You can delete a subject from the Hierarchy page. Note: You cannot delete a subject if it has active tasks or sessions linked to it. You must delete those first."
    },
    {
        category: "Account",
        question: "How do I reset my password?",
        answer: "If you are logged out, click 'Forgot Password' on the login screen. If you are logged in, go to Settings > Account to update your password."
    },
    {
        category: "Gamification",
        question: "How do I earn badges?",
        answer: "Badges are awarded for milestones like 10-day streaks, completing 100 tasks, or studying for 50 hours total. Check the 'Badges' page to see your progress."
    },
    {
        category: "Timer",
        question: "What happens if I pause a session?",
        answer: "Pausing a session stops the timer. You can resume it anytime. If a session is paused for more than 24 hours, it may be automatically closed."
    }
];

const categories = ["All", "Getting Started", "Timer", "Organize", "Account", "Gamification"];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredFaqs = useMemo(() => {
        return faqs.filter(faq => {
            const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-10">
            <div className="flex flex-col gap-4 text-center py-8">
                <h1 className="text-3xl font-bold tracking-tight">How can we help?</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Search our knowledge base for answers to common questions.
                </p>

                <div className="relative max-w-xl mx-auto w-full mt-4">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search for 'timer', 'tasks', 'syllabus'..."
                        className="pl-10 h-12 text-lg shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
                {categories.map(cat => (
                    <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        onClick={() => setSelectedCategory(cat)}
                        size="sm"
                        className="rounded-full"
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            {selectedCategory === "All" ? "Frequently Asked Questions" : `${selectedCategory} FAQs`}
                        </CardTitle>
                        <CardDescription>
                            {filteredFaqs.length} result{filteredFaqs.length !== 1 && 's'} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredFaqs.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full">
                                {filteredFaqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger className="text-left">
                                            <span className="flex items-center gap-3">
                                                {searchQuery === "" && selectedCategory === "All" && (
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 min-w-[80px] justify-center">
                                                        {faq.category}
                                                    </Badge>
                                                )}
                                                {faq.question}
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground leading-relaxed pl-2 border-l-2 ml-1">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>No results found for "{searchQuery}".</p>
                                <Button variant="link" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
                                    Clear filters
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Book className="h-4 w-4" />
                                Legend & Basics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-xs uppercase text-muted-foreground">Task Priorities</h4>
                                <ul className="text-sm space-y-2">
                                    <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500"></span> Critical (Do ASAP)</li>
                                    <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-500"></span> High (Important)</li>
                                    <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500"></span> Medium (Normal)</li>
                                    <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-500"></span> Low (Whenever)</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Still stuck?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Can't find what you're looking for? Send us a message or check the community forums.
                            </p>
                            <Button className="w-full" variant="outline" asChild>
                                <Link to="/feedback">Send Feedback</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
