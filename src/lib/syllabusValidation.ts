import { z } from "zod";

// --- Zod Schemas for Strict Validation ---

const TopicSchema = z.object({
    name: z.string().min(1, "Topic name is required"),
    weightage: z.number().min(0).max(100).optional().default(0),
    difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
    completed: z.boolean().optional().default(false),
});

const ChapterSchema = z.object({
    name: z.string().min(1, "Chapter name is required"),
    weightage: z.number().min(0).max(100).optional().default(0),
    topics: z.array(TopicSchema).optional().default([]),
});

const SubjectSchema = z.object({
    name: z.string().min(1, "Subject name is required"),
    weightage: z.number().min(0).max(100).optional().default(0),
    icon: z.string().optional(),
    color: z.string().optional(),
    chapters: z.array(ChapterSchema).optional().default([]),
});

const StreamSchema = z.object({
    name: z.string().min(1, "Stream name is required"),
    weightage: z.number().min(0).max(100).optional().default(0),
    subjects: z.array(SubjectSchema).optional().default([]),
});

// Goal can contain Streams OR directly Subjects (if no streams used)
const GoalSchema = z.object({
    name: z.string().min(1, "Goal name is required"),
    description: z.string().optional(),
    start_date: z.string().optional(), // ISO Date string
    end_date: z.string().optional(),   // ISO Date string
    target_date: z.string().optional(),
    streams: z.array(StreamSchema).optional().default([]),
    subjects: z.array(SubjectSchema).optional().default([]), // For direct subjects
});

export type ImportGoal = z.infer<typeof GoalSchema>;
export type ImportStream = z.infer<typeof StreamSchema>;
export type ImportSubject = z.infer<typeof SubjectSchema>;
export type ImportChapter = z.infer<typeof ChapterSchema>;
export type ImportTopic = z.infer<typeof TopicSchema>;

export interface ValidationError {
    path: string; // e.g., "Goal > Science Stream > Physics"
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    data?: ImportGoal; // The parsed/cleaned data
    missingDates: boolean; // True if start/end dates are missing
}

// Helper to recursively unwrap array goal
function unwrapGoal(data: any): any {
    if (Array.isArray(data)) {
        if (data.length === 0) return {};
        return unwrapGoal(data[0]);
    }
    return data;
}

// --- Validation Logic ---

export function validateSyllabus(jsonData: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Recursively unwrap if wrapped in [ ... ]
    const coreData = unwrapGoal(jsonData);

    // 1. Structural Validation via Zod
    const result = GoalSchema.safeParse(coreData);

    if (!result.success) {
        result.error.errors.forEach(err => {
            errors.push({
                path: err.path.join(" > "),
                message: err.message
            });
        });
        return { isValid: false, errors, missingDates: false };
    }

    const goal = result.data;

    // 2. Logic Validation (Weightages & Hierarchy Rules)

    // Validate Goal has either Streams or Subjects, not both mixed usually (but structure allow empty)
    if (goal.streams.length === 0 && goal.subjects.length === 0) {
        errors.push({ path: "Goal", message: "Goal must have at least one Stream or Subject." });
    }

    // Helper to validate weightage sum
    const validateWeightage = (items: { weightage?: number; name?: string }[], context: string) => {
        if (!items || items.length === 0) return;
        const total = items.reduce((sum, item) => sum + (item.weightage || 0), 0);

        // We only strictly enforce that it doesn't exceed 100%
        if (total > 100.1) {
            errors.push({
                path: context,
                message: `Total weightage is ${total.toFixed(1)}% (cannot exceed 100%).`
            });
        }
    };
    ;

    // --- Recursive Validation ---

    // Check Streams (if any)
    if (goal.streams.length > 0) {
        validateWeightage(goal.streams, `Goal: ${goal.name}`);

        goal.streams.forEach(stream => {
            const streamPath = `Stream: ${stream.name}`;
            validateWeightage(stream.subjects, streamPath);

            stream.subjects.forEach(subject => {
                const subjectPath = `${streamPath} > Subject: ${subject.name}`;
                validateWeightage(subject.chapters, subjectPath);

                subject.chapters.forEach(chapter => {
                    const chapterPath = `${subjectPath} > Chapter: ${chapter.name}`;
                    validateWeightage(chapter.topics, chapterPath);
                });
            });
        });
    }

    // Check Direct Subjects (if any)
    if (goal.subjects.length > 0) {
        validateWeightage(goal.subjects, `Goal: ${goal.name}`);

        goal.subjects.forEach(subject => {
            const subjectPath = `Subject: ${subject.name}`;
            validateWeightage(subject.chapters, subjectPath);

            subject.chapters.forEach(chapter => {
                const chapterPath = `${subjectPath} > Chapter: ${chapter.name}`;
                validateWeightage(chapter.topics, chapterPath);
            });
        });
    }

    // 3. Check for Missing Dates
    const missingDates = !goal.start_date || !goal.end_date;

    return {
        isValid: errors.length === 0,
        errors,
        data: goal,
        missingDates
    };
}
