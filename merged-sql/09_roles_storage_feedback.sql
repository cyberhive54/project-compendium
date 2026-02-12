-- ============================================================================
-- 09_roles_storage_feedback.sql
-- Merged from: 019, 021, 025, 036 (030 skipped — duplicate, less complete)
-- Creates: user_roles, has_role(), storage bucket, feedback, feedback_votes
-- ============================================================================

-- Role system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY "Public avatar read access"
  ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

-- Feedback (from 025, enhanced with 036 columns)
CREATE TABLE feedback (
  feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  page VARCHAR(100),
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'submitted',
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category VARCHAR(50),
  votes INTEGER DEFAULT 0,
  browser_info TEXT,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT feedback_type_check CHECK (type IN ('feedback', 'feature', 'bug')),
  CONSTRAINT feedback_status_check CHECK (status IN ('submitted', 'in_review', 'planned', 'in_progress', 'completed', 'resolved', 'rejected', 'duplicate'))
);
CREATE INDEX idx_feedback_user ON feedback(user_id, created_at DESC);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_priority ON feedback(priority) WHERE priority IS NOT NULL;
CREATE INDEX idx_feedback_category ON feedback(category) WHERE category IS NOT NULL;
CREATE INDEX idx_feedback_type_status ON feedback(type, status);
CREATE INDEX idx_feedback_votes ON feedback(votes DESC);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all feedback"
  ON feedback FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create own feedback"
  ON feedback FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own feedback"
  ON feedback FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can update feedback"
  ON feedback FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Feedback updated_at trigger
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER update_feedback_timestamp
  BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION update_feedback_updated_at();

-- Feedback votes tracking
CREATE TABLE feedback_votes (
  vote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedback(feedback_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feedback_id, user_id)
);
CREATE INDEX idx_feedback_votes_user ON feedback_votes(user_id);
CREATE INDEX idx_feedback_votes_feedback ON feedback_votes(feedback_id);
ALTER TABLE feedback_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all votes" ON feedback_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can add their own votes" ON feedback_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own votes" ON feedback_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Vote increment/decrement functions
CREATE OR REPLACE FUNCTION increment_feedback_votes(feedback_id UUID)
RETURNS VOID AS $$
BEGIN UPDATE feedback SET votes = votes + 1 WHERE feedback.feedback_id = increment_feedback_votes.feedback_id; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_feedback_votes(feedback_id UUID)
RETURNS VOID AS $$
BEGIN UPDATE feedback SET votes = GREATEST(votes - 1, 0) WHERE feedback.feedback_id = decrement_feedback_votes.feedback_id; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
