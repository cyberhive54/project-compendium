-- 005_create_streams.sql
-- Streams table (child of goals, with weightage)

CREATE TABLE streams (
  stream_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(goal_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  weightage DECIMAL(5,2) DEFAULT 0,
  color VARCHAR(7),
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(goal_id, name),
  CHECK (weightage >= 0 AND weightage <= 100)
);

CREATE INDEX idx_streams_goal ON streams(goal_id, archived);

CREATE TRIGGER update_streams_timestamp
  BEFORE UPDATE ON streams
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Weightage validation trigger (±0.01% tolerance)
CREATE OR REPLACE FUNCTION check_stream_weightage()
RETURNS TRIGGER AS $$
DECLARE
  total DECIMAL(5,2);
BEGIN
  SELECT COALESCE(SUM(weightage), 0) INTO total
  FROM streams
  WHERE goal_id = NEW.goal_id AND NOT archived;

  IF total > 100.01 THEN
    RAISE EXCEPTION 'Total stream weightage exceeds 100%% (current: %)', total;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_stream_weightage
  AFTER INSERT OR UPDATE ON streams
  FOR EACH ROW EXECUTE FUNCTION check_stream_weightage();
