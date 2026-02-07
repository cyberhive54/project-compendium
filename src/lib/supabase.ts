import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ewdprhronbnjvhzvcymt.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZHByaHJvbmJuanZoenZjeW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjY5NzgsImV4cCI6MjA4NjA0Mjk3OH0.CvaZQTDrVXv1xaV3u2-J9G701SgEyFcodp4Ep3OV1JM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
