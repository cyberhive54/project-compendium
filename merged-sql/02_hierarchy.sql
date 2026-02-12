-- ============================================================================
-- 02_hierarchy.sql
-- Merged from: 003, 004, 005, 006, 007, 008, 023, 031 (columns only)
-- Creates: projects, goals, streams, subjects, chapters, topics
-- ============================================================================

-- Projects
CREATE TABLE projects (
  project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50) DEFAULT '📚',
  start_date DATE,
  end_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);
CREATE INDEX idx_projects_user ON projects(user_id, archived);
CREATE TRIGGER update_projects_timestamp
  BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Goals
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
  start_date DATE,
  end_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
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
  BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Streams
CREATE TABLE streams (
  stream_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(goal_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  weightage DECIMAL(5,2) DEFAULT 0,
  color VARCHAR(7),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(goal_id, name),
  CHECK (weightage >= 0 AND weightage <= 100)
);
CREATE INDEX idx_streams_goal ON streams(goal_id, archived);
CREATE TRIGGER update_streams_timestamp
  BEFORE UPDATE ON streams FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE FUNCTION check_stream_weightage()
RETURNS TRIGGER AS $$
DECLARE total DECIMAL(5,2);
BEGIN
  SELECT COALESCE(SUM(weightage), 0) INTO total
  FROM streams WHERE goal_id = NEW.goal_id AND NOT archived;
  IF total > 100.01 THEN
    RAISE EXCEPTION 'Total stream weightage exceeds 100%% (current: %)', total;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER validate_stream_weightage
  AFTER INSERT OR UPDATE ON streams FOR EACH ROW EXECUTE FUNCTION check_stream_weightage();

-- Subjects
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
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
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
  BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE FUNCTION check_subject_weightage()
RETURNS TRIGGER AS $$
DECLARE total DECIMAL(5,2);
BEGIN
  IF NEW.stream_id IS NOT NULL THEN
    SELECT COALESCE(SUM(weightage), 0) INTO total
    FROM subjects WHERE stream_id = NEW.stream_id AND NOT archived;
  ELSE
    SELECT COALESCE(SUM(weightage), 0) INTO total
    FROM subjects WHERE goal_id = NEW.goal_id AND stream_id IS NULL AND NOT archived;
  END IF;
  IF total > 100.01 THEN
    RAISE EXCEPTION 'Total subject weightage exceeds 100%% (current: %)', total;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER validate_subject_weightage
  AFTER INSERT OR UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION check_subject_weightage();

-- Chapters
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
  BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE FUNCTION check_chapter_weightage()
RETURNS TRIGGER AS $$
DECLARE total DECIMAL(5,2);
BEGIN
  SELECT COALESCE(SUM(weightage), 0) INTO total
  FROM chapters WHERE subject_id = NEW.subject_id AND NOT archived;
  IF total > 100.01 THEN
    RAISE EXCEPTION 'Total chapter weightage exceeds 100%% (current: %)', total;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER validate_chapter_weightage
  AFTER INSERT OR UPDATE ON chapters FOR EACH ROW EXECUTE FUNCTION check_chapter_weightage();

-- Topics
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
  BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE FUNCTION check_topic_weightage()
RETURNS TRIGGER AS $$
DECLARE total DECIMAL(5,2);
BEGIN
  SELECT COALESCE(SUM(weightage), 0) INTO total
  FROM topics WHERE chapter_id = NEW.chapter_id AND NOT archived;
  IF total > 100.01 THEN
    RAISE EXCEPTION 'Total topic weightage exceeds 100%% (current: %)', total;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER validate_topic_weightage
  AFTER INSERT OR UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION check_topic_weightage();
