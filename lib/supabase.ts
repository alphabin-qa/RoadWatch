// Server-side Supabase client. Uses the secret key (bypasses RLS).
// NEVER import this from "use client" code.

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!url) console.warn("[supabase] SUPABASE_URL not set");
if (!secret) console.warn("[supabase] SUPABASE_SECRET_KEY not set");

export const supabaseAdmin = createClient(url ?? "", secret ?? "", {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const PHOTO_BUCKET = "roadwatch-photos";
