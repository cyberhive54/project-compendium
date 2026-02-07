-- 017_create_rls_policies.sql
-- Row Level Security for all tables

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_task_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups_metadata ENABLE ROW LEVEL SECURITY;

-- Direct ownership policies (tables with user_id column)
CREATE POLICY user_profile_policy ON user_profiles
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY projects_policy ON projects
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY goals_policy ON goals
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY tasks_policy ON tasks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY timer_sessions_policy ON timer_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY holidays_policy ON holidays
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_badges_policy ON user_badges
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_task_types_policy ON user_task_types
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY study_sessions_config_policy ON study_sessions_config
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY backups_metadata_policy ON backups_metadata
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Nested resource policies (check ownership through parent)
CREATE POLICY streams_policy ON streams
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.goal_id = streams.goal_id
        AND goals.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.goal_id = streams.goal_id
        AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY subjects_policy ON subjects
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.goal_id = subjects.goal_id
        AND goals.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.goal_id = subjects.goal_id
        AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY chapters_policy ON chapters
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subjects
      JOIN goals ON goals.goal_id = subjects.goal_id
      WHERE subjects.subject_id = chapters.subject_id
        AND goals.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM subjects
      JOIN goals ON goals.goal_id = subjects.goal_id
      WHERE subjects.subject_id = chapters.subject_id
        AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY topics_policy ON topics
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN subjects ON subjects.subject_id = chapters.subject_id
      JOIN goals ON goals.goal_id = subjects.goal_id
      WHERE chapters.chapter_id = topics.chapter_id
        AND goals.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN subjects ON subjects.subject_id = chapters.subject_id
      JOIN goals ON goals.goal_id = subjects.goal_id
      WHERE chapters.chapter_id = topics.chapter_id
        AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY subtasks_policy ON subtasks
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.task_id = subtasks.task_id
        AND tasks.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.task_id = subtasks.task_id
        AND tasks.user_id = auth.uid()
    )
  );

-- Badges table is read-only for all authenticated users
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY badges_read_policy ON badges
  FOR SELECT TO authenticated
  USING (true);
