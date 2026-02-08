import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { BookOpen, Home, LogIn, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-10 animate-[pulse_4s_ease-in-out_infinite]"
          style={{ background: "hsl(var(--primary))" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-10 animate-[pulse_5s_ease-in-out_infinite_1s]"
          style={{ background: "hsl(var(--chart-4))" }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full opacity-5 animate-[pulse_6s_ease-in-out_infinite_2s]"
          style={{ background: "hsl(var(--chart-2))" }}
        />
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Broken book illustration */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <BookOpen className="h-24 w-24 text-muted-foreground/30" strokeWidth={1} />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl">
              ❌
            </span>
          </div>
        </div>

        {/* Animated 404 */}
        <h1
          className="text-8xl sm:text-9xl font-extrabold tracking-tighter mb-4 bg-clip-text text-transparent animate-fade-in"
          style={{
            backgroundImage:
              "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--chart-4)), hsl(var(--primary)))",
            backgroundSize: "200% auto",
            animation: "fade-in 0.3s ease-out, gradient-shift 3s linear infinite",
          }}
        >
          404
        </h1>

        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2 animate-fade-in">
          Page not found
        </h2>
        <p className="text-muted-foreground mb-8 animate-fade-in">
          Looks like this page wandered off. Let's get you back on track.
        </p>

        {/* Auth-aware CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in">
          {user ? (
            <>
              <Button asChild size="lg">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Gradient shift keyframes */}
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
