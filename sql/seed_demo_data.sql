-- =============================================================
-- DEMO SEED DATA for DEMO@EXAMPLE.COM
-- Comprehensive data covering all tables, edge cases, and 
-- trigger/function validation scenarios.
-- Expanded: richer hierarchy, many tasks across dates/statuses.
-- =============================================================

DO $$
DECLARE
  v_uid UUID;

  -- Projects
  v_proj_academic UUID := gen_random_uuid();
  v_proj_competitive UUID := gen_random_uuid();
  v_proj_personal UUID := gen_random_uuid();

  -- Goals
  v_goal_jee UUID := gen_random_uuid();
  v_goal_boards UUID := gen_random_uuid();
  v_goal_semester UUID := gen_random_uuid();
  v_goal_custom UUID := gen_random_uuid();
  v_goal_olympiad UUID := gen_random_uuid();

  -- Streams (JEE has PCM streams)
  v_stream_physics UUID := gen_random_uuid();
  v_stream_chemistry UUID := gen_random_uuid();
  v_stream_maths UUID := gen_random_uuid();
  -- Boards streams
  v_stream_lang UUID := gen_random_uuid();
  v_stream_science UUID := gen_random_uuid();

  -- Subjects (Physics)
  v_sub_mechanics UUID := gen_random_uuid();
  v_sub_electro UUID := gen_random_uuid();
  v_sub_optics UUID := gen_random_uuid();
  v_sub_thermo UUID := gen_random_uuid();
  v_sub_waves UUID := gen_random_uuid();
  -- Subjects (Chemistry)
  v_sub_organic UUID := gen_random_uuid();
  v_sub_inorganic UUID := gen_random_uuid();
  v_sub_physical UUID := gen_random_uuid();
  -- Subjects (Maths)
  v_sub_calculus UUID := gen_random_uuid();
  v_sub_algebra UUID := gen_random_uuid();
  v_sub_coord UUID := gen_random_uuid();
  v_sub_stats UUID := gen_random_uuid();
  -- Subjects (Boards)
  v_sub_english UUID := gen_random_uuid();
  v_sub_hindi UUID := gen_random_uuid();
  v_sub_bio UUID := gen_random_uuid();
  v_sub_phy_board UUID := gen_random_uuid();
  -- Subjects (Semester)
  v_sub_cs UUID := gen_random_uuid();
  v_sub_dbms UUID := gen_random_uuid();
  v_sub_os UUID := gen_random_uuid();
  -- Subjects (Custom/Olympiad)
  v_sub_hobby UUID := gen_random_uuid();
  v_sub_oly_math UUID := gen_random_uuid();
  v_sub_oly_logic UUID := gen_random_uuid();

  -- Chapters (Mechanics)
  v_ch_newton UUID := gen_random_uuid();
  v_ch_kinematics UUID := gen_random_uuid();
  v_ch_rotation UUID := gen_random_uuid();
  v_ch_energy UUID := gen_random_uuid();
  v_ch_gravitation UUID := gen_random_uuid();
  -- Chapters (Electro)
  v_ch_coulomb UUID := gen_random_uuid();
  v_ch_magnetism UUID := gen_random_uuid();
  v_ch_emf UUID := gen_random_uuid();
  v_ch_circuits UUID := gen_random_uuid();
  -- Chapters (Optics)
  v_ch_refraction UUID := gen_random_uuid();
  v_ch_wave_optics UUID := gen_random_uuid();
  -- Chapters (Thermo)
  v_ch_thermo_laws UUID := gen_random_uuid();
  v_ch_kinetic_theory UUID := gen_random_uuid();
  -- Chapters (Waves)
  v_ch_shm UUID := gen_random_uuid();
  v_ch_sound UUID := gen_random_uuid();
  -- Chapters (Organic)
  v_ch_goc UUID := gen_random_uuid();
  v_ch_alc UUID := gen_random_uuid();
  v_ch_carbonyl UUID := gen_random_uuid();
  v_ch_amines UUID := gen_random_uuid();
  -- Chapters (Inorganic)
  v_ch_periodic UUID := gen_random_uuid();
  v_ch_coord_chem UUID := gen_random_uuid();
  -- Chapters (Physical Chem)
  v_ch_equil UUID := gen_random_uuid();
  v_ch_electrochemistry UUID := gen_random_uuid();
  -- Chapters (Calculus)
  v_ch_limits UUID := gen_random_uuid();
  v_ch_derivatives UUID := gen_random_uuid();
  v_ch_integrals UUID := gen_random_uuid();
  v_ch_diff_eq UUID := gen_random_uuid();
  -- Chapters (Algebra)
  v_ch_matrices UUID := gen_random_uuid();
  v_ch_complex UUID := gen_random_uuid();
  v_ch_sequences UUID := gen_random_uuid();
  -- Chapters (Coord Geo)
  v_ch_straight_lines UUID := gen_random_uuid();
  v_ch_conics UUID := gen_random_uuid();
  -- Chapters (Stats)
  v_ch_probability UUID := gen_random_uuid();
  -- Chapters (Boards)
  v_ch_grammar UUID := gen_random_uuid();
  v_ch_writing UUID := gen_random_uuid();
  v_ch_literature UUID := gen_random_uuid();
  -- Chapters (Semester)
  v_ch_sql UUID := gen_random_uuid();
  v_ch_normalization UUID := gen_random_uuid();
  v_ch_linked_list UUID := gen_random_uuid();
  v_ch_trees UUID := gen_random_uuid();
  v_ch_process UUID := gen_random_uuid();
  -- Chapters (Hobby)
  v_ch_hobby1 UUID := gen_random_uuid();
  -- Chapters (Olympiad)
  v_ch_number_theory UUID := gen_random_uuid();
  v_ch_combinatorics UUID := gen_random_uuid();

  -- Topics (many for testing the flat grid)
  v_topic_newton1 UUID := gen_random_uuid();
  v_topic_newton2 UUID := gen_random_uuid();
  v_topic_newton3 UUID := gen_random_uuid();
  v_topic_kin1 UUID := gen_random_uuid();
  v_topic_kin2 UUID := gen_random_uuid();
  v_topic_kin3 UUID := gen_random_uuid();
  v_topic_rot1 UUID := gen_random_uuid();
  v_topic_rot2 UUID := gen_random_uuid();
  v_topic_energy1 UUID := gen_random_uuid();
  v_topic_energy2 UUID := gen_random_uuid();
  v_topic_refr1 UUID := gen_random_uuid();
  v_topic_refr2 UUID := gen_random_uuid();
  v_topic_wave_opt1 UUID := gen_random_uuid();
  v_topic_goc1 UUID := gen_random_uuid();
  v_topic_goc2 UUID := gen_random_uuid();
  v_topic_goc3 UUID := gen_random_uuid();
  v_topic_alc1 UUID := gen_random_uuid();
  v_topic_carbonyl1 UUID := gen_random_uuid();
  v_topic_lim1 UUID := gen_random_uuid();
  v_topic_lim2 UUID := gen_random_uuid();
  v_topic_deriv1 UUID := gen_random_uuid();
  v_topic_deriv2 UUID := gen_random_uuid();
  v_topic_int1 UUID := gen_random_uuid();
  v_topic_int2 UUID := gen_random_uuid();
  v_topic_matrices1 UUID := gen_random_uuid();
  v_topic_complex1 UUID := gen_random_uuid();
  v_topic_lines1 UUID := gen_random_uuid();
  v_topic_conics1 UUID := gen_random_uuid();
  v_topic_prob1 UUID := gen_random_uuid();
  v_topic_coulomb1 UUID := gen_random_uuid();
  v_topic_coulomb2 UUID := gen_random_uuid();
  v_topic_mag1 UUID := gen_random_uuid();
  v_topic_shm1 UUID := gen_random_uuid();
  v_topic_shm2 UUID := gen_random_uuid();

  -- Study sessions config
  v_sess_morning UUID := gen_random_uuid();
  v_sess_afternoon UUID := gen_random_uuid();
  v_sess_evening UUID := gen_random_uuid();
  v_sess_night UUID := gen_random_uuid();

  -- Tasks (40 tasks for comprehensive coverage)
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
  v_task21 UUID := gen_random_uuid();
  v_task22 UUID := gen_random_uuid();
  v_task23 UUID := gen_random_uuid();
  v_task24 UUID := gen_random_uuid();
  v_task25 UUID := gen_random_uuid();
  v_task26 UUID := gen_random_uuid();
  v_task27 UUID := gen_random_uuid();
  v_task28 UUID := gen_random_uuid();
  v_task29 UUID := gen_random_uuid();
  v_task30 UUID := gen_random_uuid();
  v_task31 UUID := gen_random_uuid();
  v_task32 UUID := gen_random_uuid();
  v_task33 UUID := gen_random_uuid();
  v_task34 UUID := gen_random_uuid();
  v_task35 UUID := gen_random_uuid();
  v_task36 UUID := gen_random_uuid();
  v_task37 UUID := gen_random_uuid();
  v_task38 UUID := gen_random_uuid();
  v_task39 UUID := gen_random_uuid();
  v_task40 UUID := gen_random_uuid();

  -- Timer sessions (20 for rich analytics)
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
  v_timer13 UUID := gen_random_uuid();
  v_timer14 UUID := gen_random_uuid();
  v_timer15 UUID := gen_random_uuid();
  v_timer16 UUID := gen_random_uuid();
  v_timer17 UUID := gen_random_uuid();
  v_timer18 UUID := gen_random_uuid();
  v_timer19 UUID := gen_random_uuid();
  v_timer20 UUID := gen_random_uuid();

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
  -- 1. USER PROFILE
  -- =========================================================
  UPDATE user_profiles SET
    username = 'DemoStudent',
    total_xp = 8250,
    lifetime_xp = 8250,
    current_streak = 12,
    longest_streak = 25,
    last_study_date = CURRENT_DATE - INTERVAL '1 day',
    total_study_days = 65,
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
    (v_proj_competitive, v_uid, 'JEE Preparation', 'Comprehensive JEE Main + Advanced prep', '#3B82F6', '🎓'),
    (v_proj_personal, v_uid, 'Personal Growth', 'Self-improvement and hobby projects', '#EC4899', '🌟');

  -- =========================================================
  -- 3. GOALS (5 goals, all types)
  -- =========================================================
  INSERT INTO goals (goal_id, user_id, project_id, name, description, goal_type, target_date, color, icon, weightage_enabled) VALUES
    (v_goal_jee, v_uid, v_proj_competitive, 'JEE Advanced 2026', 'Joint Entrance Exam preparation with full PCM coverage', 'competitive', '2026-05-15', '#EF4444', '🏆', TRUE),
    (v_goal_boards, v_uid, v_proj_academic, 'Board Exams 12th', 'CBSE Class 12 Board Exams — Languages + Science', 'board', '2026-03-01', '#3B82F6', '📋', TRUE),
    (v_goal_semester, v_uid, NULL, 'Semester 3 - CS', 'Computer Science Semester 3', 'semester', '2026-04-30', '#F59E0B', '🎓', FALSE),
    (v_goal_custom, v_uid, v_proj_personal, 'Learn Piano', 'Self-paced piano learning', 'custom', NULL, '#EC4899', '🎹', FALSE),
    (v_goal_olympiad, v_uid, v_proj_competitive, 'Math Olympiad', 'Regional Mathematics Olympiad preparation', 'competitive', '2026-06-20', '#8B5CF6', '🧠', TRUE);

  -- =========================================================
  -- 4. STREAMS
  -- =========================================================
  -- JEE: 3 streams (PCM)
  INSERT INTO streams (stream_id, goal_id, name, weightage, color) VALUES
    (v_stream_physics, v_goal_jee, 'Physics', 35.00, '#EF4444'),
    (v_stream_chemistry, v_goal_jee, 'Chemistry', 30.00, '#22C55E'),
    (v_stream_maths, v_goal_jee, 'Mathematics', 35.00, '#3B82F6');

  -- Boards: 2 streams
  INSERT INTO streams (stream_id, goal_id, name, weightage, color) VALUES
    (v_stream_lang, v_goal_boards, 'Languages', 40.00, '#F97316'),
    (v_stream_science, v_goal_boards, 'Science', 60.00, '#22C55E');

  -- =========================================================
  -- 5. SUBJECTS
  -- =========================================================
  -- JEE Physics (5 subjects)
  INSERT INTO subjects (subject_id, goal_id, stream_id, name, weightage, color, icon, total_chapters, completed_chapters) VALUES
    (v_sub_mechanics, v_goal_jee, v_stream_physics, 'Mechanics', 30.00, '#EF4444', '⚙️', 5, 1),
    (v_sub_electro, v_goal_jee, v_stream_physics, 'Electrodynamics', 25.00, '#F97316', '⚡', 4, 0),
    (v_sub_optics, v_goal_jee, v_stream_physics, 'Optics', 15.00, '#06B6D4', '🔬', 2, 0),
    (v_sub_thermo, v_goal_jee, v_stream_physics, 'Thermodynamics', 15.00, '#EAB308', '🌡️', 2, 0),
    (v_sub_waves, v_goal_jee, v_stream_physics, 'Waves & SHM', 15.00, '#8B5CF6', '🌊', 2, 0);

  -- JEE Chemistry (3 subjects)
  INSERT INTO subjects (subject_id, goal_id, stream_id, name, weightage, color, icon, total_chapters, completed_chapters) VALUES
    (v_sub_organic, v_goal_jee, v_stream_chemistry, 'Organic Chemistry', 40.00, '#84CC16', '🧪', 4, 0),
    (v_sub_inorganic, v_goal_jee, v_stream_chemistry, 'Inorganic Chemistry', 30.00, '#14B8A6', '🔩', 2, 0),
    (v_sub_physical, v_goal_jee, v_stream_chemistry, 'Physical Chemistry', 30.00, '#EAB308', '⚗️', 2, 0);

  -- JEE Maths (4 subjects)
  INSERT INTO subjects (subject_id, goal_id, stream_id, name, weightage, color, icon, total_chapters, completed_chapters) VALUES
    (v_sub_calculus, v_goal_jee, v_stream_maths, 'Calculus', 35.00, '#6366F1', '📐', 4, 1),
    (v_sub_algebra, v_goal_jee, v_stream_maths, 'Algebra', 25.00, '#8B5CF6', '🧮', 3, 0),
    (v_sub_coord, v_goal_jee, v_stream_maths, 'Coordinate Geometry', 25.00, '#EC4899', '📏', 2, 0),
    (v_sub_stats, v_goal_jee, v_stream_maths, 'Probability & Stats', 15.00, '#F59E0B', '🎲', 1, 0);

  -- Board Language subjects
  INSERT INTO subjects (subject_id, goal_id, stream_id, name, weightage, color, icon, total_chapters, completed_chapters) VALUES
    (v_sub_english, v_goal_boards, v_stream_lang, 'English', 50.00, '#F97316', '📖', 3, 0),
    (v_sub_hindi, v_goal_boards, v_stream_lang, 'Hindi', 50.00, '#EC4899', '📝', 0, 0);

  -- Board Science subjects
  INSERT INTO subjects (subject_id, goal_id, stream_id, name, weightage, color, icon, total_chapters, completed_chapters) VALUES
    (v_sub_bio, v_goal_boards, v_stream_science, 'Biology', 50.00, '#22C55E', '🧬', 0, 0),
    (v_sub_phy_board, v_goal_boards, v_stream_science, 'Physics (Board)', 50.00, '#3B82F6', '⚛️', 0, 0);

  -- Semester subjects
  INSERT INTO subjects (subject_id, goal_id, stream_id, name, weightage, color, icon, total_chapters, completed_chapters) VALUES
    (v_sub_cs, v_goal_semester, NULL, 'Data Structures', 0, '#22C55E', '💻', 2, 0),
    (v_sub_dbms, v_goal_semester, NULL, 'DBMS', 0, '#3B82F6', '🗄️', 2, 0),
    (v_sub_os, v_goal_semester, NULL, 'Operating Systems', 0, '#EF4444', '🖥️', 1, 0);

  -- Custom goal (Piano)
  INSERT INTO subjects (subject_id, goal_id, stream_id, name, weightage, color, icon, total_chapters, completed_chapters) VALUES
    (v_sub_hobby, v_goal_custom, NULL, 'Piano Basics', 0, '#EC4899', '🎹', 1, 0);

  -- Olympiad
  INSERT INTO subjects (subject_id, goal_id, stream_id, name, weightage, color, icon, total_chapters, completed_chapters) VALUES
    (v_sub_oly_math, v_goal_olympiad, NULL, 'Olympiad Mathematics', 60.00, '#8B5CF6', '🧮', 2, 0),
    (v_sub_oly_logic, v_goal_olympiad, NULL, 'Logic & Reasoning', 40.00, '#06B6D4', '🧩', 0, 0);

  -- =========================================================
  -- 6. CHAPTERS
  -- =========================================================
  -- Mechanics (5 chapters)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, description, estimated_hours, completed, completed_at) VALUES
    (v_ch_newton, v_sub_mechanics, 'Newton''s Laws of Motion', 1, 25.00, 'All three laws with applications', 20.0, TRUE, NOW() - INTERVAL '10 days'),
    (v_ch_kinematics, v_sub_mechanics, 'Kinematics', 2, 25.00, '1D and 2D motion, projectile', 15.0, FALSE, NULL),
    (v_ch_rotation, v_sub_mechanics, 'Rotational Mechanics', 3, 20.00, 'Torque, angular momentum, MI', 25.0, FALSE, NULL),
    (v_ch_energy, v_sub_mechanics, 'Work, Energy & Power', 4, 15.00, 'Conservation laws, collisions', 12.0, FALSE, NULL),
    (v_ch_gravitation, v_sub_mechanics, 'Gravitation', 5, 15.00, 'Kepler''s laws, orbital mechanics', 10.0, FALSE, NULL);

  -- Electrodynamics (4 chapters)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_coulomb, v_sub_electro, 'Coulomb''s Law & Electric Field', 1, 30.00, 12.0),
    (v_ch_magnetism, v_sub_electro, 'Magnetism', 2, 25.00, 18.0),
    (v_ch_emf, v_sub_electro, 'Electromagnetic Induction', 3, 25.00, 15.0),
    (v_ch_circuits, v_sub_electro, 'DC & AC Circuits', 4, 20.00, 14.0);

  -- Optics (2 chapters)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_refraction, v_sub_optics, 'Refraction & Lenses', 1, 50.00, 10.0),
    (v_ch_wave_optics, v_sub_optics, 'Wave Optics', 2, 50.00, 12.0);

  -- Thermodynamics (2 chapters)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_thermo_laws, v_sub_thermo, 'Laws of Thermodynamics', 1, 60.00, 15.0),
    (v_ch_kinetic_theory, v_sub_thermo, 'Kinetic Theory of Gases', 2, 40.00, 10.0);

  -- Waves (2 chapters)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_shm, v_sub_waves, 'Simple Harmonic Motion', 1, 50.00, 12.0),
    (v_ch_sound, v_sub_waves, 'Sound Waves', 2, 50.00, 10.0);

  -- Organic Chemistry (4 chapters)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_goc, v_sub_organic, 'General Organic Chemistry', 1, 30.00, 30.0),
    (v_ch_alc, v_sub_organic, 'Alcohols & Phenols', 2, 25.00, 20.0),
    (v_ch_carbonyl, v_sub_organic, 'Carbonyl Compounds', 3, 25.00, 22.0),
    (v_ch_amines, v_sub_organic, 'Amines', 4, 20.00, 15.0);

  -- Inorganic Chemistry (2 chapters)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_periodic, v_sub_inorganic, 'Periodic Table & Properties', 1, 50.00, 12.0),
    (v_ch_coord_chem, v_sub_inorganic, 'Coordination Chemistry', 2, 50.00, 18.0);

  -- Physical Chemistry (2 chapters)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_equil, v_sub_physical, 'Chemical Equilibrium', 1, 50.00, 14.0),
    (v_ch_electrochemistry, v_sub_physical, 'Electrochemistry', 2, 50.00, 16.0);

  -- Calculus (4 chapters)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours, completed, completed_at) VALUES
    (v_ch_limits, v_sub_calculus, 'Limits & Continuity', 1, 25.00, 8.0, TRUE, NOW() - INTERVAL '20 days'),
    (v_ch_derivatives, v_sub_calculus, 'Derivatives', 2, 25.00, 15.0, FALSE, NULL),
    (v_ch_integrals, v_sub_calculus, 'Integration', 3, 30.00, 20.0, FALSE, NULL),
    (v_ch_diff_eq, v_sub_calculus, 'Differential Equations', 4, 20.00, 18.0, FALSE, NULL);

  -- Algebra (3 chapters)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage) VALUES
    (v_ch_matrices, v_sub_algebra, 'Matrices & Determinants', 1, 35.00),
    (v_ch_complex, v_sub_algebra, 'Complex Numbers', 2, 35.00),
    (v_ch_sequences, v_sub_algebra, 'Sequences & Series', 3, 30.00);

  -- Coordinate Geometry (2 chapters)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_straight_lines, v_sub_coord, 'Straight Lines', 1, 40.00, 10.0),
    (v_ch_conics, v_sub_coord, 'Conic Sections', 2, 60.00, 20.0);

  -- Stats (1 chapter)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_probability, v_sub_stats, 'Probability', 1, 100.00, 15.0);

  -- English (3 chapters)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage) VALUES
    (v_ch_grammar, v_sub_english, 'Advanced Grammar', 1, 30.00),
    (v_ch_writing, v_sub_english, 'Creative Writing', 2, 40.00),
    (v_ch_literature, v_sub_english, 'Literature Analysis', 3, 30.00);

  -- DBMS (2 chapters)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_sql, v_sub_dbms, 'SQL Fundamentals', 1, 50.00, 10.0),
    (v_ch_normalization, v_sub_dbms, 'Normalization', 2, 50.00, 8.0);

  -- Data Structures (2 chapters)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_linked_list, v_sub_cs, 'Linked Lists', 1, 40.00, 12.0),
    (v_ch_trees, v_sub_cs, 'Trees & BST', 2, 60.00, 18.0);

  -- OS (1 chapter)
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_process, v_sub_os, 'Process Management', 1, 100.00, 15.0);

  -- Hobby
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage) VALUES
    (v_ch_hobby1, v_sub_hobby, 'Basic Scales & Chords', 1, 100.00);

  -- Olympiad Math
  INSERT INTO chapters (chapter_id, subject_id, name, chapter_number, weightage, estimated_hours) VALUES
    (v_ch_number_theory, v_sub_oly_math, 'Number Theory', 1, 50.00, 25.0),
    (v_ch_combinatorics, v_sub_oly_math, 'Combinatorics', 2, 50.00, 20.0);

  -- =========================================================
  -- 7. TOPICS (rich set for flat grid testing)
  -- =========================================================
  -- Newton's Laws (3 topics)
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags, notes, completed, completed_at) VALUES
    (v_topic_newton1, v_ch_newton, 'First Law - Inertia', 30.00, 'easy', ARRAY['fundamentals','theory'], 'Simple concept, focus on applications', TRUE, NOW() - INTERVAL '15 days'),
    (v_topic_newton2, v_ch_newton, 'Second Law - F=ma', 30.00, 'medium', ARRAY['numericals','important'], 'Practice HCV problems', TRUE, NOW() - INTERVAL '12 days'),
    (v_topic_newton3, v_ch_newton, 'Third Law & Applications', 40.00, 'hard', ARRAY['applications','advanced'], 'Pulley and constraint problems', FALSE, NULL);

  -- Kinematics (3 topics)
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_kin1, v_ch_kinematics, 'Projectile Motion', 35.00, 'medium', ARRAY['numericals','2D']),
    (v_topic_kin2, v_ch_kinematics, 'Relative Motion', 35.00, 'hard', ARRAY['conceptual','tricky']),
    (v_topic_kin3, v_ch_kinematics, 'Circular Motion', 30.00, 'hard', ARRAY['rotation','centripetal']);

  -- Rotation (2 topics)
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_rot1, v_ch_rotation, 'Moment of Inertia', 50.00, 'hard', ARRAY['MOI','calculation']),
    (v_topic_rot2, v_ch_rotation, 'Angular Momentum', 50.00, 'hard', ARRAY['conservation','advanced']);

  -- Work & Energy (2 topics)
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_energy1, v_ch_energy, 'Work-Energy Theorem', 50.00, 'medium', ARRAY['theorem','basics']),
    (v_topic_energy2, v_ch_energy, 'Conservation of Energy', 50.00, 'medium', ARRAY['conservation','collisions']);

  -- Refraction (2 topics)
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_refr1, v_ch_refraction, 'Snell''s Law & TIR', 50.00, 'medium', ARRAY['optics','formula']),
    (v_topic_refr2, v_ch_refraction, 'Thin Lens Formula', 50.00, 'easy', ARRAY['optics','lens']);

  -- Wave Optics
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_wave_opt1, v_ch_wave_optics, 'Young''s Double Slit', 100.00, 'hard', ARRAY['interference','YDSE']);

  -- GOC (3 topics)
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags, notes) VALUES
    (v_topic_goc1, v_ch_goc, 'IUPAC Nomenclature', 40.00, 'easy', ARRAY['naming','basics'], 'Master the priority table'),
    (v_topic_goc2, v_ch_goc, 'Reaction Mechanisms', 30.00, 'hard', ARRAY['mechanisms','electron-flow'], 'SN1, SN2, E1, E2'),
    (v_topic_goc3, v_ch_goc, 'Isomerism', 30.00, 'medium', ARRAY['isomers','structural'], 'Optical, geometric, structural');

  -- Alcohols
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_alc1, v_ch_alc, 'Reactions of Alcohols', 100.00, 'medium', ARRAY['reactions','organic']);

  -- Carbonyl
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_carbonyl1, v_ch_carbonyl, 'Aldol Condensation', 100.00, 'hard', ARRAY['reactions','aldol']);

  -- Limits (2 topics)
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags, completed, completed_at) VALUES
    (v_topic_lim1, v_ch_limits, 'L''Hôpital''s Rule', 50.00, 'medium', ARRAY['limits','formula'], TRUE, NOW() - INTERVAL '21 days'),
    (v_topic_lim2, v_ch_limits, 'Squeeze Theorem', 50.00, 'easy', ARRAY['limits','theorem'], TRUE, NOW() - INTERVAL '20 days');

  -- Derivatives (2 topics)
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_deriv1, v_ch_derivatives, 'Chain Rule', 50.00, 'medium', ARRAY['differentiation','chain-rule']),
    (v_topic_deriv2, v_ch_derivatives, 'Maxima & Minima', 50.00, 'hard', ARRAY['applications','optimization']);

  -- Integration (2 topics)
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_int1, v_ch_integrals, 'Integration by Parts', 50.00, 'hard', ARRAY['integration','advanced']),
    (v_topic_int2, v_ch_integrals, 'Definite Integrals', 50.00, 'medium', ARRAY['integration','area']);

  -- Matrices
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_matrices1, v_ch_matrices, 'Inverse & Adjoint', 100.00, 'medium', ARRAY['matrices','linear-algebra']);

  -- Complex Numbers
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_complex1, v_ch_complex, 'Argand Plane', 100.00, 'medium', ARRAY['complex','geometry']);

  -- Straight Lines
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_lines1, v_ch_straight_lines, 'Slope & Intercept Forms', 100.00, 'easy', ARRAY['coordinate','basics']);

  -- Conics
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_conics1, v_ch_conics, 'Parabola', 100.00, 'hard', ARRAY['conics','parabola']);

  -- Probability
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_prob1, v_ch_probability, 'Bayes'' Theorem', 100.00, 'hard', ARRAY['probability','conditional']);

  -- Coulomb (2 topics)
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_coulomb1, v_ch_coulomb, 'Electric Field Lines', 50.00, 'easy', ARRAY['field','visualization']),
    (v_topic_coulomb2, v_ch_coulomb, 'Gauss''s Law', 50.00, 'hard', ARRAY['gauss','flux']);

  -- Magnetism
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_mag1, v_ch_magnetism, 'Biot-Savart Law', 100.00, 'hard', ARRAY['magnetism','law']);

  -- SHM (2 topics)
  INSERT INTO topics (topic_id, chapter_id, name, weightage, difficulty, tags) VALUES
    (v_topic_shm1, v_ch_shm, 'Spring-Mass System', 50.00, 'medium', ARRAY['SHM','spring']),
    (v_topic_shm2, v_ch_shm, 'Simple Pendulum', 50.00, 'easy', ARRAY['SHM','pendulum']);

  -- =========================================================
  -- 8. STUDY SESSIONS CONFIG
  -- =========================================================
  INSERT INTO study_sessions_config (session_config_id, user_id, name, start_time, end_time, days_of_week, color, is_active) VALUES
    (v_sess_morning, v_uid, 'Morning Focus', '06:00', '09:00', '{1,2,3,4,5,6}', '#F59E0B', TRUE),
    (v_sess_afternoon, v_uid, 'Afternoon Study', '14:00', '17:00', '{1,2,3,4,5}', '#3B82F6', TRUE),
    (v_sess_evening, v_uid, 'Evening Revision', '19:00', '21:00', '{1,2,3,4,5,6,7}', '#8B5CF6', TRUE),
    (v_sess_night, v_uid, 'Night Owl Session', '23:00', '01:30', '{5,6,7}', '#EF4444', TRUE);

  -- =========================================================
  -- 9. USER TASK TYPES
  -- =========================================================
  INSERT INTO user_task_types (user_id, name, icon, default_duration, base_xp, is_custom) VALUES
    (v_uid, 'notes', '📝', 60, 50, FALSE),
    (v_uid, 'lecture', '🎧', 45, 40, FALSE),
    (v_uid, 'revision', '🔄', 30, 60, FALSE),
    (v_uid, 'practice', '✏️', 90, 70, FALSE),
    (v_uid, 'test', '📊', 120, 100, FALSE),
    (v_uid, 'mocktest', '🧪', 180, 150, FALSE),
    (v_uid, 'exam', '📑', 180, 200, FALSE),
    (v_uid, 'video_lecture', '🎬', 30, 35, TRUE),
    (v_uid, 'group_study', '👥', 120, 80, TRUE),
    (v_uid, 'piano_practice', '🎹', 45, 55, TRUE);

  -- =========================================================
  -- 10. TASKS (40 tasks — diverse statuses, dates, types)
  -- =========================================================

  -- === DONE tasks (past) ===
  -- T1: Done notes, full hierarchy, 15 days ago
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, description, task_type, status, priority_number, scheduled_date, scheduled_time_slot, preferred_session_id, estimated_duration, completed_at) VALUES
    (v_task1, v_uid, v_goal_jee, v_sub_mechanics, v_ch_newton, v_topic_newton1, 'Read Newton First Law Notes', 'Go through HC Verma Chapter 5', 'notes', 'done', 2500, CURRENT_DATE - INTERVAL '15 days', 'Morning', v_sess_morning, 60, NOW() - INTERVAL '15 days');

  -- T2: Done lecture, 12 days ago
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, preferred_session_id, estimated_duration, completed_at) VALUES
    (v_task2, v_uid, v_goal_jee, v_sub_mechanics, v_ch_newton, v_topic_newton2, 'Watch F=ma lecture', 'lecture', 'done', 5000, CURRENT_DATE - INTERVAL '12 days', v_sess_afternoon, 45, NOW() - INTERVAL '12 days');

  -- T5: Done test (exam type) — high accuracy, 8 days ago
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, total_questions, attempted_questions, correct_answers, wrong_answers, marks_per_question, negative_marking, time_taken_minutes, marks_obtained, accuracy_percentage, speed_qpm, completed_at) VALUES
    (v_task5, v_uid, v_goal_jee, v_sub_mechanics, v_ch_newton, 'Newton''s Laws Unit Test', 'test', 'done', 5000, CURRENT_DATE - INTERVAL '8 days', 120, 30, 28, 25, 3, 4.00, 1.00, 90, 71.00, 89.29, 0.31, NOW() - INTERVAL '8 days');

  -- T6: Done mocktest — medium accuracy, 5 days ago
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, total_questions, attempted_questions, correct_answers, wrong_answers, marks_per_question, negative_marking, time_taken_minutes, marks_obtained, accuracy_percentage, speed_qpm, completed_at) VALUES
    (v_task6, v_uid, v_goal_jee, v_sub_calculus, 'Calculus Mock Test 1', 'mocktest', 'done', 7500, CURRENT_DATE - INTERVAL '5 days', 180, 75, 60, 42, 18, 4.00, 1.00, 170, 150.00, 70.00, 0.35, NOW() - INTERVAL '5 days');

  -- T7: Done exam — perfect score, 3 days ago
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, total_questions, attempted_questions, correct_answers, wrong_answers, marks_per_question, negative_marking, time_taken_minutes, marks_obtained, accuracy_percentage, speed_qpm, completed_at) VALUES
    (v_task7, v_uid, v_goal_boards, v_sub_english, v_ch_grammar, 'Grammar Final Exam', 'exam', 'done', 9999, CURRENT_DATE - INTERVAL '3 days', 120, 50, 50, 50, 0, 2.00, 0.00, 100, 100.00, 100.00, 0.50, NOW() - INTERVAL '3 days');

  -- T11: Done piano practice, 6 days ago
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, completed_at) VALUES
    (v_task11, v_uid, v_goal_custom, v_sub_hobby, v_ch_hobby1, 'Learn C Major Scale', 'practice', 'done', 2500, CURRENT_DATE - INTERVAL '6 days', 45, NOW() - INTERVAL '6 days');

  -- T13: Done video_lecture (custom type), 4 days ago
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, completed_at) VALUES
    (v_task13, v_uid, v_goal_jee, v_sub_electro, v_ch_coulomb, 'Electric Field Video Lecture', 'video_lecture', 'done', 2500, CURRENT_DATE - INTERVAL '4 days', 30, NOW() - INTERVAL '4 days');

  -- T16: Done task from 30 days ago (analytics range edge)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, completed_at) VALUES
    (v_task16, v_uid, v_goal_jee, v_sub_physical, 'Thermodynamics Intro', 'lecture', 'done', 2500, CURRENT_DATE - INTERVAL '30 days', 45, NOW() - INTERVAL '30 days');

  -- T17: Done test with LOW accuracy (edge case)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, total_questions, attempted_questions, correct_answers, wrong_answers, marks_per_question, negative_marking, time_taken_minutes, marks_obtained, accuracy_percentage, speed_qpm, completed_at) VALUES
    (v_task17, v_uid, v_goal_jee, v_sub_optics, 'Optics Quick Quiz', 'test', 'done', 2500, CURRENT_DATE - INTERVAL '7 days', 30, 20, 15, 5, 10, 2.00, 0.50, 25, 5.00, 33.33, 0.60, NOW() - INTERVAL '7 days');

  -- T19: Done group_study (custom type, no date)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, name, task_type, status, priority_number, estimated_duration, completed_at) VALUES
    (v_task19, v_uid, v_goal_jee, v_sub_mechanics, 'Group Discussion - Rotation', 'group_study', 'done', 5000, 120, NOW() - INTERVAL '9 days');

  -- T20: Done normalization lecture, 2 days ago
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, completed_at) VALUES
    (v_task20, v_uid, v_goal_semester, v_sub_dbms, v_ch_normalization, 'Normalization Lecture Notes', 'lecture', 'done', 2500, CURRENT_DATE - INTERVAL '2 days', 45, NOW() - INTERVAL '2 days');

  -- T21: Done organic revision, 9 days ago
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, completed_at) VALUES
    (v_task21, v_uid, v_goal_jee, v_sub_organic, v_ch_goc, v_topic_goc1, 'IUPAC Naming Practice', 'revision', 'done', 5000, CURRENT_DATE - INTERVAL '9 days', 40, NOW() - INTERVAL '9 days');

  -- T22: Done calculus notes, 20 days ago
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, completed_at) VALUES
    (v_task22, v_uid, v_goal_jee, v_sub_calculus, v_ch_limits, v_topic_lim1, 'L''Hôpital''s Rule Deep Dive', 'notes', 'done', 5000, CURRENT_DATE - INTERVAL '20 days', 50, NOW() - INTERVAL '20 days');

  -- T23: Done wave optics practice, 11 days ago
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, completed_at) VALUES
    (v_task23, v_uid, v_goal_jee, v_sub_optics, v_ch_wave_optics, v_topic_wave_opt1, 'YDSE Numericals', 'practice', 'done', 7500, CURRENT_DATE - INTERVAL '11 days', 90, NOW() - INTERVAL '11 days');

  -- T24: Done SHM notes, 14 days ago
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, completed_at) VALUES
    (v_task24, v_uid, v_goal_jee, v_sub_waves, v_ch_shm, v_topic_shm1, 'SHM Spring Problems', 'practice', 'done', 2500, CURRENT_DATE - INTERVAL '14 days', 60, NOW() - INTERVAL '14 days');

  -- T25: Done coord geo notes, 18 days ago
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, completed_at) VALUES
    (v_task25, v_uid, v_goal_jee, v_sub_coord, v_ch_straight_lines, v_topic_lines1, 'Straight Lines Formulas', 'notes', 'done', 1000, CURRENT_DATE - INTERVAL '18 days', 30, NOW() - INTERVAL '18 days');

  -- T26: Done olympiad number theory, 7 days ago
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, completed_at) VALUES
    (v_task26, v_uid, v_goal_olympiad, v_sub_oly_math, v_ch_number_theory, 'Divisibility Proofs', 'practice', 'done', 5000, CURRENT_DATE - INTERVAL '7 days', 90, NOW() - INTERVAL '7 days');

  -- === IN-PROGRESS tasks (today) ===
  -- T3: In-progress practice (today)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, scheduled_time_slot, preferred_session_id, estimated_duration) VALUES
    (v_task3, v_uid, v_goal_jee, v_sub_mechanics, v_ch_kinematics, v_topic_kin1, 'Solve Projectile Problems Set A', 'practice', 'in_progress', 7500, CURRENT_DATE, 'Afternoon', v_sess_afternoon, 90);

  -- T27: In-progress organic revision (today)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, preferred_session_id, estimated_duration) VALUES
    (v_task27, v_uid, v_goal_jee, v_sub_organic, v_ch_goc, v_topic_goc2, 'Reaction Mechanisms Study', 'notes', 'in_progress', 5000, CURRENT_DATE, v_sess_morning, 75);

  -- T28: In-progress data structures (today)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task28, v_uid, v_goal_semester, v_sub_cs, v_ch_trees, 'BST Implementation Practice', 'practice', 'in_progress', 5000, CURRENT_DATE, 90);

  -- === PENDING tasks (today) ===
  -- T9: Pending revision (today)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task9, v_uid, v_goal_jee, v_sub_inorganic, 'Periodic Table Revision', 'revision', 'pending', 1000, CURRENT_DATE, 45);

  -- T15: Critical pending for tonight
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, scheduled_time_slot, preferred_session_id, estimated_duration) VALUES
    (v_task15, v_uid, v_goal_jee, v_sub_calculus, v_ch_derivatives, v_topic_deriv1, 'Chain Rule Deep Dive', 'notes', 'pending', 9000, CURRENT_DATE, 'Night', v_sess_night, 60);

  -- T29: Pending algebra (today)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task29, v_uid, v_goal_jee, v_sub_algebra, v_ch_complex, v_topic_complex1, 'Argand Plane Plotting', 'practice', 'pending', 5000, CURRENT_DATE, 60);

  -- T30: Pending equilibrium (today)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task30, v_uid, v_goal_jee, v_sub_physical, v_ch_equil, 'Equilibrium Constant Problems', 'practice', 'pending', 2500, CURRENT_DATE, 45);

  -- === SCHEDULED tasks (future) ===
  -- T4: Scheduled revision, tomorrow
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, preferred_session_id, estimated_duration) VALUES
    (v_task4, v_uid, v_goal_jee, v_sub_mechanics, v_ch_kinematics, 'Revise Kinematics Formulas', 'revision', 'scheduled', 2500, CURRENT_DATE + INTERVAL '1 day', v_sess_morning, 30);

  -- T10: Scheduled piano, tomorrow
  INSERT INTO tasks (task_id, user_id, goal_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task10, v_uid, v_goal_custom, 'Piano Finger Exercises', 'practice', 'scheduled', 1000, CURRENT_DATE + INTERVAL '1 day', 30);

  -- T12: Scheduled SQL, 2 days out
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, preferred_session_id, estimated_duration) VALUES
    (v_task12, v_uid, v_goal_semester, v_sub_dbms, v_ch_sql, 'Practice SQL Joins', 'practice', 'scheduled', 5000, CURRENT_DATE + INTERVAL '2 days', v_sess_evening, 90);

  -- T14: Scheduled far future, low priority
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task14, v_uid, v_goal_jee, v_sub_algebra, v_ch_matrices, 'Matrices Practice Set', 'practice', 'scheduled', 1, CURRENT_DATE + INTERVAL '30 days', 120);

  -- T31: Scheduled integration, 3 days out
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task31, v_uid, v_goal_jee, v_sub_calculus, v_ch_integrals, v_topic_int1, 'Integration by Parts Drill', 'practice', 'scheduled', 5000, CURRENT_DATE + INTERVAL '3 days', 60);

  -- T32: Scheduled magnetism, 4 days out
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task32, v_uid, v_goal_jee, v_sub_electro, v_ch_magnetism, v_topic_mag1, 'Biot-Savart Law Notes', 'notes', 'scheduled', 2500, CURRENT_DATE + INTERVAL '4 days', 50);

  -- T33: Scheduled probability, 5 days out
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task33, v_uid, v_goal_jee, v_sub_stats, v_ch_probability, v_topic_prob1, 'Bayes Theorem Practice', 'practice', 'scheduled', 5000, CURRENT_DATE + INTERVAL '5 days', 75);

  -- T34: Scheduled conics, 7 days out
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, topic_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task34, v_uid, v_goal_jee, v_sub_coord, v_ch_conics, v_topic_conics1, 'Parabola Focus & Directrix', 'notes', 'scheduled', 7500, CURRENT_DATE + INTERVAL '7 days', 45);

  -- T35: Scheduled OS process mgmt, 6 days out
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task35, v_uid, v_goal_semester, v_sub_os, v_ch_process, 'Process Scheduling Algorithms', 'lecture', 'scheduled', 2500, CURRENT_DATE + INTERVAL '6 days', 60);

  -- T36: Scheduled mocktest, 10 days out (full syllabus)
  INSERT INTO tasks (task_id, user_id, goal_id, name, task_type, status, priority_number, scheduled_date, estimated_duration, total_questions) VALUES
    (v_task36, v_uid, v_goal_jee, 'JEE Full Mock Test 2', 'mocktest', 'scheduled', 9999, CURRENT_DATE + INTERVAL '10 days', 180, 90);

  -- T37: Scheduled olympiad combinatorics, 8 days out
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task37, v_uid, v_goal_olympiad, v_sub_oly_math, v_ch_combinatorics, 'Combinatorics Problem Set', 'practice', 'scheduled', 5000, CURRENT_DATE + INTERVAL '8 days', 120);

  -- === POSTPONED tasks ===
  -- T8: Postponed GOC notes
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, is_postponed, postponed_to_date, postponed_from_date, estimated_duration) VALUES
    (v_task8, v_uid, v_goal_jee, v_sub_organic, v_ch_goc, 'GOC Reaction Mechanisms Notes', 'notes', 'postponed', 2500, CURRENT_DATE + INTERVAL '3 days', TRUE, CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE - INTERVAL '2 days', 60);

  -- T38: Postponed electrochemistry (was yesterday, moved to +4)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, is_postponed, postponed_to_date, postponed_from_date, estimated_duration) VALUES
    (v_task38, v_uid, v_goal_jee, v_sub_physical, v_ch_electrochemistry, 'Electrochemistry Lecture', 'lecture', 'postponed', 2500, CURRENT_DATE + INTERVAL '4 days', TRUE, CURRENT_DATE + INTERVAL '4 days', CURRENT_DATE - INTERVAL '1 day', 45);

  -- T39: Postponed twice (edge case: postponed from -5 to -1 to +2)
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, is_postponed, postponed_to_date, postponed_from_date, estimated_duration) VALUES
    (v_task39, v_uid, v_goal_boards, v_sub_english, v_ch_writing, 'Creative Writing Essay', 'notes', 'postponed', 5000, CURRENT_DATE + INTERVAL '2 days', TRUE, CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE - INTERVAL '5 days', 90);

  -- === OVERDUE (past scheduled, not done) ===
  -- T18: Scheduled yesterday but not done — should be overdue
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task18, v_uid, v_goal_boards, v_sub_hindi, 'Hindi Essay Writing', 'notes', 'scheduled', 2500, CURRENT_DATE - INTERVAL '1 day', 60);

  -- T40: Scheduled 3 days ago, still pending — definite overdue
  INSERT INTO tasks (task_id, user_id, goal_id, subject_id, chapter_id, name, task_type, status, priority_number, scheduled_date, estimated_duration) VALUES
    (v_task40, v_uid, v_goal_jee, v_sub_electro, v_ch_circuits, 'DC Circuits Problem Set', 'practice', 'pending', 5000, CURRENT_DATE - INTERVAL '3 days', 60);

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

  -- Subtasks for in-progress organic (T27)
  INSERT INTO subtasks (task_id, title, completed, order_index) VALUES
    (v_task27, 'Read SN1 mechanism', TRUE, 1),
    (v_task27, 'Read SN2 mechanism', TRUE, 2),
    (v_task27, 'Compare E1 vs E2', FALSE, 3),
    (v_task27, 'Solve mechanism exercises', FALSE, 4);

  -- Subtasks for BST task (T28)
  INSERT INTO subtasks (task_id, title, completed, order_index) VALUES
    (v_task28, 'Implement insert', TRUE, 1),
    (v_task28, 'Implement search', FALSE, 2),
    (v_task28, 'Implement delete', FALSE, 3),
    (v_task28, 'Write test cases', FALSE, 4);

  -- =========================================================
  -- 12. TIMER SESSIONS (20 sessions for analytics)
  -- =========================================================
  -- Timer 1-2: Pomodoro for task 1 (15 days ago)
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type, is_pomodoro, pomodoro_cycle, paused_duration_seconds) VALUES
    (v_timer1, v_task1, v_uid, NOW() - INTERVAL '15 days 2 hours', NOW() - INTERVAL '15 days 1 hour', 'focus', TRUE, 1, 0),
    (v_timer2, v_task1, v_uid, NOW() - INTERVAL '15 days 50 minutes', NOW() - INTERVAL '15 days', 'focus', TRUE, 2, 120);

  -- Timer 3: Break
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type, is_pomodoro, pomodoro_cycle) VALUES
    (v_timer3, v_task1, v_uid, NOW() - INTERVAL '15 days 1 hour', NOW() - INTERVAL '15 days 50 minutes', 'break', TRUE, 1);

  -- Timer 4: Long session for task 2
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type, is_pomodoro, paused_duration_seconds) VALUES
    (v_timer4, v_task2, v_uid, NOW() - INTERVAL '12 days 3 hours', NOW() - INTERVAL '12 days 1 hour 30 minutes', 'focus', FALSE, 300);

  -- Timer 5: Today's in-progress
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type, is_pomodoro, pomodoro_cycle) VALUES
    (v_timer5, v_task3, v_uid, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '20 minutes', 'focus', TRUE, 1);

  -- Timer 6: Piano
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type) VALUES
    (v_timer6, v_task11, v_uid, NOW() - INTERVAL '6 days 1 hour', NOW() - INTERVAL '6 days 15 minutes', 'focus');

  -- Timer 7: Video lecture
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type) VALUES
    (v_timer7, v_task13, v_uid, NOW() - INTERVAL '4 days 35 minutes', NOW() - INTERVAL '4 days', 'focus');

  -- Timer 8: Exam task
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type) VALUES
    (v_timer8, v_task5, v_uid, NOW() - INTERVAL '8 days 2 hours', NOW() - INTERVAL '8 days 30 minutes', 'focus');

  -- Timer 9: Mock test
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type, paused_duration_seconds) VALUES
    (v_timer9, v_task6, v_uid, NOW() - INTERVAL '5 days 3 hours', NOW() - INTERVAL '5 days 10 minutes', 'focus', 180);

  -- Timer 10: Very short session (edge case)
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type) VALUES
    (v_timer10, v_task19, v_uid, NOW() - INTERVAL '9 days 2 minutes', NOW() - INTERVAL '9 days 55 seconds', 'focus');

  -- Timer 11: Late night session
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type) VALUES
    (v_timer11, v_task15, v_uid, (CURRENT_DATE - 1)::TIMESTAMP + INTERVAL '23 hours', (CURRENT_DATE)::TIMESTAMP + INTERVAL '0 hours 45 minutes', 'focus');

  -- Timer 12: Normalization lecture
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type) VALUES
    (v_timer12, v_task20, v_uid, NOW() - INTERVAL '2 days 50 minutes', NOW() - INTERVAL '2 days 5 minutes', 'focus');

  -- Timer 13: IUPAC naming (9 days ago)
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type) VALUES
    (v_timer13, v_task21, v_uid, NOW() - INTERVAL '9 days 45 minutes', NOW() - INTERVAL '9 days 5 minutes', 'focus');

  -- Timer 14: Limits deep dive (20 days ago)
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type, is_pomodoro, pomodoro_cycle) VALUES
    (v_timer14, v_task22, v_uid, NOW() - INTERVAL '20 days 55 minutes', NOW() - INTERVAL '20 days 5 minutes', 'focus', TRUE, 1);

  -- Timer 15: YDSE practice (11 days ago)
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type, paused_duration_seconds) VALUES
    (v_timer15, v_task23, v_uid, NOW() - INTERVAL '11 days 1 hour 35 minutes', NOW() - INTERVAL '11 days 5 minutes', 'focus', 120);

  -- Timer 16: SHM spring (14 days ago)
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type) VALUES
    (v_timer16, v_task24, v_uid, NOW() - INTERVAL '14 days 1 hour 5 minutes', NOW() - INTERVAL '14 days 5 minutes', 'focus');

  -- Timer 17: Straight lines (18 days ago)
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type) VALUES
    (v_timer17, v_task25, v_uid, NOW() - INTERVAL '18 days 35 minutes', NOW() - INTERVAL '18 days', 'focus');

  -- Timer 18: Olympiad (7 days ago)
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type, paused_duration_seconds) VALUES
    (v_timer18, v_task26, v_uid, NOW() - INTERVAL '7 days 1 hour 40 minutes', NOW() - INTERVAL '7 days 5 minutes', 'focus', 60);

  -- Timer 19: In-progress organic today
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type) VALUES
    (v_timer19, v_task27, v_uid, NOW() - INTERVAL '1 hour 10 minutes', NOW() - INTERVAL '30 minutes', 'focus');

  -- Timer 20: In-progress BST today
  INSERT INTO timer_sessions (session_id, task_id, user_id, start_time, end_time, session_type, is_pomodoro, pomodoro_cycle) VALUES
    (v_timer20, v_task28, v_uid, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 10 minutes', 'focus', TRUE, 1);

  -- =========================================================
  -- 13. HOLIDAYS
  -- =========================================================
  INSERT INTO holidays (user_id, date, holiday_type, reason) VALUES
    (v_uid, CURRENT_DATE - INTERVAL '18 days', 'National Holiday', 'Republic Day'),
    (v_uid, CURRENT_DATE - INTERVAL '14 days', 'Holiday', 'Family function'),
    (v_uid, CURRENT_DATE + INTERVAL '5 days', 'Holiday', 'Planned break'),
    (v_uid, CURRENT_DATE + INTERVAL '15 days', 'Festival', 'Holi'),
    (v_uid, CURRENT_DATE - INTERVAL '25 days', 'Sick Leave', 'Was unwell'),
    (v_uid, CURRENT_DATE - INTERVAL '7 days', 'Holiday', 'Retroactive freeze test');

  -- =========================================================
  -- 14. USER BADGES
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
