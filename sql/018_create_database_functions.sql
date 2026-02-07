-- 018_create_database_functions.sql
-- Utility database functions

-- Calculate goal progress (weighted or simple)
CREATE OR REPLACE FUNCTION calculate_goal_progress(goal_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  progress DECIMAL(5,2);
  is_weighted BOOLEAN;
BEGIN
  SELECT weightage_enabled INTO is_weighted
  FROM goals WHERE goal_id = goal_uuid;

  IF NOT is_weighted THEN
    -- Simple task completion ratio
    SELECT CASE
      WHEN COUNT(*) > 0 THEN
        (COUNT(*) FILTER (WHERE status = 'done')::DECIMAL / COUNT(*)::DECIMAL) * 100
      ELSE 0
    END INTO progress
    FROM tasks
    WHERE goal_id = goal_uuid AND NOT archived;

    RETURN progress;
  END IF;

  -- Weighted progress based on chapters
  SELECT COALESCE(SUM(
    (SELECT CASE
      WHEN COUNT(*) > 0 THEN
        (COUNT(*) FILTER (WHERE chapters.completed)::DECIMAL / COUNT(*)::DECIMAL) * subjects.weightage
      ELSE 0
    END
    FROM chapters
    WHERE chapters.subject_id = subjects.subject_id AND NOT chapters.archived)
  ), 0) INTO progress
  FROM subjects
  WHERE goal_id = goal_uuid AND NOT archived;

  RETURN progress;
END;
$$ LANGUAGE plpgsql STABLE;

-- Update user streak
CREATE OR REPLACE FUNCTION update_user_streak(user_uuid UUID, study_date DATE)
RETURNS VOID AS $$
DECLARE
  profile RECORD;
  yesterday DATE;
  streak_maintained BOOLEAN;
BEGIN
  SELECT * INTO profile FROM user_profiles WHERE user_id = user_uuid;
  yesterday := study_date - INTERVAL '1 day';

  -- Check if yesterday was studied or holiday
  streak_maintained := EXISTS (
    SELECT 1 FROM holidays WHERE user_id = user_uuid AND date = yesterday
  ) OR profile.last_study_date = yesterday;

  IF profile.last_study_date = study_date THEN
    -- Already studied today, no update needed
    RETURN;
  END IF;

  IF streak_maintained THEN
    UPDATE user_profiles SET
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_study_date = study_date,
      total_study_days = total_study_days + 1
    WHERE user_id = user_uuid;
  ELSE
    UPDATE user_profiles SET
      current_streak = 1,
      last_study_date = study_date,
      total_study_days = total_study_days + 1
    WHERE user_id = user_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Seed default task types for a new user
CREATE OR REPLACE FUNCTION seed_default_task_types(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_task_types (user_id, name, icon, default_duration, base_xp, is_custom) VALUES
    (user_uuid, 'notes', '📝', 60, 50, FALSE),
    (user_uuid, 'lecture', '🎓', 45, 40, FALSE),
    (user_uuid, 'revision', '🔄', 30, 60, FALSE),
    (user_uuid, 'practice', '✏️', 45, 70, FALSE),
    (user_uuid, 'test', '📋', 60, 100, FALSE),
    (user_uuid, 'mocktest', '📊', 120, 150, FALSE),
    (user_uuid, 'exam', '🏆', 180, 200, FALSE)
  ON CONFLICT (user_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
