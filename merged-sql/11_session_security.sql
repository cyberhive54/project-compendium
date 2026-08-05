-- ============================================================================
-- 11_session_security.sql
-- Adds: contact form rate limiting, session limits, session management RPCs
-- ============================================================================

-- ── 1. Contact form rate limiting columns ────────────────────────────────
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS email_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_contact_ip ON public.contact_submissions(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_email_hash ON public.contact_submissions(email_hash, created_at DESC);

-- Character limits enforced at the database level (server-side)
ALTER TABLE public.contact_submissions
  DROP CONSTRAINT IF EXISTS contact_name_len,
  DROP CONSTRAINT IF EXISTS contact_email_len,
  DROP CONSTRAINT IF EXISTS contact_subject_len,
  DROP CONSTRAINT IF EXISTS contact_message_len;
ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_name_len CHECK (char_length(name) <= 100),
  ADD CONSTRAINT contact_email_len CHECK (char_length(email) <= 254),
  ADD CONSTRAINT contact_subject_len CHECK (char_length(COALESCE(subject, '')) <= 200),
  ADD CONSTRAINT contact_message_len CHECK (char_length(message) <= 2000);

-- Replace the open INSERT policy with a rate-limited function call.
-- Direct inserts are now blocked so the only path in enforces limits.
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

-- Submit contact with rate limiting (IP: 5/hour, email: 3/day)
CREATE OR REPLACE FUNCTION public.submit_contact(
  p_name TEXT,
  p_email TEXT,
  p_subject TEXT,
  p_message TEXT,
  p_ip TEXT,
  p_email_hash TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ip_count INTEGER;
  email_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO ip_count
  FROM public.contact_submissions
  WHERE ip_address = p_ip
    AND created_at > NOW() - INTERVAL '1 hour';

  IF ip_count >= 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Too many messages from this device. Please try again in an hour.');
  END IF;

  SELECT COUNT(*) INTO email_count
  FROM public.contact_submissions
  WHERE email_hash = p_email_hash
    AND created_at > NOW() - INTERVAL '24 hours';

  IF email_count >= 3 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email submission limit reached for today. Please try again tomorrow.');
  END IF;

  INSERT INTO public.contact_submissions (name, email, subject, message, ip_address, email_hash)
  VALUES (p_name, p_email, p_subject, p_message, p_ip, p_email_hash);

  RETURN jsonb_build_object('success', true);
END;
$$;
GRANT EXECUTE ON FUNCTION public.submit_contact(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- ── 2. Session limits (max 3 concurrent, 12-hour lifetime) ──────────────
-- Set automatically for NEW users on signup
CREATE OR REPLACE FUNCTION public.set_default_session_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
    || '{"session_limit": 3, "session_time_limit": 720}'::jsonb
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_session_limits_on_signup ON auth.users;
CREATE TRIGGER set_session_limits_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.set_default_session_limits();

-- Apply to EXISTING users
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
  || '{"session_limit": 3, "session_time_limit": 720}'::jsonb;

-- ── 3. RPC: List the current user's active sessions ─────────────────────
CREATE OR REPLACE FUNCTION public.get_my_sessions()
RETURNS TABLE (
  session_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  user_agent TEXT,
  ip TEXT
)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT s.id::uuid,
         s.created_at,
         s.updated_at,
         s.not_after AS expires_at,
         s.user_agent,
         s.ip::text
  FROM auth.sessions s
  WHERE s.user_id = auth.uid()
  ORDER BY s.created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public.get_my_sessions() TO authenticated;

-- ── 4. RPC: Revoke one of the current user's sessions ───────────────────
CREATE OR REPLACE FUNCTION public.revoke_session(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE deleted BOOLEAN;
BEGIN
  DELETE FROM auth.sessions
  WHERE id = p_session_id AND user_id = auth.uid();
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted;
END;
$$;
GRANT EXECUTE ON FUNCTION public.revoke_session(UUID) TO authenticated;
