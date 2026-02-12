import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  Archive,
  Trash2,
  Scale,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStreams } from "@/hooks/useStreams";
import { useSubjects } from "@/hooks/useSubjects";
import { useChapters } from "@/hooks/useChapters";
import { useTopics } from "@/hooks/useTopics";
import { WeightageBar, autoBalanceWeightage } from "./WeightageBar";
import { HierarchyItemForm } from "./HierarchyItemForm";
import { ArchiveConfirmDialog } from "./ArchiveConfirmDialog";
import { toast } from "sonner";
import type { Stream, Subject, Chapter, Topic } from "@/types/database";

// ── Topic Row ─────────────────────────────────────────────
function TopicRow({ topic, onEdit, onArchive }: {
  topic: Topic;
  onEdit: (t: Topic) => void;
  onArchive: (id: string) => void;
}) {
  const difficultyColors = {
    easy: "bg-success/10 text-success",
    medium: "bg-warning/10 text-warning",
    hard: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="flex items-center gap-2 py-1.5 pl-2 pr-1 rounded-md hover:bg-muted/50 group">
      <div className="shrink-0">
        {topic.completed ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <span
        className={cn(
          "flex-1 text-sm truncate",
          topic.completed && "line-through text-muted-foreground"
        )}
      >
        {topic.name}
      </span>
      <Badge variant="outline" className={cn("text-xs", difficultyColors[topic.difficulty])}>
        {topic.difficulty}
      </Badge>
      {topic.weightage > 0 && (
        <span className="text-xs text-muted-foreground">{topic.weightage}%</span>
      )}
      <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onEdit(topic)}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onArchive(topic.topic_id)}>
          <Archive className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// ── Chapter Section ───────────────────────────────────────
function ChapterSection({ chapter, onEdit, onArchive }: {
  chapter: Chapter;
  onEdit: (c: Chapter) => void;
  onArchive: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [addTopicOpen, setAddTopicOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<{ id: string; name: string } | null>(null);
  const { data: topics = [] } = useTopics(expanded ? chapter.chapter_id : undefined);
  const topicsHook = useTopics(chapter.chapter_id);

  const totalWeightage = topics.reduce((s, t) => s + Number(t.weightage), 0);

  return (
    <div className="border-l-2 border-muted ml-3 pl-3">
      <div className="flex items-center gap-1 py-1 group">
        <button onClick={() => setExpanded(!expanded)} className="shrink-0">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <div className="shrink-0">
          {chapter.completed ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <span
          className={cn(
            "flex-1 text-sm font-medium truncate cursor-pointer",
            chapter.completed && "line-through text-muted-foreground"
          )}
          onClick={() => setExpanded(!expanded)}
        >
          {chapter.chapter_number ? `Ch ${chapter.chapter_number}: ` : ""}
          {chapter.name}
        </span>
        {chapter.weightage > 0 && (
          <span className="text-xs text-muted-foreground">{chapter.weightage}%</span>
        )}
        <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setAddTopicOpen(true)}>
            <Plus className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onEdit(chapter)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onArchive(chapter.chapter_id)}>
            <Archive className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="ml-4 mt-1 space-y-0.5">
          {topics.length > 0 && (
            <WeightageBar
              items={topics.map((t) => ({ name: t.name, weightage: Number(t.weightage) }))}
              className="mb-2"
            />
          )}
          {topics.map((topic) => (
            <TopicRow
              key={topic.topic_id}
              topic={topic}
              onEdit={setEditingTopic}
              onArchive={(id) => {
                const t = topics.find((x) => x.topic_id === id);
                if (t) setArchiveTarget({ id, name: t.name });
              }}
            />
          ))}
          {topics.length === 0 && (
            <p className="text-xs text-muted-foreground py-2 pl-2">
              No topics yet.{" "}
              <button className="text-primary hover:underline" onClick={() => setAddTopicOpen(true)}>
                Add one
              </button>
            </p>
          )}
        </div>
      )}

      <HierarchyItemForm
        open={addTopicOpen}
        onOpenChange={setAddTopicOpen}
        level="topic"
        currentWeightageTotal={totalWeightage}
        onSubmit={(values) => {
          topicsHook.create.mutate(
            { ...values, chapter_id: chapter.chapter_id },
            { onError: (e: any) => toast.error(e.message) }
          );
        }}
      />

      {editingTopic && (
        <HierarchyItemForm
          open={!!editingTopic}
          onOpenChange={() => setEditingTopic(null)}
          level="topic"
          isEditing
          defaultValues={editingTopic}
          currentWeightageTotal={totalWeightage - Number(editingTopic.weightage)}
          onSubmit={(values) => {
            topicsHook.update.mutate(
              { id: editingTopic.topic_id, ...values },
              { onError: (e: any) => toast.error(e.message) }
            );
            setEditingTopic(null);
          }}
        />
      )}

      <ArchiveConfirmDialog
        open={!!archiveTarget}
        onOpenChange={() => setArchiveTarget(null)}
        itemName={archiveTarget?.name ?? ""}
        onConfirm={() => {
          if (archiveTarget) {
            topicsHook.archive.mutate(archiveTarget.id);
            setArchiveTarget(null);
          }
        }}
      />
    </div>
  );
}

