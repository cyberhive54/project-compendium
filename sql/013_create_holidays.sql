-- 013_create_holidays.sql
-- Holidays for streak preservation

CREATE TABLE holidays (
  holiday_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  holiday_type VARCHAR(50) DEFAULT 'Holiday',
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_holidays_user_date ON holidays(user_id, date);
