-- 039_add_task_type_behaviors.sql
-- Add system_behavior column to user_task_types to define functional behavior

ALTER TABLE user_task_types 
ADD COLUMN system_behavior VARCHAR(50) NOT NULL DEFAULT 'study';

-- Add check constraint for allowed behaviors
ALTER TABLE user_task_types
ADD CONSTRAINT check_system_behavior 
CHECK (system_behavior IN ('study', 'practice', 'exam', 'assignment', 'revision'));

-- Update existing types based on names (best effort migration)
UPDATE user_task_types SET system_behavior = 'exam' 
WHERE name IN ('test', 'mocktest', 'exam', 'questionpractice');

UPDATE user_task_types SET system_behavior = 'assignment' 
WHERE name = 'assignment';

UPDATE user_task_types SET system_behavior = 'practice' 
WHERE name = 'practice';

UPDATE user_task_types SET system_behavior = 'revision' 
WHERE name = 'revision';

-- 'study', 'reading', 'default' remain 'study' via default
