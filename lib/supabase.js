import { createClient } from "@supabase/supabase-js";

// The publishable/anon key is safe to expose in the browser — Row Level
// Security on the database is what actually protects your data.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client = null;

// Lazily create the client. We deliberately DO NOT throw at module load:
// during `next build` every route module is imported to read its config, and
// throwing there would fail the whole build. Instead, return null when the
// env vars are missing and let callers handle it gracefully.
export function getSupabase() {
  if (client) return client;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}
