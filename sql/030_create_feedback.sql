-- 030_create_feedback.sql

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- feedback, bug, feature
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'new', -- new, reviewed, resolved
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Admins view all (handled by dashboard logic usually, or separate policy)
-- For now, maybe just let admins view all? 
-- Assuming admin has service role or we add specific policy.