// ── Subject Section ───────────────────────────────────────
function SubjectSection({ subject, onEdit, onArchive }: {
  subject: Subject;
  onEdit: (s: Subject) => void;
  onArchive: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [addChapterOpen, setAddChapterOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<{ id: string; name: string } | null>(null);
  const { data: chapters = [] } = useChapters(expanded ? subject.subject_id : undefined);
  const chaptersHook = useChapters(subject.subject_id);

  const totalWeightage = chapters.reduce((s, c) => s + Number(c.weightage), 0);

  return (
    <div className="border-l-2 ml-3 pl-3" style={{ borderColor: subject.color ?? "hsl(var(--muted))" }}>
      <div className="flex items-center gap-1 py-1.5 group">
        <button onClick={() => setExpanded(!expanded)} className="shrink-0">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <span className="text-sm" style={{ color: subject.color ?? undefined }}>
          {subject.icon}
        </span>
        <span
          className="flex-1 text-sm font-medium truncate cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          {subject.name}
        </span>
        {subject.weightage > 0 && (
          <span className="text-xs text-muted-foreground">{subject.weightage}%</span>
        )}
        <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setAddChapterOpen(true)}>
            <Plus className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onEdit(subject)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onArchive(subject.subject_id)}>
            <Archive className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-1 space-y-0.5">
          {chapters.length > 0 && (
            <>
              <WeightageBar
                items={chapters.map((c) => ({ name: c.name, weightage: Number(c.weightage) }))}
                className="mb-2 ml-3"
              />
              <div className="flex justify-end mr-1 mb-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs gap-1"
                  onClick={() => {
                    const balanced = autoBalanceWeightage(
                      chapters.map((c) => ({ id: c.chapter_id, weightage: Number(c.weightage) }))
                    );
                    balanced.forEach((b) => {
                      chaptersHook.update.mutate({ id: b.id, weightage: b.weightage });
                    });
                    toast.success("Weightage auto-balanced");
                  }}
                >
                  <Scale className="h-3 w-3" /> Auto-Balance
                </Button>
              </div>
            </>
          )}
          {chapters.map((chapter) => (
            <ChapterSection
              key={chapter.chapter_id}
              chapter={chapter}
              onEdit={setEditingChapter}
              onArchive={(id) => {
                const c = chapters.find((x) => x.chapter_id === id);
                if (c) setArchiveTarget({ id, name: c.name });
              }}
            />
          ))}
          {chapters.length === 0 && (
            <p className="text-xs text-muted-foreground py-2 pl-6">
              No chapters yet.{" "}
              <button className="text-primary hover:underline" onClick={() => setAddChapterOpen(true)}>
                Add one
              </button>
            </p>
          )}
        </div>
      )}

      <HierarchyItemForm
        open={addChapterOpen}
        onOpenChange={setAddChapterOpen}
        level="chapter"
        currentWeightageTotal={totalWeightage}
        onSubmit={(values) => {
          chaptersHook.create.mutate(
            { ...values, subject_id: subject.subject_id },
            { onError: (e: any) => toast.error(e.message) }
          );
        }}
      />

      {editingChapter && (
        <HierarchyItemForm
          open={!!editingChapter}
          onOpenChange={() => setEditingChapter(null)}
          level="chapter"
          isEditing
          defaultValues={editingChapter}
          currentWeightageTotal={totalWeightage - Number(editingChapter.weightage)}
          onSubmit={(values) => {
            chaptersHook.update.mutate(
              { id: editingChapter.chapter_id, ...values },
              { onError: (e: any) => toast.error(e.message) }
            );
            setEditingChapter(null);
          }}
        />
      )}

      <ArchiveConfirmDialog
        open={!!archiveTarget}
        onOpenChange={() => setArchiveTarget(null)}
        itemName={archiveTarget?.name ?? ""}
        onConfirm={() => {
          if (archiveTarget) {
            chaptersHook.archive.mutate(archiveTarget.id);
            setArchiveTarget(null);
          }
        }}
      />
    </div>
  );
}

