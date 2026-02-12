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
import { Send } from "lucide-react";
import type { Feedback } from "@/hooks/useFeedback";

interface GeneralFeedbackFormProps {
    onSubmit: (data: Partial<Feedback>) => void;
    isSubmitting: boolean;
}

const CATEGORIES = [
    "General Experience",
    "UI/UX",
    "Performance",
    "Documentation  ",
    "Content",
    "Other",
];

export function GeneralFeedbackForm({ onSubmit, isSubmitting }: GeneralFeedbackFormProps) {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            return;
        }

        onSubmit({
            type: "feedback",
            title: title.trim(),
            category: category || null,
            description: description.trim(),
            status: "submitted",
        });

        // Reset form
        setTitle("");
        setCategory("");
        setDescription("");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="feedback-title">Title *</Label>
                <Input
                    id="feedback-title"
                    placeholder="Brief summary of your feedback..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="feedback-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="feedback-category">
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
                <Label htmlFor="feedback-description">Description *</Label>
                <Textarea
                    id="feedback-description"
                    placeholder="Share your thoughts, suggestions, or general feedback..."
                    className="min-h-[150px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                    "Sending..."
                ) : (
                    <>
                        <Send className="mr-2 h-4 w-4" /> Submit Feedback
                    </>
                )}
            </Button>
        </form>
    );
}
