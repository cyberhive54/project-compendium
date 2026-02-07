-- 014_create_user_task_types.sql
-- Custom task types per user

CREATE TABLE user_task_types (
  task_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50) DEFAULT '📝',
  default_duration INTEGER, -- minutes
  base_xp INTEGER DEFAULT 50,
  is_custom BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_user_task_types_user ON user_task_types(user_id);
