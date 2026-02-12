-- 028_add_day_start_to_profiles.sql
-- Add start_of_day_hour to determine when a "study day" begins (e.g. 4 for 4 AM)

ALTER TABLE user_profiles 
ADD COLUMN start_of_day_hour INTEGER DEFAULT 0 CHECK (start_of_day_hour >= 0 AND start_of_day_hour <= 23);
