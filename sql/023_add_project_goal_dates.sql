-- 023_add_project_goal_dates.sql
-- Add start/end dates to projects and goals

ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE;

ALTER TABLE goals ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS end_date DATE;
