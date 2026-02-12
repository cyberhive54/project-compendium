-- 029_allow_user_deletion.sql
-- Allow users to delete their own account (which cascades to all data)

CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS VOID AS $$
BEGIN
  -- Delete from auth.users, which cascades to user_profiles, tasks, etc.
  -- This requires SECURITY DEFINER to access auth.users
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
