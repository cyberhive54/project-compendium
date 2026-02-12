-- ============================================================================
-- 01_utilities_and_profiles.sql
-- Merged from: 001, 002, 028
-- Creates: update_timestamp(), user_profiles, handle_new_user trigger
-- ============================================================================

-- Timestamp auto-update function (used by many tables)
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- User profiles with gamification, streak, and settings
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(20) UNIQUE NOT NULL,
  profile_picture_url TEXT,
  theme_preferences JSONB DEFAULT '{"mode": "light", "primary_color": "#3B82F6"}',

  -- Gamification
  total_xp BIGINT DEFAULT 0,
  current_level INTEGER GENERATED ALWAYS AS (FLOOR(SQRT(total_xp::NUMERIC / 100)) + 1) STORED,
  lifetime_xp BIGINT DEFAULT 0,

  -- Streak
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  total_study_days INTEGER DEFAULT 0,

  -- Settings
  streak_settings JSONB DEFAULT '{
    "min_minutes": 30,
    "min_tasks": 1,
    "require_all_tasks": false,
    "streak_mode": "any"
  }',
  pomodoro_settings JSONB DEFAULT '{
    "focus_duration": 25,
    "short_break_duration": 5,
    "long_break_duration": 15,
    "long_break_interval": 4,
    "auto_start_break": false,
    "auto_start_focus": false
  }',

  -- Day start hour (from 028)
  start_of_day_hour INTEGER DEFAULT 0 CHECK (start_of_day_hour >= 0 AND start_of_day_hour <= 23),

  -- Backup
  backup_encryption_hash VARCHAR(255) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_xp ON user_profiles(total_xp DESC);

-- Auto-update timestamp trigger
CREATE TRIGGER update_user_profiles_timestamp
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Auto-create profile on user signup (basic version, expanded in 08_functions)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, username, backup_encryption_hash)
  VALUES (
    NEW.id,
    'user_' || SUBSTR(NEW.id::TEXT, 1, 8),
    encode(extensions.gen_random_bytes(32), 'hex')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
