import { createClient } from "@supabase/supabase-js";

// These come from .env.local (and from your Vercel project settings in production).
// The publishable/anon key is safe to expose in the browser — Row Level Security
// on the database is what actually protects your data.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
