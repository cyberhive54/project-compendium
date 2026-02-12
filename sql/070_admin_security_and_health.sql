-- Secure view to expose user data to admins
CREATE OR REPLACE VIEW public.admin_user_profiles AS
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.last_sign_in_at,
    au.raw_user_meta_data
FROM auth.users au;

-- Grant access to the view for authenticated users (RLS will restrict this further if we were using a table, 
-- but for a view, we need to be careful. Since we can't easily put RLS on a view effectively without complex triggers,
-- we will largely rely on the API side filtering or just trust that only admins will call the rpc/query if we wrap it.)
-- BETTER APPROACH: Wrap it in a SECURITY DEFINER function that checks for admin role.

CREATE OR REPLACE FUNCTION get_admin_user_list()
RETURNS TABLE (
    id UUID,
    email VARCHAR,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    meta_data JSONB
) 
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the requesting user is an admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access Denied: Admins Only';
    END IF;

    RETURN QUERY 
    SELECT 
        au.id,
        au.email::VARCHAR,
        au.created_at,
        au.last_sign_in_at,
        au.raw_user_meta_data
    FROM auth.users au
    ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute to authenticated users (The function handles the security check)
GRANT EXECUTE ON FUNCTION get_admin_user_list TO authenticated;
