// One-off migration: copy existing posts from the old Supabase `public.posts`
// table into the new Payload CMS, preserving slug, excerpt, body, and date.
//
// The old body is Markdown; the Payload ingest endpoint converts it to Lexical.
//
// Run once, after Payload is deployed and you've set INGEST_SECRET on the site:
//   node --env-file=.env.migrate scripts/migrate-from-supabase.mjs
//
// Required env:
//   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY,
//   SITE_URL (deployed site), INGEST_SECRET (must match the site's value).

import { createClient } from "@supabase/supabase-js";

const {
  SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SITE_URL,
  INGEST_SECRET,
} = process.env;

const supabaseUrl = SUPABASE_URL || NEXT_PUBLIC_SUPABASE_URL;
const siteUrl = (SITE_URL || "").replace(/\/$/, "");

function fail(msg) {
  console.error("✖ " + msg);
  process.exit(1);
}

if (!supabaseUrl || !SUPABASE_SERVICE_ROLE_KEY)
  fail("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
if (!siteUrl) fail("Missing SITE_URL");
if (!INGEST_SECRET) fail("Missing INGEST_SECRET");

const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("title, slug, excerpt, content, published, published_at, created_at")
    .order("created_at", { ascending: true });
  if (error) fail("Could not read old posts: " + error.message);
  if (!posts?.length) {
    console.log("No posts found in the old table. Nothing to migrate.");
    return;
  }

  console.log(`Migrating ${posts.length} post(s)…`);
  let ok = 0;
  for (const p of posts) {
    try {
      const res = await fetch(`${siteUrl}/api/posts/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ingest-secret": INGEST_SECRET,
        },
        body: JSON.stringify({
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt || "",
          markdown: p.content || "",
          publish: p.published !== false,
          publishedAt: p.published_at || p.created_at || undefined,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const out = await res.json();
      console.log(`  ✓ ${p.title} → /${out.slug}`);
      ok++;
    } catch (e) {
      console.warn(`  ⚠ Failed "${p.title}": ${e.message}`);
    }
  }
  console.log(`Done. Migrated ${ok}/${posts.length}.`);
}

main().catch((e) => fail(e.message));