// ── Stream Section ────────────────────────────────────────
function StreamSection({ stream, goalId, onEdit, onArchive }: {
  stream: Stream;
  goalId: string;
  onEdit: (s: Stream) => void;
  onArchive: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<{ id: string; name: string } | null>(null);
  const { data: subjects = [] } = useSubjects(expanded ? goalId : undefined, expanded ? stream.stream_id : undefined);
  const subjectsHook = useSubjects(goalId, stream.stream_id);

  const totalWeightage = subjects.reduce((s, sub) => s + Number(sub.weightage), 0);

  return (
    <div className="border-l-2 ml-2 pl-3" style={{ borderColor: stream.color ?? "hsl(var(--primary))" }}>
      <div className="flex items-center gap-1 py-1.5 group">
        <button onClick={() => setExpanded(!expanded)} className="shrink-0">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <span
          className="flex-1 text-sm font-semibold truncate cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          {stream.name}
        </span>
        {stream.weightage > 0 && (
          <Badge variant="secondary" className="text-xs">{stream.weightage}%</Badge>
        )}
        <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setAddSubjectOpen(true)}>
            <Plus className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onEdit(stream)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onArchive(stream.stream_id)}>
            <Archive className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-1 space-y-0.5">
          {subjects.length > 0 && (
            <WeightageBar
              items={subjects.map((s) => ({ name: s.name, weightage: Number(s.weightage) }))}
              className="mb-2"
            />
          )}
          {subjects.map((subject) => (
            <SubjectSection
              key={subject.subject_id}
              subject={subject}
              onEdit={setEditingSubject}
              onArchive={(id) => {
                const s = subjects.find((x) => x.subject_id === id);
                if (s) setArchiveTarget({ id, name: s.name });
              }}
            />
          ))}
          {subjects.length === 0 && (
            <p className="text-xs text-muted-foreground py-2 pl-4">
              No subjects yet.{" "}
              <button className="text-primary hover:underline" onClick={() => setAddSubjectOpen(true)}>
                Add one
              </button>
            </p>
          )}
        </div>
      )}

      <HierarchyItemForm
        open={addSubjectOpen}
        onOpenChange={setAddSubjectOpen}
        level="subject"
        currentWeightageTotal={totalWeightage}
        onSubmit={(values) => {
          subjectsHook.create.mutate(
            { ...values, goal_id: goalId, stream_id: stream.stream_id },
            { onError: (e: any) => toast.error(e.message) }
          );
        }}
      />

      {editingSubject && (
        <HierarchyItemForm
          open={!!editingSubject}
          onOpenChange={() => setEditingSubject(null)}
          level="subject"
          isEditing
          defaultValues={editingSubject}
          currentWeightageTotal={totalWeightage - Number(editingSubject.weightage)}
          onSubmit={(values) => {
            subjectsHook.update.mutate(
              { id: editingSubject.subject_id, ...values },
              { onError: (e: any) => toast.error(e.message) }
            );
            setEditingSubject(null);
          }}
        />
      )}

      <ArchiveConfirmDialog
        open={!!archiveTarget}
        onOpenChange={() => setArchiveTarget(null)}
        itemName={archiveTarget?.name ?? ""}
        onConfirm={() => {
          if (archiveTarget) {
            subjectsHook.archive.mutate(archiveTarget.id);
            setArchiveTarget(null);
          }
        }}
      />
    </div>
  );
}

// ── Main HierarchyTree ───────────────────────────────────
interface HierarchyTreeProps {
  goalId: string;
}

