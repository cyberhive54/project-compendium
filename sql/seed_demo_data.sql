-- =============================================================
-- DEMO SEED DATA for DEMO@EXAMPLE.COM
-- Comprehensive data covering all tables, edge cases, and 
-- trigger/function validation scenarios.
-- =============================================================

DO $$
DECLARE
  v_uid UUID;

  -- Projects
  v_proj_academic UUID := gen_random_uuid();
  v_proj_competitive UUID := gen_random_uuid();

  -- Goals
  v_goal_jee UUID := gen_random_uuid();
  v_goal_boards UUID := gen_random_uuid();
  v_goal_semester UUID := gen_random_uuid();
  v_goal_custom UUID := gen_random_uuid();

  -- Streams (JEE has PCM streams)
  v_stream_physics UUID := gen_random_uuid();
  v_stream_chemistry UUID := gen_random_uuid();
  v_stream_maths UUID := gen_random_uuid();

  -- Subjects
  v_sub_mechanics UUID := gen_random_uuid();
  v_sub_electro UUID := gen_random_uuid();
  v_sub_optics UUID := gen_random_uuid();
  v_sub_organic UUID := gen_random_uuid();
  v_sub_inorganic UUID := gen_random_uuid();
  v_sub_physical UUID := gen_random_uuid();
  v_sub_calculus UUID := gen_random_uuid();
  v_sub_algebra UUID := gen_random_uuid();
  v_sub_english UUID := gen_random_uuid();   -- Board subject (no stream)
  v_sub_hindi UUID := gen_random_uuid();     -- Board subject (no stream)
  v_sub_cs UUID := gen_random_uuid();        -- Semester subject (no stream)
  v_sub_dbms UUID := gen_random_uuid();      -- Semester subject (no stream)
  v_sub_hobby UUID := gen_random_uuid();     -- Custom goal subject

  -- Chapters
  v_ch_newton UUID := gen_random_uuid();
  v_ch_kinematics UUID := gen_random_uuid();
  v_ch_rotation UUID := gen_random_uuid();
  v_ch_coulomb UUID := gen_random_uuid();
  v_ch_magnetism UUID := gen_random_uuid();
  v_ch_refraction UUID := gen_random_uuid();
  v_ch_goc UUID := gen_random_uuid();
  v_ch_alc UUID := gen_random_uuid();
  v_ch_limits UUID := gen_random_uuid();
  v_ch_derivatives UUID := gen_random_uuid();
  v_ch_integrals UUID := gen_random_uuid();
  v_ch_matrices UUID := gen_random_uuid();
  v_ch_grammar UUID := gen_random_uuid();
  v_ch_sql UUID := gen_random_uuid();
  v_ch_normalization UUID := gen_random_uuid();
  v_ch_hobby1 UUID := gen_random_uuid();

  -- Topics
  v_topic_newton1 UUID := gen_random_uuid();
  v_topic_newton2 UUID := gen_random_uuid();
  v_topic_newton3 UUID := gen_random_uuid();
  v_topic_kin1 UUID := gen_random_uuid();
  v_topic_kin2 UUID := gen_random_uuid();
  v_topic_refr1 UUID := gen_random_uuid();
  v_topic_goc1 UUID := gen_random_uuid();
  v_topic_goc2 UUID := gen_random_uuid();
  v_topic_lim1 UUID := gen_random_uuid();
  v_topic_deriv1 UUID := gen_random_uuid();
  v_topic_int1 UUID := gen_random_uuid();

  -- Study sessions config
  v_sess_morning UUID := gen_random_uuid();
  v_sess_afternoon UUID := gen_random_uuid();
  v_sess_evening UUID := gen_random_uuid();
  v_sess_night UUID := gen_random_uuid();     -- overnight session

  -- Tasks (many different types/statuses)
  v_task1 UUID := gen_random_uuid();
  v_task2 UUID := gen_random_uuid();
  v_task3 UUID := gen_random_uuid();
  v_task4 UUID := gen_random_uuid();
  v_task5 UUID := gen_random_uuid();
  v_task6 UUID := gen_random_uuid();
  v_task7 UUID := gen_random_uuid();
  v_task8 UUID := gen_random_uuid();
  v_task9 UUID := gen_random_uuid();
  v_task10 UUID := gen_random_uuid();
  v_task11 UUID := gen_random_uuid();
  v_task12 UUID := gen_random_uuid();
  v_task13 UUID := gen_random_uuid();
  v_task14 UUID := gen_random_uuid();
  v_task15 UUID := gen_random_uuid();
  v_task16 UUID := gen_random_uuid();
  v_task17 UUID := gen_random_uuid();
  v_task18 UUID := gen_random_uuid();
  v_task19 UUID := gen_random_uuid();
  v_task20 UUID := gen_random_uuid();

  -- Timer sessions
  v_timer1 UUID := gen_random_uuid();
  v_timer2 UUID := gen_random_uuid();
  v_timer3 UUID := gen_random_uuid();
  v_timer4 UUID := gen_random_uuid();
  v_timer5 UUID := gen_random_uuid();
  v_timer6 UUID := gen_random_uuid();
  v_timer7 UUID := gen_random_uuid();
  v_timer8 UUID := gen_random_uuid();
  v_timer9 UUID := gen_random_uuid();
  v_timer10 UUID := gen_random_uuid();
  v_timer11 UUID := gen_random_uuid();
  v_timer12 UUID := gen_random_uuid();

