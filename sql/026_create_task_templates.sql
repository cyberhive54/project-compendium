-- 026_create_task_templates.sql
-- Reusable task templates with scheduling

CREATE TABLE task_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  goal_id UUID REFERENCES goals(goal_id) ON DELETE SET NULL,
  task_type VARCHAR(50) DEFAULT 'study',
  priority_number INTEGER DEFAULT 1000,
  estimated_duration INTEGER,
  schedule_start DATE,
  schedule_end DATE,
  recurrence VARCHAR(20) DEFAULT 'daily',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_task_templates_user ON task_templates(user_id, is_active);

ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own templates"
  ON task_templates FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
