import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, subject, message } = (request.body ?? {}) as ContactPayload;

  // ── Validation ──────────────────────────────────────────────
  if (typeof name !== "string" || name.trim().length < 2) {
    return response.status(400).json({ error: "Name must be at least 2 characters" });
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return response.status(400).json({ error: "Please enter a valid email address" });
  }
  if (typeof subject !== "string" || subject.trim().length < 5) {
    return response.status(400).json({ error: "Subject must be at least 5 characters" });
  }
  if (typeof message !== "string" || message.trim().length < 10) {
    return response.status(400).json({ error: "Message must be at least 10 characters" });
  }

  // Enforce same character caps as the database
  const cleanName = name.trim().slice(0, 100);
  const cleanEmail = email.trim().slice(0, 254);
  const cleanSubject = subject.trim().slice(0, 200);
  const cleanMessage = message.trim().slice(0, 2000);

  // ── Real client IP (set by Vercel server-side, cannot be spoofed) ──
  const forwarded = request.headers["x-forwarded-for"];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)
    ?.toString()
    .split(",")[0]
    .trim() || "unknown";

  // ── Email hash for per-email rate limiting ──────────────────
  const emailHash = createHash("sha256")
    .update(cleanEmail.toLowerCase())
    .digest("hex");

  // ── Call the rate-limiting function (enforces limits + inserts) ──
  const { data, error } = await supabase.rpc("submit_contact", {
    p_name: cleanName,
    p_email: cleanEmail,
    p_subject: cleanSubject,
    p_message: cleanMessage,
    p_ip: ip,
    p_email_hash: emailHash,
  });

  if (error) {
    return response.status(500).json({ error: error.message });
  }

  const result = data as { success: boolean; error?: string };
  if (!result?.success) {
    return response.status(429).json({ error: result?.error ?? "Submission rate limited" });
  }

  return response.status(200).json({ success: true });
}
