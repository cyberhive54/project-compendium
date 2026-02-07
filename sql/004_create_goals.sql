-- 004_create_goals.sql
-- Goals table (mandatory, with type)

CREATE TABLE goals (
  goal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(project_id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  goal_type VARCHAR(20) DEFAULT 'custom',
  target_date DATE,
  color VARCHAR(7) DEFAULT '#10B981',
  icon VARCHAR(50) DEFAULT '🎯',
  weightage_enabled BOOLEAN DEFAULT TRUE,
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name),
  CHECK (goal_type IN ('board', 'competitive', 'semester', 'custom'))
);

CREATE INDEX idx_goals_user ON goals(user_id, archived);
CREATE INDEX idx_goals_project ON goals(project_id);
CREATE INDEX idx_goals_target_date ON goals(target_date) WHERE target_date IS NOT NULL;

CREATE TRIGGER update_goals_timestamp
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
