-- 006_create_subjects.sql
-- Subjects table (child of goals, optional stream)

CREATE TABLE subjects (
  subject_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(goal_id) ON DELETE CASCADE,
  stream_id UUID REFERENCES streams(stream_id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  weightage DECIMAL(5,2) DEFAULT 0,
  color VARCHAR(7),
  icon VARCHAR(50) DEFAULT '📖',
  total_chapters INTEGER DEFAULT 0,
  completed_chapters INTEGER DEFAULT 0,
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(goal_id, name),
  CHECK (weightage >= 0 AND weightage <= 100)
);

CREATE INDEX idx_subjects_goal ON subjects(goal_id, archived);
CREATE INDEX idx_subjects_stream ON subjects(stream_id);

CREATE TRIGGER update_subjects_timestamp
  BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Weightage validation for subjects within a stream/goal
CREATE OR REPLACE FUNCTION check_subject_weightage()
RETURNS TRIGGER AS $$
DECLARE
  total DECIMAL(5,2);
BEGIN
  -- If subject belongs to a stream, validate within stream
  IF NEW.stream_id IS NOT NULL THEN
    SELECT COALESCE(SUM(weightage), 0) INTO total
    FROM subjects
    WHERE stream_id = NEW.stream_id AND NOT archived;
  ELSE
    -- Validate within goal (subjects without a stream)
    SELECT COALESCE(SUM(weightage), 0) INTO total
    FROM subjects
    WHERE goal_id = NEW.goal_id AND stream_id IS NULL AND NOT archived;
  END IF;

  IF total > 100.01 THEN
    RAISE EXCEPTION 'Total subject weightage exceeds 100%% (current: %)', total;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_subject_weightage
  AFTER INSERT OR UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION check_subject_weightage();
