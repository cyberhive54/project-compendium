-- 008_create_topics.sql
-- Topics table (child of chapters)

CREATE TABLE topics (
  topic_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(chapter_id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  weightage DECIMAL(5,2) DEFAULT 0,
  difficulty VARCHAR(10) DEFAULT 'medium',
  tags TEXT[],
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (weightage >= 0 AND weightage <= 100),
  CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

CREATE INDEX idx_topics_chapter ON topics(chapter_id, archived);
CREATE INDEX idx_topics_difficulty ON topics(difficulty);
CREATE INDEX idx_topics_tags ON topics USING GIN(tags);

CREATE TRIGGER update_topics_timestamp
  BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Weightage validation for topics within a chapter
CREATE OR REPLACE FUNCTION check_topic_weightage()
RETURNS TRIGGER AS $$
DECLARE
  total DECIMAL(5,2);
BEGIN
  SELECT COALESCE(SUM(weightage), 0) INTO total
  FROM topics
  WHERE chapter_id = NEW.chapter_id AND NOT archived;

  IF total > 100.01 THEN
    RAISE EXCEPTION 'Total topic weightage exceeds 100%% (current: %)', total;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_topic_weightage
  AFTER INSERT OR UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION check_topic_weightage();
