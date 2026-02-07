import { useEffect, useState } from "react";
import { useGamificationStore } from "@/stores/gamificationStore";
import { Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LevelUpCelebration() {
  const { showLevelUp, newLevel, dismissLevelUp } = useGamificationStore();
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; color: string; delay: number }>
  >([]);

  useEffect(() => {
    if (showLevelUp) {
      const colors = [
        "hsl(217 91% 60%)",
        "hsl(38 92% 50%)",
        "hsl(160 84% 39%)",
        "hsl(280 67% 60%)",
        "hsl(0 84% 60%)",
      ];
      const newParticles = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[i % colors.length],
        delay: Math.random() * 0.5,
      }));
      setParticles(newParticles);

      const timeout = setTimeout(dismissLevelUp, 5000);
      return () => clearTimeout(timeout);
    }
  }, [showLevelUp, dismissLevelUp]);

  if (!showLevelUp) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={dismissLevelUp}
    >
      {/* Confetti particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full animate-confetti pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `-5%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Celebration card */}
      <div
        className="relative animate-scale-in rounded-2xl border-2 border-primary/30 bg-card p-10 text-center shadow-2xl max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Star className="h-16 w-16 text-warning fill-warning animate-pulse" />
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-bounce" />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-2">Level Up! 🎉</h2>
        <p className="text-muted-foreground mb-1">You've reached</p>
        <p className="text-5xl font-black text-primary mb-4">
          Level {newLevel}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Keep studying to reach the next level!
        </p>

        <Button onClick={dismissLevelUp} className="w-full">
          Awesome!
        </Button>
      </div>
    </div>
  );
}
