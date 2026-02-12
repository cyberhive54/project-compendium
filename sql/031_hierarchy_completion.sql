-- Add completed columns to upper hierarchy
ALTER TABLE streams ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
ALTER TABLE streams ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE subjects ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE goals ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- 1. Function: Update Topic based on Tasks
CREATE OR REPLACE FUNCTION update_topic_completion() RETURNS TRIGGER AS $$
DECLARE
    all_done BOOLEAN;
    topic_record RECORD;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        topic_record := OLD;
    ELSE
        topic_record := NEW;
    END IF;

    -- Check if all non-archived tasks for this topic are done
    SELECT COALESCE(BOOL_AND(status = 'done'), TRUE) INTO all_done
    FROM tasks
    WHERE topic_id = topic_record.topic_id AND archived = false;

    -- Update Topic
    UPDATE topics 
    SET completed = all_done, 
        completed_at = CASE WHEN all_done THEN NOW() ELSE NULL END
    WHERE topic_id = topic_record.topic_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_topic_completion
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_topic_completion();


-- 2. Function: Update Chapter based on Topics
CREATE OR REPLACE FUNCTION update_chapter_completion() RETURNS TRIGGER AS $$
DECLARE
    all_done BOOLEAN;
BEGIN
    SELECT COALESCE(BOOL_AND(completed), TRUE) INTO all_done
    FROM topics
    WHERE chapter_id = NEW.chapter_id AND archived = false;

    UPDATE chapters 
    SET completed = all_done, 
        completed_at = CASE WHEN all_done THEN NOW() ELSE NULL END
    WHERE chapter_id = NEW.chapter_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chapter_completion
AFTER UPDATE OF completed, archived OR INSERT OR DELETE ON topics
FOR EACH ROW EXECUTE FUNCTION update_chapter_completion();


-- 3. Function: Update Subject based on Chapters
CREATE OR REPLACE FUNCTION update_subject_completion() RETURNS TRIGGER AS $$
DECLARE
    all_done BOOLEAN;
BEGIN
    SELECT COALESCE(BOOL_AND(completed), TRUE) INTO all_done
    FROM chapters
    WHERE subject_id = NEW.subject_id AND archived = false;

    UPDATE subjects 
    SET completed = all_done, 
        completed_at = CASE WHEN all_done THEN NOW() ELSE NULL END
    WHERE subject_id = NEW.subject_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subject_completion
AFTER UPDATE OF completed, archived OR INSERT OR DELETE ON chapters
FOR EACH ROW EXECUTE FUNCTION update_subject_completion();


-- 4. Function: Update Stream OR Goal based on Subject
CREATE OR REPLACE FUNCTION update_stream_or_goal_from_subject() RETURNS TRIGGER AS $$
DECLARE
    all_done BOOLEAN;
    target_stream_id UUID;
    target_goal_id UUID;
BEGIN
    target_stream_id := NEW.stream_id;
    target_goal_id := NEW.goal_id;

    IF target_stream_id IS NOT NULL THEN
        -- Check Stream
        SELECT COALESCE(BOOL_AND(completed), TRUE) INTO all_done
        FROM subjects
        WHERE stream_id = target_stream_id AND archived = false;

        UPDATE streams 
        SET completed = all_done, 
            completed_at = CASE WHEN all_done THEN NOW() ELSE NULL END
        WHERE stream_id = target_stream_id;
    ELSE
        -- Check Goal (Subjects directly under Goal)
        -- Goal is done if (All Streams Done) AND (All Direct Subjects Done)
        -- We just trigger the goal update function here to be safe
        PERFORM update_goal_completion_func(target_goal_id);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stream_or_goal_from_subject
AFTER UPDATE OF completed, archived OR INSERT OR DELETE ON subjects
FOR EACH ROW EXECUTE FUNCTION update_stream_or_goal_from_subject();


-- 5. Function: Update Goal based on Stream
CREATE OR REPLACE FUNCTION update_goal_from_stream() RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_goal_completion_func(NEW.goal_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_goal_from_stream
AFTER UPDATE OF completed, archived OR INSERT OR DELETE ON streams
FOR EACH ROW EXECUTE FUNCTION update_goal_from_stream();


-- Helper: Goal Completion Logic
CREATE OR REPLACE FUNCTION update_goal_completion_func(target_goal_id UUID) RETURNS VOID AS $$
DECLARE
    streams_done BOOLEAN;
    subjects_done BOOLEAN;
BEGIN
    -- Check Streams
    SELECT COALESCE(BOOL_AND(completed), TRUE) INTO streams_done
    FROM streams
    WHERE goal_id = target_goal_id AND archived = false;

    -- Check Direct Subjects
    SELECT COALESCE(BOOL_AND(completed), TRUE) INTO subjects_done
    FROM subjects
    WHERE goal_id = target_goal_id AND stream_id IS NULL AND archived = false;

    UPDATE goals
    SET completed = (streams_done AND subjects_done),
        completed_at = CASE WHEN (streams_done AND subjects_done) THEN NOW() ELSE NULL END
    WHERE goal_id = target_goal_id;
END;
$$ LANGUAGE plpgsql;


-- 6. Function: Update Project based on Goal
CREATE OR REPLACE FUNCTION update_project_completion() RETURNS TRIGGER AS $$
DECLARE
    all_done BOOLEAN;
BEGIN
    SELECT COALESCE(BOOL_AND(completed), TRUE) INTO all_done
    FROM goals
    WHERE project_id = NEW.project_id AND archived = false;

    UPDATE projects
    SET completed = all_done,
        completed_at = CASE WHEN all_done THEN NOW() ELSE NULL END
    WHERE project_id = NEW.project_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_completion
AFTER UPDATE OF completed, archived OR INSERT OR DELETE ON goals
FOR EACH ROW EXECUTE FUNCTION update_project_completion();
