-- 012_create_timer_sessions.sql
-- Timer sessions linked to tasks

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

-- Indexes
CREATE INDEX idx_timer_sessions_task ON timer_sessions(task_id);
CREATE INDEX idx_timer_sessions_user_date ON timer_sessions(user_id, start_time);
CREATE INDEX idx_timer_sessions_sync ON timer_sessions(synced) WHERE NOT synced;

-- Trigger to update task actual_duration when a timer session ends
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
  AFTER INSERT OR UPDATE ON timer_sessions
  FOR EACH ROW EXECUTE FUNCTION update_task_duration();
