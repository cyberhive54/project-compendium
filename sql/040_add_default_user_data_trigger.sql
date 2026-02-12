-- 040_add_default_user_data_trigger.sql
-- Updates the handle_new_user function to also insert default study sessions and task types

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Create User Profile
  INSERT INTO public.user_profiles (user_id, username, backup_encryption_hash)
  VALUES (
    NEW.id,
    -- If username is provided in metadata, use it. Otherwise default to user_XXXXXXXX
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || SUBSTR(NEW.id::TEXT, 1, 8)
    ),
    encode(extensions.gen_random_bytes(32), 'hex')
  );

  -- 2. Create Default Study Sessions
  INSERT INTO public.study_sessions_config (user_id, name, start_time, end_time, days_of_week, color, is_active)
  VALUES 
    (NEW.id, 'Morning Focus', '08:00', '11:00', '{1,2,3,4,5,6}', '#F59E0B', TRUE),
    (NEW.id, 'Afternoon Deep Work', '14:00', '17:00', '{1,2,3,4,5}', '#3B82F6', TRUE),
    (NEW.id, 'Evening Review', '19:00', '21:00', '{1,2,3,4,5,6,7}', '#8B5CF6', TRUE);

  -- 3. Create Default User Task Types
  INSERT INTO public.user_task_types (user_id, name, icon, default_duration, base_xp, is_custom)
  VALUES
    (NEW.id, 'Lecture', '🎧', 45, 40, FALSE),
    (NEW.id, 'Notes', '📝', 60, 50, FALSE),
    (NEW.id, 'Practice', '✏️', 90, 70, FALSE),
    (NEW.id, 'Revision', '🔄', 30, 60, FALSE),
    (NEW.id, 'Mock Test', '🧪', 180, 150, FALSE),
    (NEW.id, 'Assignment', '📋', 60, 50, TRUE);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;
