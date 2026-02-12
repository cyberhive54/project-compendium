import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookOpen, CheckCircle2, Loader2, Mail, MapPin, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Check cooldown on mount
    useEffect(() => {
        const lastSent = localStorage.getItem("last_contact_sent");
        if (lastSent) {
            const timeSince = Date.now() - parseInt(lastSent);
            const waitTime = 5 * 60 * 1000; // 5 minutes
            if (timeSince < waitTime) {
                setCooldown(Math.ceil((waitTime - timeSince) / 1000));
            }
        }
    }, []);

    // Update countdown
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => {
                setCooldown((c) => c - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    });

    const onSubmit = async (values: ContactFormValues) => {
        if (cooldown > 0) {
            const minutes = Math.floor(cooldown / 60);
            const seconds = cooldown % 60;
            toast({
                variant: "destructive",
                title: "Please wait",
                description: `You can send another message in ${minutes}m ${seconds}s.`,
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from("contact_submissions").insert({
                name: values.name,
                email: values.email,
                subject: values.subject,
                message: values.message,
            });

            if (error) throw error;

            setIsSuccess(true);
            toast({
                title: "Message Sent!",
                description: "We've received your message and will get back to you soon.",
            });
            form.reset();

            // Set cooldown
            localStorage.setItem("last_contact_sent", Date.now().toString());
            setCooldown(300); // 5 minutes in seconds

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error sending message",
                description: error.message || "Something went wrong. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navbar */}
            <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-30">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Link to="/" className="flex items-center gap-2">
                        <BookOpen className="h-7 w-7 text-primary" />
                        <span className="text-xl font-bold tracking-tight">StudyTracker</span>
                    </Link>
                    <Button variant="ghost" asChild>
                        <Link to="/">Back to Home</Link>
                    </Button>
                </div>
            </nav>

            <div className="flex-1 flex flex-col md:flex-row">
                {/* Contact Info Side */}
                <div className="bg-muted p-10 md:w-1/3 lg:w-2/5 flex flex-col justify-center">
                    <div className="max-w-md mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-4">Get in touch</h1>
                            <p className="text-muted-foreground text-lg">
                                Have questions about StudyTracker? We're here to help. Fill out the form or reach out directly.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Email Us</h3>
                                    <p className="text-sm text-muted-foreground">support@studytracker.com</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Office</h3>
                                    <p className="text-sm text-muted-foreground">
                                        123 Education Lane<br />
                                        Knowledge City, KC 45000
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="p-8 md:p-12 md:w-2/3 lg:w-3/5 flex items-center justify-center">
                    <div className="w-full max-w-lg">
                        {isSuccess ? (
                            <div className="text-center py-12 animate-in zoom-in duration-500">
                                <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Message Received!</h2>
                                <p className="text-muted-foreground mb-8">
                                    Thanks for reaching out. We'll be in touch shortly.
                                </p>
                                <Button onClick={() => setIsSuccess(false)} variant="outline">
                                    Send another message
                                </Button>
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-semibold">Send a message</h2>
                                        <p className="text-sm text-muted-foreground">All fields are required.</p>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="john@example.com" type="email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subject</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="How can I...?" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Message</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Tell us more about your inquiry..."
                                                        className="min-h-[120px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
