-- ============================================================================
-- 10_admin_and_contact.sql
-- Merged from: 050, 060, 070
-- Creates: contact_submissions, admin_notes, admin user list function
-- ============================================================================

-- Contact form submissions (public)
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact submissions"
  ON public.contact_submissions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND role IN ('admin', 'moderator')));
CREATE POLICY "Admins can update contact submissions"
  ON public.contact_submissions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND role IN ('admin', 'moderator')));
CREATE POLICY "Admins can delete contact submissions"
  ON public.contact_submissions FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND role IN ('admin', 'moderator')));

-- Admin notes (private to each admin)
CREATE TABLE IF NOT EXISTS public.admin_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    content TEXT,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage their own notes"
  ON public.admin_notes FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_admin_notes_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER update_admin_notes_updated_at
  BEFORE UPDATE ON public.admin_notes FOR EACH ROW EXECUTE FUNCTION update_admin_notes_updated_at();

-- Admin user list (secure function)
CREATE OR REPLACE FUNCTION get_admin_user_list()
RETURNS TABLE (
    id UUID,
    email VARCHAR,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    meta_data JSONB
)
SECURITY DEFINER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access Denied: Admins Only';
    END IF;
    RETURN QUERY
    SELECT au.id, au.email::VARCHAR, au.created_at, au.last_sign_in_at, au.raw_user_meta_data
    FROM auth.users au ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql;
GRANT EXECUTE ON FUNCTION get_admin_user_list TO authenticated;
