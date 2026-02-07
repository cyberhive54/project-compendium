-- 009_create_study_sessions_config.sql
-- Study sessions configuration (e.g., Morning Focus, Night Study)

CREATE TABLE study_sessions_config (
  session_config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  -- If end_time < start_time, it's an overnight session (e.g., 22:00 - 02:00)
  is_overnight BOOLEAN GENERATED ALWAYS AS (end_time < start_time) STORED,
  days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Mon, 7=Sun
  color VARCHAR(7) DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_study_sessions_user ON study_sessions_config(user_id, is_active);

CREATE TRIGGER update_study_sessions_config_timestamp
  BEFORE UPDATE ON study_sessions_config
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
