-- 037_enhance_tasks_completion.sql
-- Add fields for advanced task completion tracking and metadata

-- Track if task was completed manually vs timer
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_manual_completion BOOLEAN DEFAULT FALSE;

-- Archive functionality
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Metadata for specific task types
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(50); -- 'Easy', 'Medium', 'Hard'
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS grade VARCHAR(50); -- for assignments
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS submission_status VARCHAR(50); -- for assignments
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS retention_score INTEGER; -- 1-100 for revision tasks

-- Index for archived tasks
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(archived);
