import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Read from environment variables (set in Vercel dashboard) so the cron
// pings the SAME project the app uses.
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return response.status(500).json({
      error: "Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.",
    });
  }

  try {
    // Call the SECURITY DEFINER ping() function — always performs a real DB
    // query regardless of RLS, which counts as database activity.
    const { data, error } = await supabase.rpc("ping");

    if (error) {
      throw error;
    }

    return response.status(200).json({
      message: "Supabase pinged successfully",
      timestamp: new Date().toISOString(),
      db: data,
    });
  } catch (error: any) {
    return response.status(500).json({
      error: error.message,
    });
  }
}
