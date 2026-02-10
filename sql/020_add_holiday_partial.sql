-- 020_add_holiday_partial.sql
-- Add partial holiday support

ALTER TABLE holidays ADD COLUMN study_percentage INTEGER DEFAULT 0 CHECK (study_percentage >= 0 AND study_percentage <= 100);
ALTER TABLE holidays ADD COLUMN is_partial BOOLEAN GENERATED ALWAYS AS (study_percentage > 0) STORED;
