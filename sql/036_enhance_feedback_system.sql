-- 036_enhance_feedback_system.sql
-- Enhance feedback system with advanced features

-- First, update the type constraint to include 'feedback'
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_type_check;
ALTER TABLE feedback ADD CONSTRAINT feedback_type_check 
  CHECK (type IN ('feedback', 'feature', 'bug'));

-- Update status constraint to include more states
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_status_check;
ALTER TABLE feedback ADD CONSTRAINT feedback_status_check 
  CHECK (status IN ('submitted', 'in_review', 'planned', 'in_progress', 'completed', 'resolved', 'rejected', 'duplicate'));

-- Add new columns
ALTER TABLE feedback
  ADD COLUMN IF NOT EXISTS priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  ADD COLUMN IF NOT EXISTS category VARCHAR(50),
  ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS browser_info TEXT,
  ADD COLUMN IF NOT EXISTS steps_to_reproduce TEXT,
  ADD COLUMN IF NOT EXISTS expected_behavior TEXT,
  ADD COLUMN IF NOT EXISTS actual_behavior TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create votes tracking table for preventing duplicate votes
CREATE TABLE IF NOT EXISTS feedback_votes (
  vote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedback(feedback_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feedback_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_feedback_votes_user ON feedback_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_votes_feedback ON feedback_votes(feedback_id);

-- Enable RLS on votes table
ALTER TABLE feedback_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all votes"
  ON feedback_votes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can add their own votes"
  ON feedback_votes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own votes"
  ON feedback_votes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON feedback(priority) WHERE priority IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feedback_type_status ON feedback(type, status);
CREATE INDEX IF NOT EXISTS idx_feedback_votes ON feedback(votes DESC);

-- Update the updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_feedback_timestamp ON feedback;
CREATE TRIGGER update_feedback_timestamp
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

-- Add vote increment/decrement functions
CREATE OR REPLACE FUNCTION increment_feedback_votes(feedback_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE feedback SET votes = votes + 1 WHERE feedback.feedback_id = increment_feedback_votes.feedback_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_feedback_votes(feedback_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE feedback SET votes = GREATEST(votes - 1, 0) WHERE feedback.feedback_id = decrement_feedback_votes.feedback_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

