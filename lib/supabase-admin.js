import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service-role key. NEVER import this
// from a client component — the service-role key bypasses Row Level Security
// and must stay on the server. The admin dashboard uses it so it can read
// drafts and write posts without going through the per-user RLS policies.
let client = null;

export function getAdminSupabase() {
  if (client) return client;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

// posts.author_id is NOT NULL, so every insert needs a profile to attribute to.
// Prefer an explicit AUTHOR_ID, otherwise fall back to the first profile row.
export async function resolveAuthorId(supabase) {
  if (process.env.AUTHOR_ID) return process.env.AUTHOR_ID;
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .limit(1)
    .maybeSingle();
  return data?.id || null;
}

export function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "");
}

export async function uniqueSlug(supabase, base, ignoreId = null) {
  let slug = base || "post";
  for (let i = 0; i < 6; i++) {
    const { data } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data || data.id === ignoreId) return slug;
    slug = `${base}-${i + 2}`;
  }
  return `${base}-${Date.now()}`;
}
