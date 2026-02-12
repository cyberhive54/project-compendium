import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Upload, AlertCircle, CheckCircle2, FileJson, X, ClipboardPaste } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { validateSyllabus, type ImportGoal, type ValidationError } from "@/lib/syllabusValidation";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parseISO } from "date-fns";

export function SyllabusImportSettings() {
    const { user } = useAuth();
    const [jsonInput, setJsonInput] = useState("");
    const [importing, setImporting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [parsedData, setParsedData] = useState<ImportGoal | null>(null);
    const [showDateModal, setShowDateModal] = useState(false);
    const [missingDates, setMissingDates] = useState({ start: "", end: "" });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState("upload");

    // --- File Upload ---
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/json" && !file.name.endsWith(".json")) {
            toast.error("Please upload a valid JSON file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJsonInput(content);
            validateInput(content);
        };
        reader.readAsText(file);
    };

    // --- Validation ---
    const validateInput = (input: string) => {
        try {
            if (!input.trim()) {
                setValidationErrors([]);
                setParsedData(null);
                return;
            }
            const data = JSON.parse(input);
            const result = validateSyllabus(data);

            if (result.isValid) {
                setValidationErrors([]);
                setParsedData(result.data as ImportGoal);
            } else {
                setValidationErrors(result.errors);
                setParsedData(null); // Invalid data shouldn't be importable
            }
        } catch (err) {
            setValidationErrors([{ path: "JSON Parse", message: "Invalid JSON syntax." }]);
            setParsedData(null);
        }
    };

    // --- Import Process ---
    const initiateImport = () => {
        if (!parsedData) return;

        // Check for missing dates in the parsed data OR if they were already provided via modal
        if (!parsedData.start_date || !parsedData.end_date) {
            setShowDateModal(true);
            return;
        }

        executeImport();
    };

    const handleDateSubmit = () => {
        if (!missingDates.start || !missingDates.end) {
            toast.error("Both start and end dates are required.");
            return;
        }
        if (!parsedData) return;

        const updatedData = {
            ...parsedData,
            start_date: missingDates.start,
            end_date: missingDates.end
        };

        setShowDateModal(false);
        setParsedData(updatedData); // Update state before calling executeImport
        executeImport();
    };

    const executeImport = async () => {
        if (!parsedData || !user) return;
        setImporting(true);

        // --- Helper Functions ---
        // Helper to create subject hierarchy
        const createSubjectHierarchy = async (parentGoalId: string, subjectData: any, streamId: string | null = null) => {
            const { data: subject, error } = await supabase
                .from("subjects")
                .insert({
                    goal_id: parentGoalId,
                    stream_id: streamId,
                    name: subjectData.name,
                    weightage: subjectData.weightage || 0,
                    color: subjectData.color,
                    icon: subjectData.icon
                })
                .select()
                .single();

            if (error) throw error;
            if (!subject) return;

            // Create Chapters
            if (subjectData.chapters && Array.isArray(subjectData.chapters)) {
                for (const chapterData of subjectData.chapters) {
                    const { data: chapter, error: chapError } = await supabase
                        .from("chapters")
                        .insert({
                            subject_id: subject.subject_id,
                            name: chapterData.name,
                            weightage: chapterData.weightage || 0,
                            completed: false
                        })
                        .select()
                        .single();

                    if (chapError) throw chapError;
                    if (!chapter) continue;

                    // Create Topics
                    if (chapterData.topics && Array.isArray(chapterData.topics)) {
                        const topicsToInsert = chapterData.topics.map((t: any) => ({
                            chapter_id: chapter.chapter_id,
                            name: t.name,
                            difficulty: t.difficulty || "medium",
                            weightage: t.weightage || 0,
                            completed: false
                        }));

                        const { error: topicError } = await supabase
                            .from("topics")
                            .insert(topicsToInsert);

                        if (topicError) throw topicError;
                    }
                }
            }
        };

        // Helper for streams
        const createStreamHierarchy = async (parentGoalId: string, streamData: any) => {
            const { data: stream, error } = await supabase
                .from("streams")
                .insert({
                    goal_id: parentGoalId,
                    name: streamData.name,
                    weightage: streamData.weightage || 0
                })
                .select()
                .single();

            if (error) throw error;

            if (streamData.subjects && Array.isArray(streamData.subjects)) {
                for (const subj of streamData.subjects) {
                    await createSubjectHierarchy(parentGoalId, subj, stream.stream_id);
                }
            }
        };
        // --- End Helper Functions ---

        try {
            const data = parsedData;

            // 1. Check for existing goal with same name
            const { data: existingGoal } = await supabase
                .from("goals")
                .select("goal_id")
                .eq("user_id", user.id)
                .eq("name", data.name)
                .maybeSingle();

            let goalName = data.name;
            if (existingGoal) {
                // Determine uniqueness strategy: Append timestamp
                const timestamp = new Date().toISOString().slice(0, 19).replace(/[^0-9]/g, "");
                goalName = `${data.name} (${timestamp})`;
                toast.info(`Goal name "${data.name}" exists. Renamed to "${goalName}" to avoid conflict.`);
            }

            // 2. Create Goal
            const { data: goalData, error: goalError } = await supabase
                .from("goals")
                .insert({
                    user_id: user.id,
                    name: goalName,
                    description: data.description,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    target_date: data.target_date || data.end_date,
                    goal_type: "custom"
                })
                .select()
                .single();

            if (goalError) throw goalError;

            // 3. Create Child Hierarchy (Streams or Subjects)
            if (data.streams && data.streams.length > 0) {
                for (const stream of data.streams) {
                    await createStreamHierarchy(goalData.goal_id, stream);
                }
            } else if (data.subjects && data.subjects.length > 0) {
                // Direct subjects under goal (no streams)
                for (const subject of data.subjects) {
                    await createSubjectHierarchy(goalData.goal_id, subject, null);
                }
            }

            toast.success("Syllabus imported successfully!");
            setJsonInput("");
            setParsedData(null);
            setValidationErrors([]);
        } catch (error: any) {
            console.error("Import error:", error);
            toast.error(error.message || "Failed to import syllabus");
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold tracking-tight">Import Syllabus</h2>
                <div className="flex justify-between items-start gap-4">
                    <p className="text-muted-foreground">
                        Upload a JSON file or paste your syllabus structure to bulk create your study plan.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => window.open("/admin/syllabus/docs", "_blank")}>
                        View Documentation
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Syllabus JSON</CardTitle>
                    <CardDescription>
                        Choose how to provide your syllabus data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload" className="gap-2">
                                <Upload className="h-4 w-4" /> Upload File
                            </TabsTrigger>
                            <TabsTrigger value="paste" className="gap-2">
                                <ClipboardPaste className="h-4 w-4" /> Paste JSON
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="pt-4">
                            <div
                                className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors h-[300px]"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".json"
                                    onChange={handleFileUpload}
                                />
                                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                                <p className="text-lg font-medium">Click to upload JSON file</p>
                                <p className="text-sm text-muted-foreground mt-2">Supported format: .json</p>
                                {parsedData && activeTab === 'upload' && (
                                    <div className="mt-4 flex items-center text-green-600 gap-2">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <span className="font-medium">File Loaded Successfully</span>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="paste" className="pt-4">
                            <Textarea
                                placeholder='{ "name": "My Goal", "streams": [...] }'
                                className="font-mono h-[300px]"
                                value={jsonInput}
                                onChange={(e) => {
                                    setJsonInput(e.target.value);
                                    validateInput(e.target.value);
                                }}
                            />
                        </TabsContent>
                    </Tabs>

                    {/* Validation/Preview Section (Shared) */}
                    {(parsedData || validationErrors.length > 0 || jsonInput.trim()) && (
                        <div className="rounded-md border p-4 mt-4">
                            {validationErrors.length > 0 ? (
                                <div className="space-y-3">
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Validation Errors</AlertTitle>
                                        <AlertDescription>
                                            Please fix the following {validationErrors.length} errors.
                                        </AlertDescription>
                                    </Alert>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-destructive max-h-[200px] overflow-y-auto">
                                        {validationErrors.map((err, idx) => (
                                            <li key={idx}>
                                                <span className="font-semibold">{err.path}:</span> {err.message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : parsedData ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-green-600">
                                        <CheckCircle2 className="h-8 w-8" />
                                        <div>
                                            <h3 className="font-medium">Valid Syllabus Structure</h3>
                                            <p className="text-sm text-muted-foreground">Ready to import "{parsedData.name}"</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground text-right">
                                        <p>Streams: {parsedData.streams?.length || 0}</p>
                                        <p>Subjects: {
                                            (parsedData.subjects?.length || 0) +
                                            (parsedData.streams?.reduce((acc, s) => acc + (s.subjects?.length || 0), 0) || 0)
                                        }</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="default"
                            onClick={initiateImport}
                            disabled={!parsedData || validationErrors.length > 0 || importing}
                        >
                            {importing ? "Importing..." : "Import Syllabus"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showDateModal} onOpenChange={setShowDateModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Missing Goal Dates</DialogTitle>
                        <DialogDescription>
                            The imported goal is missing mandatory dates. Please provide them to continue.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="start-date" className="text-right">
                                Start Date
                            </Label>
                            <div className="col-span-3">
                                <DatePicker
                                    date={missingDates.start ? parseISO(missingDates.start) : undefined}
                                    onSelect={(d) => setMissingDates(prev => ({ ...prev, start: d ? format(d, "yyyy-MM-dd") : "" }))}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="end-date" className="text-right">
                                End Date
                            </Label>
                            <div className="col-span-3">
                                <DatePicker
                                    date={missingDates.end ? parseISO(missingDates.end) : undefined}
                                    onSelect={(d) => setMissingDates(prev => ({ ...prev, end: d ? format(d, "yyyy-MM-dd") : "" }))}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDateModal(false)}>Cancel</Button>
                        <Button onClick={handleDateSubmit}>Continue Import</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
