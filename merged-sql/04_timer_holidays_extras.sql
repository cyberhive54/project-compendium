-- ============================================================================
-- 04_timer_holidays_extras.sql
-- Merged from: 012, 013, 014, 016, 020, 039
-- Creates: timer_sessions, holidays, user_task_types, backups_metadata
-- ============================================================================

-- Timer sessions
CREATE TABLE timer_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER GENERATED ALWAYS AS (
    CASE WHEN end_time IS NOT NULL
      THEN EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER
      ELSE NULL
    END
  ) STORED,
  session_type VARCHAR(20) DEFAULT 'focus',
  is_pomodoro BOOLEAN DEFAULT FALSE,
  pomodoro_cycle INTEGER,
  paused_duration_seconds INTEGER DEFAULT 0,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (session_type IN ('focus', 'break')),
  CHECK (end_time IS NULL OR end_time > start_time)
);
CREATE INDEX idx_timer_sessions_task ON timer_sessions(task_id);
CREATE INDEX idx_timer_sessions_user_date ON timer_sessions(user_id, start_time);
CREATE INDEX idx_timer_sessions_sync ON timer_sessions(synced) WHERE NOT synced;

-- Auto-update task duration when timer ends
CREATE OR REPLACE FUNCTION update_task_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL THEN
    UPDATE tasks SET actual_duration = (
      SELECT COALESCE(SUM(duration_seconds), 0) / 60
      FROM timer_sessions
      WHERE task_id = NEW.task_id AND session_type = 'focus' AND end_time IS NOT NULL
    ) WHERE task_id = NEW.task_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_task_duration_trigger
  AFTER INSERT OR UPDATE ON timer_sessions FOR EACH ROW EXECUTE FUNCTION update_task_duration();

-- Holidays (with partial support from 020)
CREATE TABLE holidays (
  holiday_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  holiday_type VARCHAR(50) DEFAULT 'Holiday',
  reason TEXT,
  study_percentage INTEGER DEFAULT 0 CHECK (study_percentage >= 0 AND study_percentage <= 100),
  is_partial BOOLEAN GENERATED ALWAYS AS (study_percentage > 0) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
CREATE INDEX idx_holidays_user_date ON holidays(user_id, date);

-- Custom task types (with system_behavior from 039)
CREATE TABLE user_task_types (
  task_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50) DEFAULT '📝',
  default_duration INTEGER,
  base_xp INTEGER DEFAULT 50,
  is_custom BOOLEAN DEFAULT TRUE,
  system_behavior VARCHAR(50) NOT NULL DEFAULT 'study',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name),
  CONSTRAINT check_system_behavior CHECK (system_behavior IN ('study', 'practice', 'exam', 'assignment', 'revision'))
);
CREATE INDEX idx_user_task_types_user ON user_task_types(user_id);

-- Backups metadata
CREATE TABLE backups_metadata (
  backup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  size_bytes BIGINT,
  include_archived BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_backups_metadata_user ON backups_metadata(user_id, created_at DESC);
