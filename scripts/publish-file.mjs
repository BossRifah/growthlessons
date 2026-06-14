// Publishes a single Markdown file (with frontmatter) to the Payload CMS via the
// ingest endpoint. The endpoint converts the Markdown to Lexical and creates the
// post. Used by .github/workflows/publish-post.yml so you can publish a written
// post without the admin UI.
//
// Run:  FILE=content/posts/your-post.md node scripts/publish-file.mjs
//
// Required env: SITE_URL, INGEST_SECRET.
// Optional env: PUBLISH ("false" saves a draft).

import { readFileSync } from "fs";

const { SITE_URL, INGEST_SECRET, PUBLISH = "true" } = process.env;
const file = process.env.FILE || process.argv[2];
const siteUrl = (SITE_URL || "").replace(/\/$/, "");

function fail(msg) {
  console.error("✖ " + msg);
  process.exit(1);
}

if (!siteUrl) fail("Missing SITE_URL");
if (!INGEST_SECRET) fail("Missing INGEST_SECRET");
if (!file) fail("Missing file path (set FILE or pass as the first argument)");

// Parse simple `key: value` frontmatter delimited by --- lines.
function parse(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw.trim() };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) meta[key] = val;
  }
  return { meta, body: m[2].trim() };
}

async function main() {
  const { meta, body } = parse(readFileSync(file, "utf8"));
  if (!meta.title) fail("Frontmatter must include a title");
  if (!body) fail("File has no body content");

  const publish = PUBLISH !== "false";
  const res = await fetch(`${siteUrl}/api/posts/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ingest-secret": INGEST_SECRET,
    },
    body: JSON.stringify({
      title: meta.title,
      slug: meta.slug || undefined,
      excerpt: meta.excerpt || "",
      coverUrl: meta.coverUrl || undefined,
      markdown: body,
      publish,
    }),
  });
  if (!res.ok) fail(`Ingest HTTP ${res.status}: ${await res.text()}`);
  const out = await res.json();
  console.log(
    `✓ ${publish ? "Published" : "Saved draft"}: "${meta.title}"  →  /blog/${out.slug}`
  );
}

main().catch((e) => fail(e.message));
