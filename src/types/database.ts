// Database types matching SQL schemas

export interface Project {
  project_id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  goal_id: string;
  user_id: string;
  project_id: string | null;
  name: string;
  description: string | null;
  goal_type: "board" | "competitive" | "semester" | "custom";
  target_date: string | null;
  color: string;
  icon: string;
  weightage_enabled: boolean;
  archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Stream {
  stream_id: string;
  goal_id: string;
  name: string;
  weightage: number;
  color: string | null;
  archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  subject_id: string;
  goal_id: string;
  stream_id: string | null;
  name: string;
  weightage: number;
  color: string | null;
  icon: string;
  total_chapters: number;
  completed_chapters: number;
  archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  chapter_id: string;
  subject_id: string;
  name: string;
  chapter_number: number | null;
  weightage: number;
  description: string | null;
  estimated_hours: number | null;
  completed: boolean;
  completed_at: string | null;
  archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  topic_id: string;
  chapter_id: string;
  name: string;
  weightage: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string[] | null;
  notes: string | null;
  completed: boolean;
  completed_at: string | null;
  archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  task_id: string;
  user_id: string;
  goal_id: string;
  subject_id: string | null;
  chapter_id: string | null;
  topic_id: string | null;
  name: string;
  description: string | null;
  task_type: string;
  status: "scheduled" | "pending" | "in_progress" | "done" | "postponed";
  priority_number: number;
  scheduled_date: string | null;
  scheduled_time_slot: string | null;
  preferred_session_id: string | null;
  estimated_duration: number | null;
  actual_duration: number;
  is_postponed: boolean;
  postponed_to_date: string | null;
  postponed_from_date: string | null;
  total_questions: number | null;
  attempted_questions: number | null;
  correct_answers: number | null;
  wrong_answers: number | null;
  skipped_questions: number | null;
  marks_per_question: number | null;
  negative_marking: number | null;
  time_taken_minutes: number | null;
  total_marks: number | null;
  marks_obtained: number | null;
  accuracy_percentage: number | null;
  speed_qpm: number | null;
  archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface Subtask {
  subtask_id: string;
  task_id: string;
  title: string;
  completed: boolean;
  order_index: number;
  created_at: string;
}

export interface StudySessionConfig {
  session_config_id: string;
  user_id: string;
  name: string;
  start_time: string;
  end_time: string;
  is_overnight: boolean;
  days_of_week: number[];
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserTaskType {
  task_type_id: string;
  user_id: string;
  name: string;
  icon: string;
  default_duration: number | null;
  base_xp: number;
  is_custom: boolean;
  created_at: string;
}

// Form input types (for create/update)
export type GoalInput = Omit<Goal, "goal_id" | "user_id" | "archived" | "archived_at" | "created_at" | "updated_at">;
export type StreamInput = Omit<Stream, "stream_id" | "archived" | "archived_at" | "created_at" | "updated_at">;
export type SubjectInput = Omit<Subject, "subject_id" | "total_chapters" | "completed_chapters" | "archived" | "archived_at" | "created_at" | "updated_at">;
export type ChapterInput = Omit<Chapter, "chapter_id" | "completed" | "completed_at" | "archived" | "archived_at" | "created_at" | "updated_at">;
export type TopicInput = Omit<Topic, "topic_id" | "completed" | "completed_at" | "archived" | "archived_at" | "created_at" | "updated_at">;
export type TaskInput = Omit<Task, "task_id" | "user_id" | "actual_duration" | "skipped_questions" | "total_marks" | "is_postponed" | "archived" | "archived_at" | "created_at" | "updated_at" | "completed_at">;

// Color palette for auto-assignment
export const SUBJECT_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308",
  "#84CC16", "#22C55E", "#14B8A6", "#06B6D4",
  "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899",
];

export const GOAL_TYPES = [
  { value: "board", label: "Board Exam", icon: "📋" },
  { value: "competitive", label: "Competitive Exam", icon: "🏆" },
  { value: "semester", label: "Semester", icon: "🎓" },
  { value: "custom", label: "Custom", icon: "🎯" },
] as const;

export const DEFAULT_TASK_TYPES = [
  { name: "notes", icon: "📝" },
  { name: "lecture", icon: "🎧" },
  { name: "revision", icon: "🔄" },
  { name: "practice", icon: "✏️" },
  { name: "test", icon: "📊" },
  { name: "mocktest", icon: "🧪" },
  { name: "exam", icon: "📑" },
] as const;

export const EXAM_TASK_TYPES = ["test", "mocktest", "exam"];

export const PRIORITY_PRESETS = [
  { label: "Low", value: 1000 },
  { label: "Medium", value: 2500 },
  { label: "High", value: 5000 },
  { label: "Critical", value: 7500 },
] as const;
