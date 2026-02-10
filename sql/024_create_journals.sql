-- 024_create_journals.sql
-- Daily study journal entries

CREATE TABLE journals (
  journal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_journals_user_date ON journals(user_id, date DESC);

ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own journals"
  ON journals FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
