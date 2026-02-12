import { useState } from "react";
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
import { Lightbulb } from "lucide-react";
import type { Feedback } from "@/hooks/useFeedback";

interface FeatureRequestFormProps {
    onSubmit: (data: Partial<Feedback>) => void;
    isSubmitting: boolean;
}

const CATEGORIES = [
    "New Feature",
    "Enhancement",
    "Integration",
    "Automation",
    "Analytics",
    "Mobile",
    "Other",
];

export function FeatureRequestForm({ onSubmit, isSubmitting }: FeatureRequestFormProps) {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [problem, setProblem] = useState("");
    const [solution, setSolution] = useState("");
    const [useCase, setUseCase] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !problem.trim()) {
            return;
        }

        // Combine all parts into description
        const description = `**Problem:**\n${problem.trim()}\n\n${solution.trim() ? `**Proposed Solution:**\n${solution.trim()}\n\n` : ""
            }${useCase.trim() ? `**Use Case:**\n${useCase.trim()}` : ""}`;

        onSubmit({
            type: "feature",
            title: title.trim(),
            category: category || null,
            description,
            status: "submitted",
        });

        // Reset form
        setTitle("");
        setCategory("");
        setProblem("");
        setSolution("");
        setUseCase("");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="feature-title">Feature Title *</Label>
                <Input
                    id="feature-title"
                    placeholder="What feature would you like to see?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="feature-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="feature-category">
                        <SelectValue placeholder="Select a category (optional)" />
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

            <div className="space-y-2">
                <Label htmlFor="feature-problem">Problem / Need *</Label>
                <Textarea
                    id="feature-problem"
                    placeholder="What problem does this solve? What need does it address?"
                    className="min-h-[100px]"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    required
                />
                <p className="text-xs text-muted-foreground">
                    Describe the problem or limitation you're experiencing
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="feature-solution">Proposed Solution (optional)</Label>
                <Textarea
                    id="feature-solution"
                    placeholder="How do you envision this feature working?"
                    className="min-h-[100px]"
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                    Share your ideas on how this could be implemented
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="feature-usecase">Use Case (optional)</Label>
                <Textarea
                    id="feature-usecase"
                    placeholder="Describe a specific scenario where you'd use this feature..."
                    className="min-h-[80px]"
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                    Help us understand how you would use this feature
                </p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                    "Sending..."
                ) : (
                    <>
                        <Lightbulb className="mr-2 h-4 w-4" /> Submit Feature Request
                    </>
                )}
            </Button>
        </form>
    );
}
