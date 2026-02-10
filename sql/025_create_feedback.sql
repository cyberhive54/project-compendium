-- 025_create_feedback.sql
-- Feature requests and bug reports

CREATE TABLE feedback (
  feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('feature', 'bug')),
  page VARCHAR(100),
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'planned', 'resolved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_user ON feedback(user_id, created_at DESC);
CREATE INDEX idx_feedback_status ON feedback(status);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can read all feedback
CREATE POLICY "Users can read all feedback"
  ON feedback FOR SELECT TO authenticated
  USING (true);

-- Users can create their own feedback
CREATE POLICY "Users can create own feedback"
  ON feedback FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own feedback
CREATE POLICY "Users can update own feedback"
  ON feedback FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Admins can update any feedback status
CREATE POLICY "Admins can update feedback"
  ON feedback FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
