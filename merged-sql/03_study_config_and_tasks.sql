-- ============================================================================
-- 03_study_config_and_tasks.sql
-- Merged from: 009, 010, 011, 037, 038
-- Creates: study_sessions_config, tasks, subtasks
-- ============================================================================

-- Study sessions configuration
CREATE TABLE study_sessions_config (
  session_config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_overnight BOOLEAN GENERATED ALWAYS AS (end_time < start_time) STORED,
  days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}',
  color VARCHAR(7) DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);
CREATE INDEX idx_study_sessions_user ON study_sessions_config(user_id, is_active);
CREATE TRIGGER update_study_sessions_config_timestamp
  BEFORE UPDATE ON study_sessions_config FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Tasks (with exam fields, priority, and all enhancements from 037/038)
CREATE TABLE tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(goal_id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(subject_id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES chapters(chapter_id) ON DELETE SET NULL,
  topic_id UUID REFERENCES topics(topic_id) ON DELETE SET NULL,

  name VARCHAR(200) NOT NULL,
  description TEXT,
  task_type VARCHAR(50) NOT NULL DEFAULT 'study',
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  priority_number INTEGER DEFAULT 1000,

  -- Scheduling
  scheduled_date DATE,
  scheduled_time_slot VARCHAR(50),
  preferred_session_id UUID REFERENCES study_sessions_config(session_config_id) ON DELETE SET NULL,
  estimated_duration INTEGER,
  actual_duration INTEGER DEFAULT 0,

  -- Postponement
  is_postponed BOOLEAN DEFAULT FALSE,
  postponed_to_date DATE,
  postponed_from_date DATE,

  -- Exam-specific fields
  total_questions INTEGER,
  attempted_questions INTEGER,
  correct_answers INTEGER,
  wrong_answers INTEGER,
  skipped_questions INTEGER GENERATED ALWAYS AS (
    CASE WHEN total_questions IS NOT NULL
      THEN total_questions - COALESCE(attempted_questions, 0)
      ELSE NULL
    END
  ) STORED,
  marks_per_question DECIMAL(5,2),
  negative_marking DECIMAL(5,2) DEFAULT 0,
  time_taken_minutes INTEGER,
  total_marks DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE WHEN total_questions IS NOT NULL
      THEN total_questions * COALESCE(marks_per_question, 0)
      ELSE NULL
    END
  ) STORED,
  marks_obtained DECIMAL(10,2),
  accuracy_percentage DECIMAL(5,2),
  speed_qpm DECIMAL(5,2),

  -- Enhanced fields (from 037)
  is_manual_completion BOOLEAN DEFAULT FALSE,
  difficulty_level VARCHAR(50),
  grade VARCHAR(50),
  submission_status VARCHAR(50),
  retention_score INTEGER,

  -- Enhanced fields (from 038)
  analysis_completed BOOLEAN DEFAULT FALSE,
  start_time TIMESTAMPTZ,

  -- Metadata
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  CHECK (status IN ('scheduled', 'pending', 'in_progress', 'done', 'postponed')),
  CHECK (priority_number >= 1 AND priority_number <= 9999),
  CHECK (actual_duration >= 0),
  CHECK (attempted_questions IS NULL OR (attempted_questions >= 0 AND attempted_questions <= total_questions)),
  CHECK (correct_answers IS NULL OR (correct_answers >= 0 AND correct_answers <= attempted_questions)),
  CHECK (wrong_answers IS NULL OR (wrong_answers >= 0 AND wrong_answers <= attempted_questions))
);

CREATE INDEX idx_tasks_user ON tasks(user_id, archived);
CREATE INDEX idx_tasks_goal ON tasks(goal_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_scheduled_date ON tasks(scheduled_date) WHERE scheduled_date IS NOT NULL;
CREATE INDEX idx_tasks_priority ON tasks(priority_number DESC);
CREATE INDEX idx_tasks_type ON tasks(task_type);
CREATE INDEX idx_tasks_preferred_session ON tasks(preferred_session_id) WHERE preferred_session_id IS NOT NULL;

CREATE TRIGGER update_tasks_timestamp
  BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Subtasks
CREATE TABLE subtasks (
  subtask_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_subtasks_task ON subtasks(task_id, order_index);
