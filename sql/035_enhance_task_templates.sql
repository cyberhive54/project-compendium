-- 035_enhance_task_templates.sql
-- Add hierarchy and scheduling fields to task templates

ALTER TABLE task_templates
  ADD COLUMN subject_id UUID REFERENCES subjects(subject_id) ON DELETE SET NULL,
  ADD COLUMN chapter_id UUID REFERENCES chapters(chapter_id) ON DELETE SET NULL,
  ADD COLUMN topic_id UUID REFERENCES topics(topic_id) ON DELETE SET NULL,
  ADD COLUMN scheduled_time_slot VARCHAR(50),  -- Changed from VARCHAR(11) to match tasks table
  ADD COLUMN preferred_session_id UUID REFERENCES study_sessions_config(session_config_id) ON DELETE SET NULL,
  ADD COLUMN schedule_start DATE,
  ADD COLUMN schedule_end DATE;

-- Add indexes for better query performance
CREATE INDEX idx_task_templates_subject ON task_templates(subject_id) WHERE subject_id IS NOT NULL;
CREATE INDEX idx_task_templates_chapter ON task_templates(chapter_id) WHERE chapter_id IS NOT NULL;
CREATE INDEX idx_task_templates_topic ON task_templates(topic_id) WHERE topic_id IS NOT NULL;
CREATE INDEX idx_task_templates_session ON task_templates(preferred_session_id) WHERE preferred_session_id IS NOT NULL;
