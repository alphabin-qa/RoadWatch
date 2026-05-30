// Server-side Supabase client. Uses the secret key (bypasses RLS).
// NEVER import this from "use client" code.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url) throw new Error("[supabase] SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) is not set");
  if (!secret) throw new Error("[supabase] SUPABASE_SECRET_KEY is not set");

  _client = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

// Lazily initialize on first property access. Importing this module during
// `next build` (page-data collection) must not throw when env vars are absent -
// the client is only created when a route actually uses it at request time.
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export const PHOTO_BUCKET = "roadwatch-photos";
