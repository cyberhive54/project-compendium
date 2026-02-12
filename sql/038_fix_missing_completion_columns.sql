-- 038_fix_missing_completion_columns.sql
-- Add missing fields for exam analysis that were expected by the frontend

-- Analysis Metadata
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS analysis_completed BOOLEAN DEFAULT FALSE;

-- Question Stats
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS total_questions INTEGER;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS attempted_questions INTEGER;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS correct_answers INTEGER;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS wrong_answers INTEGER;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS skipped_questions INTEGER;

-- Scoring Params
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS marks_per_question DECIMAL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS negative_marking DECIMAL DEFAULT 0;

-- Time Tracking
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS time_taken_minutes INTEGER;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_duration INTEGER;

-- Results (Storing detailed results as snapshots)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS marks_obtained DECIMAL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS total_marks DECIMAL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS accuracy_percentage DECIMAL;
