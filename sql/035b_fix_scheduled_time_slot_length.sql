-- 035b_fix_scheduled_time_slot_length.sql
-- Fix the VARCHAR length for scheduled_time_slot to match tasks table

-- Alter the column to increase size from VARCHAR(11) to VARCHAR(50)
ALTER TABLE task_templates 
  ALTER COLUMN scheduled_time_slot TYPE VARCHAR(50);
