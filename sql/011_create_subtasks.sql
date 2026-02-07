-- 011_create_subtasks.sql
-- Subtasks as checkboxes within tasks

CREATE TABLE subtasks (
  subtask_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subtasks_task ON subtasks(task_id, order_index);
