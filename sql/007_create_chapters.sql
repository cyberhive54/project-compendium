-- 007_create_chapters.sql
-- Chapters table (child of subjects)

CREATE TABLE chapters (
  chapter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  chapter_number INTEGER,
  weightage DECIMAL(5,2) DEFAULT 0,
  description TEXT,
  estimated_hours DECIMAL(5,2),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (weightage >= 0 AND weightage <= 100)
);

CREATE INDEX idx_chapters_subject ON chapters(subject_id, archived);
CREATE INDEX idx_chapters_number ON chapters(subject_id, chapter_number);

CREATE TRIGGER update_chapters_timestamp
  BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Weightage validation for chapters within a subject
CREATE OR REPLACE FUNCTION check_chapter_weightage()
RETURNS TRIGGER AS $$
DECLARE
  total DECIMAL(5,2);
BEGIN
  SELECT COALESCE(SUM(weightage), 0) INTO total
  FROM chapters
  WHERE subject_id = NEW.subject_id AND NOT archived;

  IF total > 100.01 THEN
    RAISE EXCEPTION 'Total chapter weightage exceeds 100%% (current: %)', total;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_chapter_weightage
  AFTER INSERT OR UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION check_chapter_weightage();