BEGIN
  -- =========================================================
  -- 0. LOOK UP USER ID
  -- =========================================================
  SELECT id INTO v_uid FROM auth.users WHERE email = 'demo@example.com';
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'User demo@example.com not found. Create the account first.';
  END IF;

  -- =========================================================
  -- 0.1 CLEANUP EXISTING DEMO DATA (allows re-running)
  -- =========================================================
  DELETE FROM timer_sessions WHERE user_id = v_uid;
  DELETE FROM subtasks WHERE task_id IN (SELECT task_id FROM tasks WHERE user_id = v_uid);
  DELETE FROM tasks WHERE user_id = v_uid;
  DELETE FROM topics WHERE chapter_id IN (
    SELECT chapter_id FROM chapters WHERE subject_id IN (
      SELECT subject_id FROM subjects WHERE goal_id IN (
        SELECT goal_id FROM goals WHERE user_id = v_uid)));
  DELETE FROM chapters WHERE subject_id IN (
    SELECT subject_id FROM subjects WHERE goal_id IN (
      SELECT goal_id FROM goals WHERE user_id = v_uid));
  DELETE FROM subjects WHERE goal_id IN (SELECT goal_id FROM goals WHERE user_id = v_uid);
  DELETE FROM streams WHERE goal_id IN (SELECT goal_id FROM goals WHERE user_id = v_uid);
  DELETE FROM goals WHERE user_id = v_uid;
  DELETE FROM projects WHERE user_id = v_uid;
  DELETE FROM study_sessions_config WHERE user_id = v_uid;
  DELETE FROM user_task_types WHERE user_id = v_uid;
  DELETE FROM holidays WHERE user_id = v_uid;
  DELETE FROM user_badges WHERE user_id = v_uid;
  DELETE FROM backups_metadata WHERE user_id = v_uid;

  -- =========================================================
  -- 1. USER PROFILE (update existing auto-created row)
  -- =========================================================
  UPDATE user_profiles SET
    username = 'DemoStudent',
    total_xp = 4750,
    lifetime_xp = 4750,
    current_streak = 12,
    longest_streak = 25,
    last_study_date = CURRENT_DATE - INTERVAL '1 day',
    total_study_days = 45,
    streak_settings = '{
      "min_minutes": 20,
      "min_tasks": 1,
      "require_all_tasks": false,
      "streak_mode": "any"
    }'::JSONB,
    pomodoro_settings = '{
      "focus_duration": 50,
      "short_break_duration": 10,
      "long_break_duration": 20,
      "long_break_interval": 3,
      "auto_start_break": true,
      "auto_start_focus": false
    }'::JSONB
  WHERE user_id = v_uid;

  -- =========================================================
  -- 2. PROJECTS
  -- =========================================================
  INSERT INTO projects (project_id, user_id, name, description, color, icon) VALUES
    (v_proj_academic, v_uid, '12th Board Exams', 'CBSE Class 12 board exam preparation', '#10B981', '📚'),
    (v_proj_competitive, v_uid, 'JEE Preparation', 'Comprehensive JEE Main + Advanced prep', '#3B82F6', '🎓');

  -- =========================================================
  -- 3. GOALS (all 4 types)
  -- =========================================================
  INSERT INTO goals (goal_id, user_id, project_id, name, description, goal_type, target_date, color, icon, weightage_enabled) VALUES
    (v_goal_jee, v_uid, v_proj_competitive, 'JEE Advanced 2026', 'Joint Entrance Exam preparation', 'competitive', '2026-05-15', '#EF4444', '🏆', TRUE),
    (v_goal_boards, v_uid, v_proj_academic, 'Board Exams 12th', 'CBSE Class 12 Board Exams', 'board', '2026-03-01', '#3B82F6', '📋', TRUE),
    (v_goal_semester, v_uid, NULL, 'Semester 3 - CS', 'Computer Science Semester 3', 'semester', '2026-04-30', '#F59E0B', '🎓', FALSE),
    (v_goal_custom, v_uid, NULL, 'Learn Piano', 'Self-paced piano learning (no project)', 'custom', NULL, '#EC4899', '🎹', FALSE);

  -- =========================================================
  -- 4. STREAMS (JEE has 3 streams summing to 100%)
  -- =========================================================
  INSERT INTO streams (stream_id, goal_id, name, weightage, color) VALUES
    (v_stream_physics, v_goal_jee, 'Physics', 35.00, '#EF4444'),
    (v_stream_chemistry, v_goal_jee, 'Chemistry', 30.00, '#22C55E'),
    (v_stream_maths, v_goal_jee, 'Mathematics', 35.00, '#3B82F6');

  -- =========================================================
  -- 5. SUBJECTS
  -- =========================================================
  -- Physics stream subjects (35+35+30 = 100%)
  INSERT INTO subjects (subject_id, goal_id, stream_id, name, weightage, color, icon, total_chapters, completed_chapters) VALUES
    (v_sub_mechanics, v_goal_jee, v_stream_physics, 'Mechanics', 35.00, '#EF4444', '⚙️', 3, 1),
    (v_sub_electro, v_goal_jee, v_stream_physics, 'Electrodynamics', 35.00, '#F97316', '⚡', 2, 0),
    (v_sub_optics, v_goal_jee, v_stream_physics, 'Optics', 30.00, '#06B6D4', '🔬', 1, 0);

  -- Chemistry stream subjects (50+25+25 = 100%)
  INSERT INTO subjects (subject_id, goal_id, stream_id, name, weightage, color, icon, total_chapters, completed_chapters) VALUES
    (v_sub_organic, v_goal_jee, v_stream_chemistry, 'Organic Chemistry', 50.00, '#84CC16', '🧪', 2, 0),
    (v_sub_inorganic, v_goal_jee, v_stream_chemistry, 'Inorganic Chemistry', 25.00, '#14B8A6', '🔩', 0, 0),
    (v_sub_physical, v_goal_jee, v_stream_chemistry, 'Physical Chemistry', 25.00, '#EAB308', '⚗️', 0, 0);

  -- Maths stream subjects (60+40 = 100%)
  INSERT INTO subjects (subject_id, goal_id, stream_id, name, weightage, color, icon, total_chapters, completed_chapters) VALUES
    (v_sub_calculus, v_goal_jee, v_stream_maths, 'Calculus', 60.00, '#6366F1', '📐', 3, 1),
    (v_sub_algebra, v_goal_jee, v_stream_maths, 'Algebra', 40.00, '#8B5CF6', '🧮', 1, 0);

  -- Board exam subjects (no stream, 50+50 = 100%)
  INSERT INTO subjects (subject_id, goal_id, stream_id, name, weightage, color, icon, total_chapters, completed_chapters) VALUES
    (v_sub_english, v_goal_boards, NULL, 'English', 50.00, '#F97316', '📖', 1, 0),
    (v_sub_hindi, v_goal_boards, NULL, 'Hindi', 50.00, '#EC4899', '📝', 0, 0);

  -- Semester subjects (weightage_enabled=false, so 0)
  INSERT INTO subjects (subject_id, goal_id, stream_id, name, weightage, color, icon, total_chapters, completed_chapters) VALUES
    (v_sub_cs, v_goal_semester, NULL, 'Data Structures', 0, '#22C55E', '💻', 0, 0),
    (v_sub_dbms, v_goal_semester, NULL, 'DBMS', 0, '#3B82F6', '🗄️', 2, 0);

  -- Custom goal subject
  INSERT INTO subjects (subject_id, goal_id, stream_id, name, weightage, color, icon, total_chapters, completed_chapters) VALUES
    (v_sub_hobby, v_goal_custom, NULL, 'Piano Basics', 0, '#EC4899', '🎹', 1, 0);

  -- =========================================================
  -- 6. CHAPTERS
  -- =========================================================
  -- Mechanics chapters (40+30+30 = 100%)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, description, estimated_hours, completed, completed_at) VALUES
    (v_ch_newton, v_sub_mechanics, 'Newton''s Laws of Motion', 1, 40.00, 'All three laws with applications', 20.0, TRUE, NOW() - INTERVAL '10 days'),
    (v_ch_kinematics, v_sub_mechanics, 'Kinematics', 2, 30.00, '1D and 2D motion, projectile', 15.0, FALSE, NULL),
    (v_ch_rotation, v_sub_mechanics, 'Rotational Mechanics', 3, 30.00, 'Torque, angular momentum, MI', 25.0, FALSE, NULL);

  -- Electrodynamics chapters (50+50 = 100%)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_coulomb, v_sub_electro, 'Coulomb''s Law & Electric Field', 1, 50.00, 12.0),
    (v_ch_magnetism, v_sub_electro, 'Magnetism', 2, 50.00, 18.0);

  -- Optics chapter (100%)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_refraction, v_sub_optics, 'Refraction & Lenses', 1, 100.00, 10.0);

  -- Organic Chemistry chapters (55+45 = 100%)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_goc, v_sub_organic, 'General Organic Chemistry', 1, 55.00, 30.0),
    (v_ch_alc, v_sub_organic, 'Alcohols & Phenols', 2, 45.00, 20.0);

  -- Calculus chapters (40+30+30 = 100%), Limits completed
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours, completed, completed_at) VALUES
    (v_ch_limits, v_sub_calculus, 'Limits & Continuity', 1, 40.00, 8.0, TRUE, NOW() - INTERVAL '20 days'),
    (v_ch_derivatives, v_sub_calculus, 'Derivatives', 2, 30.00, 15.0, FALSE, NULL),
    (v_ch_integrals, v_sub_calculus, 'Integration', 3, 30.00, 20.0, FALSE, NULL);

  -- Algebra chapter (100%)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage) VALUES
    (v_ch_matrices, v_sub_algebra, 'Matrices & Determinants', 1, 100.00);

  -- English chapter (100%)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage) VALUES
    (v_ch_grammar, v_sub_english, 'Advanced Grammar', 1, 100.00);

  -- DBMS chapters (50+50 = 100%)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_sql, v_sub_dbms, 'SQL Fundamentals', 1, 50.00, 10.0),
    (v_ch_normalization, v_sub_dbms, 'Normalization', 2, 50.00, 8.0);

  -- Hobby chapter (100%)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage) VALUES
    (v_ch_hobby1, v_sub_hobby, 'Basic Scales & Chords', 1, 100.00);

  -- =========================================================
  -- 7. TOPICS
  -- =========================================================
  -- Newton's Laws topics (30+30+40 = 100%)
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags, notes, completed, completed_at) VALUES
    (v_topic_newton1, v_ch_newton, 'First Law - Inertia', 30.00, 'easy', ARRAY['fundamentals','theory'], 'Simple concept, focus on applications', TRUE, NOW() - INTERVAL '15 days'),
    (v_topic_newton2, v_ch_newton, 'Second Law - F=ma', 30.00, 'medium', ARRAY['numericals','important'], 'Practice HCV problems', TRUE, NOW() - INTERVAL '12 days'),
    (v_topic_newton3, v_ch_newton, 'Third Law & Applications', 40.00, 'hard', ARRAY['applications','advanced'], 'Pulley and constraint problems', FALSE, NULL);

  -- Kinematics topics (50+50 = 100%)
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_kin1, v_ch_kinematics, 'Projectile Motion', 50.00, 'medium', ARRAY['numericals','2D']),
    (v_topic_kin2, v_ch_kinematics, 'Relative Motion', 50.00, 'hard', ARRAY['conceptual','tricky']);

  -- Refraction topic (100%)
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_refr1, v_ch_refraction, 'Snell''s Law & TIR', 100.00, 'medium', ARRAY['optics','formula']);

  -- GOC topics (60+40 = 100%)
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags, notes) VALUES
    (v_topic_goc1, v_ch_goc, 'IUPAC Nomenclature', 60.00, 'easy', ARRAY['naming','basics'], 'Master the priority table'),
    (v_topic_goc2, v_ch_goc, 'Reaction Mechanisms', 40.00, 'hard', ARRAY['mechanisms','electron-flow'], 'SN1, SN2, E1, E2 distinctions');

  -- Calculus topics
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags, completed, completed_at) VALUES
    (v_topic_lim1, v_ch_limits, 'L''Hôpital''s Rule', 100.00, 'medium', ARRAY['limits','formula'], TRUE, NOW() - INTERVAL '21 days'),
    (v_topic_deriv1, v_ch_derivatives, 'Chain Rule', 100.00, 'medium', ARRAY['differentiation','chain-rule'], FALSE, NULL),
    (v_topic_int1, v_ch_integrals, 'Integration by Parts', 100.00, 'hard', ARRAY['integration','advanced'], FALSE, NULL);

  -- =========================================================
  -- 8. STUDY SESSIONS CONFIG
  -- =========================================================
  INSERT INTO study_sessions_config (session_config_id, user_id, name, start_time, end_time, days_of_week, color, is_active) VALUES
    (v_sess_morning, v_uid, 'Morning Focus', '06:00', '09:00', '{1,2,3,4,5,6}', '#F59E0B', TRUE),
    (v_sess_afternoon, v_uid, 'Afternoon Study', '14:00', '17:00', '{1,2,3,4,5}', '#3B82F6', TRUE),
    (v_sess_evening, v_uid, 'Evening Revision', '19:00', '21:00', '{1,2,3,4,5,6,7}', '#8B5CF6', TRUE),
    -- Overnight session (end_time < start_time triggers is_overnight=TRUE)
    (v_sess_night, v_uid, 'Night Owl Session', '23:00', '01:30', '{5,6,7}', '#EF4444', TRUE);

  -- =========================================================
  -- 9. USER TASK TYPES (default + custom)
  -- =========================================================
  INSERT INTO user_task_types (user_id, name, icon, default_duration, base_xp, is_custom) VALUES
    (v_uid, 'notes', '📝', 60, 50, FALSE),
    (v_uid, 'lecture', '🎧', 45, 40, FALSE),
    (v_uid, 'revision', '🔄', 30, 60, FALSE),
    (v_uid, 'practice', '✏️', 90, 70, FALSE),
    (v_uid, 'test', '📊', 120, 100, FALSE),
    (v_uid, 'mocktest', '🧪', 180, 150, FALSE),
    (v_uid, 'exam', '📑', 180, 200, FALSE),
    -- Custom types
    (v_uid, 'video_lecture', '🎬', 30, 35, TRUE),
    (v_uid, 'group_study', '👥', 120, 80, TRUE),
    (v_uid, 'piano_practice', '🎹', 45, 55, TRUE);

  -- =========================================================
  -- 10. TASKS (all types, statuses, edge cases)
  -- =========================================================

  -- Task 1: DONE study task, full hierarchy, past date
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, description, task_type, status, priority_number, scheduled_date, scheduled_time_slot, preferred_session_id, estimated_duration, completed_at) VALUES
    (v_task1, v_uid, v_goal_jee, v_sub_mechanics, v_ch_newton, v_topic_newton1, 'Read Newton First Law Notes', 'Go through HC Verma Chapter 5', 'notes', 'done', 2500, CURRENT_DATE - INTERVAL '15 days', 'Morning', v_sess_morning, 60, NOW() - INTERVAL '15 days');

  -- Task 2: DONE lecture task
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, preferred_session_id, estimated_duration, completed_at) VALUES
    (v_task2, v_uid, v_goal_jee, v_sub_mechanics, v_ch_newton, v_topic_newton2, 'Watch F=ma lecture', 'lecture', 'done', 5000, CURRENT_DATE - INTERVAL '12 days', v_sess_afternoon, 45, NOW() - INTERVAL '12 days');

  -- Task 3: IN_PROGRESS practice task (today)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, scheduled_time_slot, preferred_session_id, estimated_duration) VALUES
    (v_task3, v_uid, v_goal_jee, v_sub_mechanics, v_ch_kinematics, v_topic_kin1, 'Solve Projectile Problems Set A', 'practice', 'in_progress', 7500, CURRENT_DATE, 'Afternoon', v_sess_afternoon, 90);

  -- Task 4: SCHEDULED revision task (tomorrow)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, preferred_session_id, estimated_duration) VALUES
    (v_task4, v_uid, v_goal_jee, v_sub_mechanics, v_ch_kinematics, 'Revise Kinematics Formulas', 'revision', 'scheduled', 2500, CURRENT_DATE + INTERVAL '1 day', v_sess_morning, 30);

  -- Task 5: DONE test (exam type) with full exam fields — high accuracy
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, total_questions, attempted_questions, correct_answers, wrong_answers, marks_per_question, negative_marking, time_taken_minutes, marks_obtained, accuracy_percentage, speed_qpm, completed_at) VALUES
    (v_task5, v_uid, v_goal_jee, v_sub_mechanics, v_ch_newton, 'Newton''s Laws Unit Test', 'test', 'done', 5000, CURRENT_DATE - INTERVAL '8 days', 120, 30, 28, 25, 3, 4.00, 1.00, 90, 71.00, 89.29, 0.31, NOW() - INTERVAL '8 days');

  -- Task 6: DONE mocktest — medium accuracy, with negative marking
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, total_questions, attempted_questions, correct_answers, wrong_answers, marks_per_question, negative_marking, time_taken_minutes, marks_obtained, accuracy_percentage, speed_qpm, completed_at) VALUES
    (v_task6, v_uid, v_goal_jee, v_sub_calculus, 'Calculus Mock Test 1', 'mocktest', 'done', 7500, CURRENT_DATE - INTERVAL '5 days', 180, 75, 60, 42, 18, 4.00, 1.00, 170, 150.00, 70.00, 0.35, NOW() - INTERVAL '5 days');

  -- Task 7: DONE exam — perfect score (edge case for badge)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, total_questions, attempted_questions, correct_answers, wrong_answers, marks_per_question, negative_marking, time_taken_minutes, marks_obtained, accuracy_percentage, speed_qpm, completed_at) VALUES
    (v_task7, v_uid, v_goal_boards, v_sub_english, v_ch_grammar, 'Grammar Final Exam', 'exam', 'done', 9999, CURRENT_DATE - INTERVAL '3 days', 120, 50, 50, 50, 0, 2.00, 0.00, 100, 100.00, 100.00, 0.50, NOW() - INTERVAL '3 days');

  -- Task 8: POSTPONED task
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, is_postponed, postponed_to_date, postponed_from_date, estimated_duration) VALUES
    (v_task8, v_uid, v_goal_jee, v_sub_organic, v_ch_goc, 'GOC Reaction Mechanisms Notes', 'notes', 'postponed', 2500, CURRENT_DATE + INTERVAL '3 days', TRUE, CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE - INTERVAL '2 days', 60);

  -- Task 9: PENDING task (no chapter/topic, just goal+subject)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task9, v_uid, v_goal_jee, v_sub_inorganic, 'Periodic Table Revision', 'revision', 'pending', 1000, CURRENT_DATE, 45);

  -- Task 10: Task with only goal_id (no subject)
  INSERT INTO tasks (task_id, user_id, goal_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task10, v_uid, v_goal_custom, 'Piano Finger Exercises', 'practice', 'scheduled', 1000, CURRENT_DATE + INTERVAL '1 day', 30);

  -- Task 11: DONE task with deep hierarchy for custom goal
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, completed_at) VALUES
    (v_task11, v_uid, v_goal_custom, v_sub_hobby, v_ch_hobby1, 'Learn C Major Scale', 'practice', 'done', 2500, CURRENT_DATE - INTERVAL '6 days', 45, NOW() - INTERVAL '6 days');

  -- Task 12: Semester DBMS task
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, preferred_session_id, estimated_duration) VALUES
    (v_task12, v_uid, v_goal_semester, v_sub_dbms, v_ch_sql, 'Practice SQL Joins', 'practice', 'scheduled', 5000, CURRENT_DATE + INTERVAL '2 days', v_sess_evening, 90);

  -- Task 13: DONE video_lecture (custom type)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, completed_at) VALUES
    (v_task13, v_uid, v_goal_jee, v_sub_electro, v_ch_coulomb, 'Electric Field Video Lecture', 'video_lecture', 'done', 2500, CURRENT_DATE - INTERVAL '4 days', 30, NOW() - INTERVAL '4 days');

  -- Task 14: Low priority far-future task
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task14, v_uid, v_goal_jee, v_sub_algebra, v_ch_matrices, 'Matrices Practice Set', 'practice', 'scheduled', 1, CURRENT_DATE + INTERVAL '30 days', 120);

  -- Task 15: Critical priority task for today (night session)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, scheduled_time_slot, preferred_session_id, estimated_duration) VALUES
    (v_task15, v_uid, v_goal_jee, v_sub_calculus, v_ch_derivatives, v_topic_deriv1, 'Chain Rule Deep Dive', 'notes', 'pending', 9000, CURRENT_DATE, 'Night', v_sess_night, 60);

  -- Task 16: DONE task from 30 days ago (for analytics range)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, completed_at) VALUES
    (v_task16, v_uid, v_goal_jee, v_sub_physical, 'Thermodynamics Intro', 'lecture', 'done', 2500, CURRENT_DATE - INTERVAL '30 days', 45, NOW() - INTERVAL '30 days');

  -- Task 17: DONE test with LOW accuracy (edge case)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, total_questions, attempted_questions, correct_answers, wrong_answers, marks_per_question, negative_marking, time_taken_minutes, marks_obtained, accuracy_percentage, speed_qpm, completed_at) VALUES
    (v_task17, v_uid, v_goal_jee, v_sub_optics, 'Optics Quick Quiz', 'test', 'done', 2500, CURRENT_DATE - INTERVAL '7 days', 30, 20, 15, 5, 10, 2.00, 0.50, 25, 5.00, 33.33, 0.60, NOW() - INTERVAL '7 days');

  -- Task 18: Scheduled for yesterday (should auto-transition to pending)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task18, v_uid, v_goal_boards, v_sub_hindi, 'Hindi Essay Writing', 'notes', 'scheduled', 2500, CURRENT_DATE - INTERVAL '1 day', 60);

  -- Task 19: DONE group_study (custom type, no date)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, name, task_type, status, priority_number, estimated_duration, completed_at) VALUES
    (v_task19, v_uid, v_goal_jee, v_sub_mechanics, 'Group Discussion - Rotation', 'group_study', 'done', 5000, 120, NOW() - INTERVAL '9 days');

  -- Task 20: DONE normalization lecture
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, completed_at) VALUES
    (v_task20, v_uid, v_goal_semester, v_sub_dbms, v_ch_normalization, 'Normalization Lecture Notes', 'lecture', 'done', 2500, CURRENT_DATE - INTERVAL '2 days', 45, NOW() - INTERVAL '2 days');

  -- =========================================================
  -- 11. SUBTASKS
  -- =========================================================
  -- Subtasks for task 3 (in_progress practice)
  INSERT INTO subtasks (task_id, title, completed, order_index) VALUES
    (v_task3, 'Solve Q1-Q5 (basic projectile)', TRUE, 1),
    (v_task3, 'Solve Q6-Q10 (angled launch)', TRUE, 2),
    (v_task3, 'Solve Q11-Q15 (projectile on incline)', FALSE, 3),
    (v_task3, 'Review all wrong answers', FALSE, 4);

  -- Subtasks for task 4 (scheduled revision)
  INSERT INTO subtasks (task_id, title, completed, order_index) VALUES
    (v_task4, 'Write formula sheet', FALSE, 1),
    (v_task4, 'Practice dimensional analysis', FALSE, 2),
    (v_task4, 'Solve 5 rapid-fire problems', FALSE, 3);

  -- Subtasks for task 12 (SQL practice)
  INSERT INTO subtasks (task_id, title, completed, order_index) VALUES
    (v_task12, 'INNER JOIN exercises', FALSE, 1),
    (v_task12, 'LEFT/RIGHT JOIN exercises', FALSE, 2),
    (v_task12, 'Self-join and cross-join', FALSE, 3),
    (v_task12, 'Subqueries with joins', FALSE, 4),
    (v_task12, 'Performance optimization', FALSE, 5);

  -- Subtasks for a completed task (all done)
  INSERT INTO subtasks (task_id, title, completed, order_index) VALUES
    (v_task1, 'Read sections 5.1-5.3', TRUE, 1),
    (v_task1, 'Summarize key points', TRUE, 2),
    (v_task1, 'Solve in-text questions', TRUE, 3);

  -- =========================================================
  -- 12. TIMER SESSIONS (various scenarios)
  -- =========================================================
  -- Timer 1: Normal focus session for done task 1
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type, is_pomodoro, pomodoro_cycle, paused_duration_seconds) VALUES
    (v_timer1, v_task1, v_uid, NOW() - INTERVAL '15 days 2 hours', NOW() - INTERVAL '15 days 1 hour', 'focus', TRUE, 1, 0);

  -- Timer 2: Second pomodoro cycle for task 1
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type, is_pomodoro, pomodoro_cycle, paused_duration_seconds) VALUES
    (v_timer2, v_task1, v_uid, NOW() - INTERVAL '15 days 50 minutes', NOW() - INTERVAL '15 days', 'focus', TRUE, 2, 120);

  -- Timer 3: Break session
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type, is_pomodoro, pomodoro_cycle) VALUES
    (v_timer3, v_task1, v_uid, NOW() - INTERVAL '15 days 1 hour', NOW() - INTERVAL '15 days 50 minutes', 'break', TRUE, 1);

  -- Timer 4: Long session for task 2
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type, is_pomodoro, paused_duration_seconds) VALUES
    (v_timer4, v_task2, v_uid, NOW() - INTERVAL '12 days 3 hours', NOW() - INTERVAL '12 days 1 hour 30 minutes', 'focus', FALSE, 300);

  -- Timer 5: Session for in-progress task 3 (today, still going)
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type, is_pomodoro, pomodoro_cycle) VALUES
    (v_timer5, v_task3, v_uid, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '20 minutes', 'focus', TRUE, 1);

  -- Timer 6: Short focus session for task 11 (piano)
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type) VALUES
    (v_timer6, v_task11, v_uid, NOW() - INTERVAL '6 days 1 hour', NOW() - INTERVAL '6 days 15 minutes', 'focus');

  -- Timer 7: Session for task 13 (video lecture)
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type) VALUES
    (v_timer7, v_task13, v_uid, NOW() - INTERVAL '4 days 35 minutes', NOW() - INTERVAL '4 days', 'focus');

  -- Timer 8: Session for exam task 5
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type) VALUES
    (v_timer8, v_task5, v_uid, NOW() - INTERVAL '8 days 2 hours', NOW() - INTERVAL '8 days 30 minutes', 'focus');

  -- Timer 9: Session for mock test task 6
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type, paused_duration_seconds) VALUES
    (v_timer9, v_task6, v_uid, NOW() - INTERVAL '5 days 3 hours', NOW() - INTERVAL '5 days 10 minutes', 'focus', 180);

  -- Timer 10: Very short session (edge case: just over 60s minimum)
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type) VALUES
    (v_timer10, v_task19, v_uid, NOW() - INTERVAL '9 days 2 minutes', NOW() - INTERVAL '9 days 55 seconds', 'focus');

  -- Timer 11: Late night session (for night owl study session validation)
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type) VALUES
    (v_timer11, v_task15, v_uid, (CURRENT_DATE - 1)::TIMESTAMP + INTERVAL '23 hours', (CURRENT_DATE)::TIMESTAMP + INTERVAL '0 hours 45 minutes', 'focus');

  -- Timer 12: Session for task 20
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type) VALUES
    (v_timer12, v_task20, v_uid, NOW() - INTERVAL '2 days 50 minutes', NOW() - INTERVAL '2 days 5 minutes', 'focus');

  -- =========================================================
  -- 13. HOLIDAYS (streak preservation)
  -- =========================================================
  INSERT INTO holidays (user_id, date, holiday_type, reason) VALUES
    (v_uid, CURRENT_DATE - INTERVAL '18 days', 'National Holiday', 'Republic Day'),
    (v_uid, CURRENT_DATE - INTERVAL '14 days', 'Holiday', 'Family function'),
    (v_uid, CURRENT_DATE + INTERVAL '5 days', 'Holiday', 'Planned break'),
    (v_uid, CURRENT_DATE + INTERVAL '15 days', 'Festival', 'Holi'),
    (v_uid, CURRENT_DATE - INTERVAL '25 days', 'Sick Leave', 'Was unwell'),
    -- Edge case: holiday on a past study day (retroactive freeze)
    (v_uid, CURRENT_DATE - INTERVAL '7 days', 'Holiday', 'Retroactive freeze test');

  -- =========================================================
  -- 14. USER BADGES (some unlocked)
  -- =========================================================
  INSERT INTO user_badges (user_id, badge_id, unlocked_at) VALUES
    (v_uid, 'first_goal', NOW() - INTERVAL '45 days'),
    (v_uid, 'first_timer', NOW() - INTERVAL '44 days'),
    (v_uid, 'first_exam', NOW() - INTERVAL '8 days'),
    (v_uid, 'streak_7', NOW() - INTERVAL '20 days'),
    (v_uid, 'tasks_10', NOW() - INTERVAL '10 days'),
    (v_uid, 'time_10h', NOW() - INTERVAL '15 days'),
    (v_uid, 'exam_90', NOW() - INTERVAL '8 days'),
    (v_uid, 'exam_perfect', NOW() - INTERVAL '3 days');

  -- =========================================================
  -- 15. BACKUPS METADATA
  -- =========================================================
  INSERT INTO backups_metadata (user_id, filename, size_bytes, include_archived) VALUES
    (v_uid, 'studytracker-backup-2026-01-15.json', 245000, TRUE),
    (v_uid, 'studytracker-backup-2026-02-01.json', 512000, FALSE);

  RAISE NOTICE '✅ Demo data seeded successfully for user %', v_uid;
END $$;
