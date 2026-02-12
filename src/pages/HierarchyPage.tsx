import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Book, Bookmark, FileText, Filter, Check, ChevronsUpDown, Trash2, Edit, Archive } from "lucide-react";
import { useStreams } from "@/hooks/useStreams";
import { useSubjects } from "@/hooks/useSubjects";
import { useChapters } from "@/hooks/useChapters";
import { useTopics } from "@/hooks/useTopics";
import { HierarchyItemForm, type HierarchyLevel } from "@/components/goals/HierarchyItemForm";
import { useGoals } from "@/hooks/useGoals";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Reusable Combobox Component for Filters
interface FilterComboboxProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    label: string;
}

function FilterCombobox({ value, onChange, options, placeholder, label }: FilterComboboxProps) {
    const [open, setOpen] = useState(false);

    // Find the label for the current value, default to placeholder if not found
    // We treat "all" as a special case or just part of options
    const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

    return (
        <div className="space-y-2 min-w-[200px] flex-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Filter className="h-3 w-3" /> {label}
            </span>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-background font-normal"
                    >
                        <span className="truncate">{selectedLabel}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                    <Command>
                        <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
                        <CommandList>
                            <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label} // Search by label
                                        onSelect={() => {
                                            onChange(option.value);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default function HierarchyPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("streams");
    const [showArchived, setShowArchived] = useState(false); // New Toggle State

    // State for Editing
    const [editingItem, setEditingItem] = useState<{
        type: HierarchyLevel;
        id: string;
        data: any;
    } | null>(null);

    // Filter State
    const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
    const [selectedGoalId, setSelectedGoalId] = useState<string>("all");
    const [selectedStreamId, setSelectedStreamId] = useState<string>("all");
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
    const [selectedChapterId, setSelectedChapterId] = useState<string>("all");

    // Reset downstream filters when upstream selection changes
    useEffect(() => {
        setSelectedGoalId("all");
    }, [selectedProjectId]);

    useEffect(() => {
        setSelectedStreamId("all");
    }, [selectedGoalId, selectedProjectId]);

    useEffect(() => {
        setSelectedSubjectId("all");
    }, [selectedStreamId, selectedGoalId, selectedProjectId]);

    useEffect(() => {
        setSelectedChapterId("all");
    }, [selectedSubjectId, selectedStreamId, selectedGoalId, selectedProjectId]);


    // Fetch all data
    const { data: projects = [] } = useProjects();
    const { data: goals = [] } = useGoals();
    const { data: streams = [], remove: deleteStream, update: updateStream, archive: archiveStream } = useStreams(null, showArchived);
    const { data: subjects = [], remove: deleteSubject, update: updateSubject, archive: archiveSubject } = useSubjects(null, undefined, showArchived);
    const { data: chapters = [], remove: deleteChapter, update: updateChapter, archive: archiveChapter } = useChapters(null, showArchived);
    const { data: topics = [], remove: deleteTopic, update: updateTopic, archive: archiveTopic, toggleComplete: toggleTopicComplete } = useTopics(null, showArchived);
    const { data: tasks = [] } = useTasks();

    // --- Derived Data & Filtering Options ---

    // 1. Available Goals
    const filteredGoalsOptions = useMemo(() => {
        if (selectedProjectId === "all") return goals;
        return goals.filter(g => g.project_id === selectedProjectId);
    }, [goals, selectedProjectId]);

    // 2. Available Streams
    const filteredStreamsOptions = useMemo(() => {
        // Start with all streams
        let options = streams;

        // Apply Goal Filter
        if (selectedGoalId !== "all") {
            options = options.filter(s => s.goal_id === selectedGoalId);
        }
        // Apply Project Filter (if no specific goal selected)
        else if (selectedProjectId !== "all") {
            const goalIds = filteredGoalsOptions.map(g => g.goal_id);
            options = options.filter(s => goalIds.includes(s.goal_id));
        }

        return options;
    }, [streams, selectedGoalId, selectedProjectId, filteredGoalsOptions]);

    // 3. Available Subjects
    const filteredSubjectsOptions = useMemo(() => {
        let options = subjects;

        // Apply Stream Filter
        if (selectedStreamId !== "all") {
            options = options.filter(s => s.stream_id === selectedStreamId);
        }
        // Apply Goal Filter (if no specific stream selected)
        else if (selectedGoalId !== "all") {
            options = options.filter(s => s.goal_id === selectedGoalId);
        }
        // Apply Project Filter (if no specific goal/stream selected)
        else if (selectedProjectId !== "all") {
            const goalIds = filteredGoalsOptions.map(g => g.goal_id);
            options = options.filter(s => goalIds.includes(s.goal_id));
        }

        return options;
    }, [subjects, selectedStreamId, selectedGoalId, selectedProjectId, filteredGoalsOptions]);

    // 4. Available Chapters
    const filteredChaptersOptions = useMemo(() => {
        let options = chapters;

        // Apply Subject Filter
        if (selectedSubjectId !== "all") {
            options = options.filter(c => c.subject_id === selectedSubjectId);
        }
        // Apply Stream/Goal/Project Filter (via subjects)
        else {
            const subjectIds = filteredSubjectsOptions.map(s => s.subject_id);
            options = options.filter(c => subjectIds.includes(c.subject_id));
        }

        return options;
    }, [chapters, selectedSubjectId, filteredSubjectsOptions]);

    // 5. Available Topics (only needed for display, not for filter options as topics is the leaf)
    const displayTopics = useMemo(() => {
        let options = topics;

        // Apply Chapter Filter
        if (selectedChapterId !== "all") {
            options = options.filter(t => t.chapter_id === selectedChapterId);
        }
        // Apply Upstream Filters (via chapters)
        else {
            const chapterIds = filteredChaptersOptions.map(c => c.chapter_id);
            options = options.filter(t => chapterIds.includes(t.chapter_id));
        }
        return options;
    }, [topics, selectedChapterId, filteredChaptersOptions]);


    // --- Display Lists (reuse filter options for lists as they represent 'everything available under current filters') ---
    const displayStreams = filteredStreamsOptions;
    const displaySubjects = filteredSubjectsOptions;
    const displayChapters = filteredChaptersOptions;


    // --- Stats Helpers ---
    const getSubjectCount = (streamId: string) => subjects.filter(s => s.stream_id === streamId).length;
    const getTopicCount = (chapterId: string) => topics.filter(t => t.chapter_id === chapterId).length;
    const getTaskCount = (topicId: string) => tasks.filter(t => t.topic_id === topicId).length;

    // --- Handlers ---
    const handleDelete = async (type: string, id: string, deleteFn: any) => {
        if (confirm(`Are you sure you want to delete this ${type}?`)) {
            try {
                await deleteFn.mutateAsync(id);
                toast.success(`${type} deleted`);
            } catch (error) {
                toast.error(`Failed to delete ${type}`);
            }
        }
    };

    const handleEdit = (type: HierarchyLevel, id: string, data: any) => {
        setEditingItem({ type, id, data });
    };

    const handleUpdate = async (values: any) => {
        if (!editingItem) return;
        const { type, id } = editingItem;

        try {
            if (type === "stream") await updateStream.mutateAsync({ id, ...values });
            else if (type === "subject") await updateSubject.mutateAsync({ id, ...values });
            else if (type === "chapter") await updateChapter.mutateAsync({ id, ...values });
            else if (type === "topic") await updateTopic.mutateAsync({ id, ...values });

            toast.success(`${type} updated`);
            setEditingItem(null);
        } catch (error) {
            toast.error(`Failed to update ${type}`);
        }
    };

    const handleArchive = async (type: string, id: string, archiveFn: any) => {
        if (confirm(`Are you sure you want to archive this ${type}?`)) {
            try {
                await archiveFn.mutateAsync(id);
                toast.success(`${type} archived`);
            } catch (error) {
                toast.error(`Failed to archive ${type}`);
            }
        }
    };

    const handleToggleComplete = async (id: string, currentStatus: boolean) => {
        try {
            await toggleTopicComplete.mutateAsync({ id, completed: !currentStatus });
            toast.success(`Topic marked ${!currentStatus ? "complete" : "incomplete"}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    // Calculate which filters to show based on active tab
    const showStreamFilter = ["subjects", "chapters", "topics"].includes(activeTab);
    const showSubjectFilter = ["chapters", "topics"].includes(activeTab);
    const showChapterFilter = ["topics"].includes(activeTab);

    // --- Prepare Options for Comboboxes ---
    const projectOptions = [
        { value: "all", label: "All Projects" },
        ...projects.map(p => ({ value: p.project_id, label: p.name }))
    ];

    const goalOptions = [
        { value: "all", label: "All Goals" },
        ...filteredGoalsOptions.map(g => ({ value: g.goal_id, label: g.name }))
    ];

    const streamOptions = [
        { value: "all", label: "All Streams" },
        ...filteredStreamsOptions.map(s => ({ value: s.stream_id, label: s.name }))
    ];

    const subjectOptions = [
        { value: "all", label: "All Subjects" },
        ...filteredSubjectsOptions.map(s => ({ value: s.subject_id, label: s.name }))
    ];

    const chapterOptions = [
        { value: "all", label: "All Chapters" },
        ...filteredChaptersOptions.map(c => ({ value: c.chapter_id, label: c.name }))
    ];


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Hierarchy Management</h1>
                    <p className="text-muted-foreground">Manage your educational structure manually or import from JSON.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate("/goals")}>
                        Go to Goals
                    </Button>
                </div>
            </div>

            {/* Global Filters Section - Responsive Flex Row */}
            <Card className="bg-muted/30">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end flex-wrap">

                    <FilterCombobox
                        label="Project"
                        placeholder="Select Project..."
                        value={selectedProjectId}
                        onChange={setSelectedProjectId}
                        options={projectOptions}
                    />

                    <FilterCombobox
                        label="Goal"
                        placeholder="Select Goal..."
                        value={selectedGoalId}
                        onChange={setSelectedGoalId}
                        options={goalOptions}
                    />

                    {showStreamFilter && (
                        <FilterCombobox
                            label="Stream"
                            placeholder="Select Stream..."
                            value={selectedStreamId}
                            onChange={setSelectedStreamId}
                            options={streamOptions}
                        />
                    )}

                    {showSubjectFilter && (
                        <FilterCombobox
                            label="Subject"
                            placeholder="Select Subject..."
                            value={selectedSubjectId}
                            onChange={setSelectedSubjectId}
                            options={subjectOptions}
                        />
                    )}


                    {showChapterFilter && (
                        <FilterCombobox
                            label="Chapter"
                            placeholder="Select Chapter..."
                            value={selectedChapterId}
                            onChange={setSelectedChapterId}
                            options={chapterOptions}
                        />
                    )}

                    <div className="flex items-center space-x-2 pb-2">
                        <input
                            type="checkbox"
                            id="showArchivedGlobal"
                            checked={showArchived}
                            onChange={(e) => setShowArchived(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="showArchivedGlobal" className="text-sm text-muted-foreground cursor-pointer select-none">
                            Show Archived
                        </label>
                    </div>

                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="streams" className="flex gap-2">
                        <Layers className="h-4 w-4" /> Streams
                    </TabsTrigger>
                    <TabsTrigger value="subjects" className="flex gap-2">
                        <Book className="h-4 w-4" /> Subjects
                    </TabsTrigger>
                    <TabsTrigger value="chapters" className="flex gap-2">
                        <Bookmark className="h-4 w-4" /> Chapters
                    </TabsTrigger>
                    <TabsTrigger value="topics" className="flex gap-2">
                        <FileText className="h-4 w-4" /> Topics
                    </TabsTrigger>
                </TabsList>

                {/* Streams Tab */}
                <TabsContent value="streams" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Streams</CardTitle>
                            <CardDescription>
                                Showing {displayStreams.length} stream(s).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                {displayStreams.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">No streams found matching criteria.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {displayStreams.map((stream) => (
                                            <div key={stream.stream_id} className={cn("flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground shadow-sm group", stream.archived && "opacity-60")}>
                                                <div>
                                                    <p className="font-medium">{stream.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Subjects: {getSubjectCount(stream.stream_id)}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit("stream", stream.stream_id, stream)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleArchive("Stream", stream.stream_id, archiveStream)}>
                                                        <Archive className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete("Stream", stream.stream_id, deleteStream)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Subjects Tab */}
                <TabsContent value="subjects" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subjects</CardTitle>
                            <CardDescription>Manage subjects (Physics, Math, Accountancy).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                {displaySubjects.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">No subjects found matching criteria.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {displaySubjects.map((sub) => (
                                            <div key={sub.subject_id} className={cn("flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground shadow-sm group", sub.archived && "opacity-60")}>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-lg">
                                                        {sub.icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium" style={{ color: sub.color ?? "inherit" }}>{sub.name}</p>
                                                        <p className="text-xs text-muted-foreground">Chapters: {sub.total_chapters}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit("subject", sub.subject_id, sub)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleArchive("Subject", sub.subject_id, archiveSubject)}>
                                                        <Archive className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete("Subject", sub.subject_id, deleteSubject)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Chapters Tab */}
                <TabsContent value="chapters" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Chapters</CardTitle>
                            <CardDescription>Manage chapters within subjects.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                {displayChapters.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">No chapters found matching criteria.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                                        {displayChapters.map((chap) => (
                                            <div key={chap.chapter_id} className={cn("flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground shadow-sm group", chap.archived && "opacity-60")}>
                                                <div>
                                                    <p className={cn("font-medium", chap.completed && "line-through text-muted-foreground")}>{chap.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Topics: {getTopicCount(chap.chapter_id)}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit("chapter", chap.chapter_id, chap)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleArchive("Chapter", chap.chapter_id, archiveChapter)}>
                                                        <Archive className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete("Chapter", chap.chapter_id, deleteChapter)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Topics Tab */}
                <TabsContent value="topics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Topics</CardTitle>
                            <CardDescription>Manage topics within chapters.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                {displayTopics.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">No topics found matching criteria.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                                        {displayTopics.map((topic) => (
                                            <div key={topic.topic_id} className={cn("flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground shadow-sm group", topic.archived && "opacity-60")}>
                                                <div>
                                                    <p className={cn("font-medium", topic.completed && "line-through text-muted-foreground")}>{topic.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Tasks: {getTaskCount(topic.topic_id)}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" onClick={() => handleToggleComplete(topic.topic_id, topic.completed)}>
                                                        <Check className={cn("h-4 w-4", topic.completed ? "text-green-500" : "text-muted-foreground")} />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit("topic", topic.topic_id, topic)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleArchive("Topic", topic.topic_id, archiveTopic)}>
                                                        <Archive className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete("Topic", topic.topic_id, deleteTopic)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {editingItem && (
                <HierarchyItemForm
                    open={!!editingItem}
                    onOpenChange={(open) => !open && setEditingItem(null)}
                    level={editingItem.type}
                    defaultValues={editingItem.data}
                    isEditing={true}
                    onSubmit={handleUpdate}
                />
            )}
        </div>
    );
}
