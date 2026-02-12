-- ============================================================================
-- 08_functions_and_triggers.sql
-- Merged from: 018, 029, 031 (triggers only), 040
-- Creates: goal progress, streak, task type seeding, account deletion,
--          hierarchy completion triggers, expanded handle_new_user
-- ============================================================================

-- Calculate goal progress (weighted or simple)
CREATE OR REPLACE FUNCTION calculate_goal_progress(goal_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  progress DECIMAL(5,2);
  is_weighted BOOLEAN;
BEGIN
  SELECT weightage_enabled INTO is_weighted FROM goals WHERE goal_id = goal_uuid;
  IF NOT is_weighted THEN
    SELECT CASE WHEN COUNT(*) > 0 THEN
      (COUNT(*) FILTER (WHERE status = 'done')::DECIMAL / COUNT(*)::DECIMAL) * 100
      ELSE 0 END INTO progress
    FROM tasks WHERE goal_id = goal_uuid AND NOT archived;
    RETURN progress;
  END IF;
  SELECT COALESCE(SUM(
    (SELECT CASE WHEN COUNT(*) > 0 THEN
      (COUNT(*) FILTER (WHERE chapters.completed)::DECIMAL / COUNT(*)::DECIMAL) * subjects.weightage
      ELSE 0 END
    FROM chapters WHERE chapters.subject_id = subjects.subject_id AND NOT chapters.archived)
  ), 0) INTO progress
  FROM subjects WHERE goal_id = goal_uuid AND NOT archived;
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
  streak_maintained := EXISTS (
    SELECT 1 FROM holidays WHERE user_id = user_uuid AND date = yesterday
  ) OR profile.last_study_date = yesterday;
  IF profile.last_study_date = study_date THEN RETURN; END IF;
  IF streak_maintained THEN
    UPDATE user_profiles SET
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_study_date = study_date,
      total_study_days = total_study_days + 1
    WHERE user_id = user_uuid;
  ELSE
    UPDATE user_profiles SET
      current_streak = 1, last_study_date = study_date,
      total_study_days = total_study_days + 1
    WHERE user_id = user_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Seed default task types
CREATE OR REPLACE FUNCTION seed_default_task_types(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_task_types (user_id, name, icon, default_duration, base_xp, is_custom, system_behavior) VALUES
    (user_uuid, 'notes', '📝', 60, 50, FALSE, 'study'),
    (user_uuid, 'lecture', '🎓', 45, 40, FALSE, 'study'),
    (user_uuid, 'revision', '🔄', 30, 60, FALSE, 'revision'),
    (user_uuid, 'practice', '✏️', 45, 70, FALSE, 'practice'),
    (user_uuid, 'test', '📋', 60, 100, FALSE, 'exam'),
    (user_uuid, 'mocktest', '📊', 120, 150, FALSE, 'exam'),
    (user_uuid, 'exam', '🏆', 180, 200, FALSE, 'exam')
  ON CONFLICT (user_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Allow users to delete their own account
CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS VOID AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Hierarchy completion triggers (from 031)
-- ============================================================================

-- 1. Update Topic based on Tasks
CREATE OR REPLACE FUNCTION update_topic_completion() RETURNS TRIGGER AS $$
DECLARE
  all_done BOOLEAN;
  topic_record RECORD;
BEGIN
  IF (TG_OP = 'DELETE') THEN topic_record := OLD;
  ELSE topic_record := NEW; END IF;
  SELECT COALESCE(BOOL_AND(status = 'done'), TRUE) INTO all_done
  FROM tasks WHERE topic_id = topic_record.topic_id AND archived = false;
  UPDATE topics SET completed = all_done,
    completed_at = CASE WHEN all_done THEN NOW() ELSE NULL END
  WHERE topic_id = topic_record.topic_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_topic_completion
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_topic_completion();

-- 2. Update Chapter based on Topics
CREATE OR REPLACE FUNCTION update_chapter_completion() RETURNS TRIGGER AS $$
DECLARE all_done BOOLEAN;
BEGIN
  SELECT COALESCE(BOOL_AND(completed), TRUE) INTO all_done
  FROM topics WHERE chapter_id = NEW.chapter_id AND archived = false;
  UPDATE chapters SET completed = all_done,
    completed_at = CASE WHEN all_done THEN NOW() ELSE NULL END
  WHERE chapter_id = NEW.chapter_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_chapter_completion
  AFTER UPDATE OF completed, archived OR INSERT OR DELETE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_chapter_completion();

-- 3. Update Subject based on Chapters
CREATE OR REPLACE FUNCTION update_subject_completion() RETURNS TRIGGER AS $$
DECLARE all_done BOOLEAN;
BEGIN
  SELECT COALESCE(BOOL_AND(completed), TRUE) INTO all_done
  FROM chapters WHERE subject_id = NEW.subject_id AND archived = false;
  UPDATE subjects SET completed = all_done,
    completed_at = CASE WHEN all_done THEN NOW() ELSE NULL END
  WHERE subject_id = NEW.subject_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_subject_completion
  AFTER UPDATE OF completed, archived OR INSERT OR DELETE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_subject_completion();

-- Helper: Goal Completion Logic
CREATE OR REPLACE FUNCTION update_goal_completion_func(target_goal_id UUID) RETURNS VOID AS $$
DECLARE streams_done BOOLEAN; subjects_done BOOLEAN;
BEGIN
  SELECT COALESCE(BOOL_AND(completed), TRUE) INTO streams_done
  FROM streams WHERE goal_id = target_goal_id AND archived = false;
  SELECT COALESCE(BOOL_AND(completed), TRUE) INTO subjects_done
  FROM subjects WHERE goal_id = target_goal_id AND stream_id IS NULL AND archived = false;
  UPDATE goals SET completed = (streams_done AND subjects_done),
    completed_at = CASE WHEN (streams_done AND subjects_done) THEN NOW() ELSE NULL END
  WHERE goal_id = target_goal_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Update Stream/Goal from Subject
CREATE OR REPLACE FUNCTION update_stream_or_goal_from_subject() RETURNS TRIGGER AS $$
DECLARE all_done BOOLEAN;
BEGIN
  IF NEW.stream_id IS NOT NULL THEN
    SELECT COALESCE(BOOL_AND(completed), TRUE) INTO all_done
    FROM subjects WHERE stream_id = NEW.stream_id AND archived = false;
    UPDATE streams SET completed = all_done,
      completed_at = CASE WHEN all_done THEN NOW() ELSE NULL END
    WHERE stream_id = NEW.stream_id;
  ELSE
    PERFORM update_goal_completion_func(NEW.goal_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_stream_or_goal_from_subject
  AFTER UPDATE OF completed, archived OR INSERT OR DELETE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_stream_or_goal_from_subject();

-- 5. Update Goal from Stream
CREATE OR REPLACE FUNCTION update_goal_from_stream() RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_goal_completion_func(NEW.goal_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_goal_from_stream
  AFTER UPDATE OF completed, archived OR INSERT OR DELETE ON streams
  FOR EACH ROW EXECUTE FUNCTION update_goal_from_stream();

-- 6. Update Project from Goal
CREATE OR REPLACE FUNCTION update_project_completion() RETURNS TRIGGER AS $$
DECLARE all_done BOOLEAN;
BEGIN
  SELECT COALESCE(BOOL_AND(completed), TRUE) INTO all_done
  FROM goals WHERE project_id = NEW.project_id AND archived = false;
  UPDATE projects SET completed = all_done,
    completed_at = CASE WHEN all_done THEN NOW() ELSE NULL END
  WHERE project_id = NEW.project_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_project_completion
  AFTER UPDATE OF completed, archived OR INSERT OR DELETE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_project_completion();

-- ============================================================================
-- Expanded handle_new_user (from 040 — replaces the basic version from 01)
-- ============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, username, backup_encryption_hash)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTR(NEW.id::TEXT, 1, 8)),
    encode(extensions.gen_random_bytes(32), 'hex')
  );
  INSERT INTO public.study_sessions_config (user_id, name, start_time, end_time, days_of_week, color, is_active) VALUES
    (NEW.id, 'Morning Focus', '08:00', '11:00', '{1,2,3,4,5,6}', '#F59E0B', TRUE),
    (NEW.id, 'Afternoon Deep Work', '14:00', '17:00', '{1,2,3,4,5}', '#3B82F6', TRUE),
    (NEW.id, 'Evening Review', '19:00', '21:00', '{1,2,3,4,5,6,7}', '#8B5CF6', TRUE);
  INSERT INTO public.user_task_types (user_id, name, icon, default_duration, base_xp, is_custom, system_behavior) VALUES
    (NEW.id, 'Lecture', '🎧', 45, 40, FALSE, 'study'),
    (NEW.id, 'Notes', '📝', 60, 50, FALSE, 'study'),
    (NEW.id, 'Practice', '✏️', 90, 70, FALSE, 'practice'),
    (NEW.id, 'Revision', '🔄', 30, 60, FALSE, 'revision'),
    (NEW.id, 'Mock Test', '🧪', 180, 150, FALSE, 'exam'),
    (NEW.id, 'Assignment', '📋', 60, 50, TRUE, 'assignment');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;
