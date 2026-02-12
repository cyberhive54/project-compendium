import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookOpen, Loader2, Eye, EyeOff, CheckCircle2, ChevronLeft, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
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

const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (emailSent) {
    return (
      <div className="flex min-h-screen w-full bg-background relative selection:bg-primary/20">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full hover:bg-muted"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="mx-auto w-full max-w-[400px]">
            <Card className="text-center border-none shadow-none bg-transparent">
              <CardHeader className="space-y-4">
                <div className="flex justify-center mb-2">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Check your email</CardTitle>
                <CardDescription className="text-base mt-2">
                  We've sent a verification link to <span className="font-medium text-foreground">{form.getValues("email")}</span>.
                  Click the link to verify your account and start studying!
                </CardDescription>
                <div className="pt-4">
                  <Link to="/login">
                    <Button variant="outline">Back to Sign In</Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const onSubmit = async (values: SignupFormValues) => {
    setIsSubmitting(true);
    const { error } = await signUp(values.email, values.password, {
      username: values.username
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message,
      });
    } else {
      setEmailSent(true);
      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background relative selection:bg-primary/20">
      {/* Top Navigation */}
      <div className="absolute top-4 left-4 z-50">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full hover:bg-muted"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <div className="w-full h-full lg:grid lg:grid-cols-2">
        {/* Visual Side - Order 2 on Desktop (Right Side) to distinguish from Login? 
            Login has visual on Right. 
            Common pattern: Signup often mirrors or swaps. 
            User said "redesign signup page too... modern, professional". 
            Let's swap order: Visual on LEFT for Signup for variety.
         */}
        <div className="hidden lg:block relative h-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors duration-300 order-last lg:order-first">
          <div className="absolute inset-0 border-r border-zinc-200 dark:border-white/10" />
          <div className="relative h-full flex flex-col justify-between p-10 z-10 selection:bg-primary/20">
            <div className="flex items-center gap-2 font-medium text-lg">
              <BookOpen className="h-6 w-6 text-primary" />
              <span>StudyTracker</span>
            </div>

            <div className="max-w-md space-y-4">
              <h2 className="text-3xl font-bold leading-tight tracking-tighter">
                Join thousands of students achieving their goals.
              </h2>
              <blockquote className="space-y-2">
                <p className="text-lg leading-relaxed font-medium">
                  "I used to struggle with consistency. This platform gave me the structure I needed to excel in my exams."
                </p>
              </blockquote>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="flex items-center justify-center p-8">
          <div className="mx-auto w-full max-w-[380px] space-y-8">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to create your account
              </p>
            </div>

            <div className="grid gap-4">
              <Button
                variant="outline"
                className="w-full relative py-5 font-normal text-muted-foreground hover:text-foreground"
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Google signup will be available soon. Please use email for now.",
                    duration: 3000,
                  });
                }}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 absolute left-4" aria-hidden>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="johndoe"
                            className="py-5"
                            {...field}
                          />
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
                          <Input
                            placeholder="name@example.com"
                            type="email"
                            autoComplete="email"
                            className="py-5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              autoComplete="new-password"
                              className="py-5 pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              autoComplete="new-password"
                              className="py-5 pr-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full py-5 font-semibold" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </Form>

              <p className="px-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="underline underline-offset-4 hover:text-primary font-medium text-foreground"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