export function HierarchyTree({ goalId }: HierarchyTreeProps) {
  const { data: streams = [] } = useStreams(goalId);
  const { data: directSubjects = [] } = useSubjects(goalId, null);
  const streamsHook = useStreams(goalId);
  const directSubjectsHook = useSubjects(goalId, null);

  const [addStreamOpen, setAddStreamOpen] = useState(false);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<{
    id: string;
    name: string;
    type: "stream" | "subject";
  } | null>(null);

  const streamWeightageTotal = streams.reduce((s, st) => s + Number(st.weightage), 0);
  const directSubjectWeightageTotal = directSubjects.reduce((s, sub) => s + Number(sub.weightage), 0);

  return (
    <div className="space-y-3 pt-2">
      {/* Streams section */}
      {streams.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Streams
            </span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs gap-1"
                onClick={() => {
                  const balanced = autoBalanceWeightage(
                    streams.map((s) => ({ id: s.stream_id, weightage: Number(s.weightage) }))
                  );
                  balanced.forEach((b) => {
                    streamsHook.update.mutate({ id: b.id, weightage: b.weightage });
                  });
                  toast.success("Stream weightage auto-balanced");
                }}
              >
                <Scale className="h-3 w-3" /> Auto-Balance
              </Button>
              <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => setAddStreamOpen(true)}>
                <Plus className="h-3 w-3" /> Stream
              </Button>
            </div>
          </div>
          <WeightageBar
            items={streams.map((s) => ({ name: s.name, weightage: Number(s.weightage) }))}
            className="mb-2"
          />
          {streams.map((stream) => (
            <StreamSection
              key={stream.stream_id}
              stream={stream}
              goalId={goalId}
              onEdit={setEditingStream}
              onArchive={(id) => {
                const s = streams.find((x) => x.stream_id === id);
                if (s) setArchiveTarget({ id, name: s.name, type: "stream" });
              }}
            />
          ))}
        </div>
      )}

      {/* Direct subjects (no stream) */}
      {directSubjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Subjects
            </span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs gap-1"
                onClick={() => {
                  const balanced = autoBalanceWeightage(
                    directSubjects.map((s) => ({ id: s.subject_id, weightage: Number(s.weightage) }))
                  );
                  balanced.forEach((b) => {
                    directSubjectsHook.update.mutate({ id: b.id, weightage: b.weightage });
                  });
                  toast.success("Subject weightage auto-balanced");
                }}
              >
                <Scale className="h-3 w-3" /> Auto-Balance
              </Button>
              <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => setAddSubjectOpen(true)}>
                <Plus className="h-3 w-3" /> Subject
              </Button>
            </div>
          </div>
          <WeightageBar
            items={directSubjects.map((s) => ({ name: s.name, weightage: Number(s.weightage) }))}
            className="mb-2"
          />
          {directSubjects.map((subject) => (
            <SubjectSection
              key={subject.subject_id}
              subject={subject}
              onEdit={setEditingSubject}
              onArchive={(id) => {
                const s = directSubjects.find((x) => x.subject_id === id);
                if (s) setArchiveTarget({ id, name: s.name, type: "subject" });
              }}
            />
          ))}
        </div>
      )}

      {/* Empty state + quick add buttons */}
      {streams.length === 0 && directSubjects.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">
            Start building your study hierarchy
          </p>
          <div className="flex justify-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setAddStreamOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Stream
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAddSubjectOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Subject
            </Button>
          </div>
        </div>
      )}

      {/* Only show add buttons if there are already items */}
      {(streams.length > 0 || directSubjects.length > 0) && (
        <div className="flex gap-2 pt-1">
          {streams.length === 0 && (
            <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => setAddStreamOpen(true)}>
              <Plus className="h-3 w-3" /> Add Stream
            </Button>
          )}
          {directSubjects.length === 0 && streams.length === 0 && (
            <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => setAddSubjectOpen(true)}>
              <Plus className="h-3 w-3" /> Add Subject
            </Button>
          )}
        </div>
      )}

      {/* Dialogs */}
      <HierarchyItemForm
        open={addStreamOpen}
        onOpenChange={setAddStreamOpen}
        level="stream"
        currentWeightageTotal={streamWeightageTotal}
        onSubmit={(values) => {
          streamsHook.create.mutate(
            { ...values, goal_id: goalId },
            { onError: (e: any) => toast.error(e.message) }
          );
        }}
      />

      <HierarchyItemForm
        open={addSubjectOpen}
        onOpenChange={setAddSubjectOpen}
        level="subject"
        currentWeightageTotal={directSubjectWeightageTotal}
        onSubmit={(values) => {
          directSubjectsHook.create.mutate(
            { ...values, goal_id: goalId, stream_id: null },
            { onError: (e: any) => toast.error(e.message) }
          );
        }}
      />

      {editingStream && (
        <HierarchyItemForm
          open={!!editingStream}
          onOpenChange={() => setEditingStream(null)}
          level="stream"
          isEditing
          defaultValues={editingStream}
          currentWeightageTotal={streamWeightageTotal - Number(editingStream.weightage)}
          onSubmit={(values) => {
            streamsHook.update.mutate(
              { id: editingStream.stream_id, ...values },
              { onError: (e: any) => toast.error(e.message) }
            );
            setEditingStream(null);
          }}
        />
      )}

      {editingSubject && (
        <HierarchyItemForm
          open={!!editingSubject}
          onOpenChange={() => setEditingSubject(null)}
          level="subject"
          isEditing
          defaultValues={editingSubject}
          currentWeightageTotal={directSubjectWeightageTotal - Number(editingSubject.weightage)}
          onSubmit={(values) => {
            directSubjectsHook.update.mutate(
              { id: editingSubject.subject_id, ...values },
              { onError: (e: any) => toast.error(e.message) }
            );
            setEditingSubject(null);
          }}
        />
      )}

      <ArchiveConfirmDialog
        open={!!archiveTarget}
        onOpenChange={() => setArchiveTarget(null)}
        itemName={archiveTarget?.name ?? ""}
        onConfirm={() => {
          if (!archiveTarget) return;
          if (archiveTarget.type === "stream") {
            streamsHook.archive.mutate(archiveTarget.id);
          } else {
            directSubjectsHook.archive.mutate(archiveTarget.id);
          }
          setArchiveTarget(null);
        }}
      />
    </div>
  );
}
