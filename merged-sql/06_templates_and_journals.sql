-- ============================================================================
-- 06_templates_and_journals.sql
-- Merged from: 024, 026, 035 (fixed table reference)
-- Creates: journals, task_templates
-- ============================================================================

-- Daily study journal
CREATE TABLE journals (
  journal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
CREATE INDEX idx_journals_user_date ON journals(user_id, date DESC);
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own journals"
  ON journals FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Task templates (with hierarchy fields from 035, fixed table reference)
CREATE TABLE task_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  goal_id UUID REFERENCES goals(goal_id) ON DELETE SET NULL,
  subject_id UUID REFERENCES subjects(subject_id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES chapters(chapter_id) ON DELETE SET NULL,
  topic_id UUID REFERENCES topics(topic_id) ON DELETE SET NULL,
  task_type VARCHAR(50) DEFAULT 'study',
  priority_number INTEGER DEFAULT 1000,
  estimated_duration INTEGER,
  scheduled_time_slot VARCHAR(50),
  preferred_session_id UUID REFERENCES study_sessions_config(session_config_id) ON DELETE SET NULL,
  schedule_start DATE,
  schedule_end DATE,
  recurrence VARCHAR(20) DEFAULT 'daily',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_task_templates_user ON task_templates(user_id, is_active);
CREATE INDEX idx_task_templates_subject ON task_templates(subject_id) WHERE subject_id IS NOT NULL;
CREATE INDEX idx_task_templates_chapter ON task_templates(chapter_id) WHERE chapter_id IS NOT NULL;
CREATE INDEX idx_task_templates_topic ON task_templates(topic_id) WHERE topic_id IS NOT NULL;
CREATE INDEX idx_task_templates_session ON task_templates(preferred_session_id) WHERE preferred_session_id IS NOT NULL;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own templates"
  ON task_templates FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
