-- ============================================================================
-- 12_keepalive.sql
-- Adds a lightweight DB ping for the Vercel cron keep-alive.
-- SECURITY DEFINER so it bypasses RLS and always performs a real query,
-- which registers as database activity (prevents Supabase pausing).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.ping()
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object('status', 'ok', 'server_time', NOW());
$$;

-- Allow both anonymous (cron) and authenticated callers
GRANT EXECUTE ON FUNCTION public.ping() TO anon, authenticated;
