import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Initialize Supabase client
const SUPABASE_URL = "https://ewdprhronbnjvhzvcymt.supabase.co";
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZHByaHJvbmJuanZoenZjeW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjY5NzgsImV4cCI6MjA4NjA0Mjk3OH0.CvaZQTDrVXv1xaV3u2-J9G701SgEyFcodp4Ep3OV1JM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    try {
        // Perform a simple read operation to keep the database active
        const { count, error } = await supabase
            .from("user_profiles")
            .select("*", { count: "exact", head: true });

        if (error) {
            throw error;
        }

        return response.status(200).json({
            message: "Supabase pinged successfully",
            timestamp: new Date().toISOString(),
            user_count: count,
        });
    } catch (error: any) {
        return response.status(500).json({
            error: error.message,
        });
    }
}
