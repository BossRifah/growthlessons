// Deletes posts from Payload by slug, via the /api/posts/purge endpoint.
// Used by .github/workflows/delete-posts.yml.
//
// Run:  SLUGS="slug-a,slug-b" node scripts/delete-posts.mjs
//
// Required env: SITE_URL, INGEST_SECRET, SLUGS (comma-separated).

const { SITE_URL, INGEST_SECRET, SLUGS } = process.env;
const siteUrl = (SITE_URL || "").replace(/\/$/, "");

function fail(msg) {
  console.error("✖ " + msg);
  process.exit(1);
}

if (!siteUrl) fail("Missing SITE_URL");
if (!INGEST_SECRET) fail("Missing INGEST_SECRET");

const slugs = (SLUGS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
if (!slugs.length) fail("Missing SLUGS (comma-separated list)");

async function main() {
  const res = await fetch(`${siteUrl}/api/posts/purge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ingest-secret": INGEST_SECRET,
    },
    body: JSON.stringify({ slugs }),
  });
  if (!res.ok) fail(`Purge HTTP ${res.status}: ${await res.text()}`);
  const out = await res.json();
  console.log(`✓ Deleted ${out.count} post(s): ${(out.deleted || []).join(", ")}`);
}

main().catch((e) => fail(e.message));
