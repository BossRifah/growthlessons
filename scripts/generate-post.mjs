// Daily blog post generator (source-grounded).
//
// Flow each morning:
//   1. Load your brief (content/workflow.md) and sources (content/sources.json)
//   2. Fetch fresh material from your sources (RSS, falling back to raw URL)
//   3. Read recent post titles (to avoid repeats)
//   4. Ask Gemini to write a post that follows your brief and uses the material
//      (falls back to Groq if Gemini fails or is rate-limited)
//   5. Send it to the Payload CMS ingest endpoint (which converts the Markdown
//      to Lexical and creates the post)
//
// Run from GitHub Actions (.github/workflows/daily-post.yml) or locally:
//   node --env-file=.env.automation scripts/generate-post.mjs
//
// Required env: SITE_URL (the deployed site, e.g. https://growthlessons.com),
//   INGEST_SECRET (must match the value set on the site), and at least one of
//   GEMINI_API_KEY / GROQ_API_KEY.
// Optional env: PUBLISH ("false" = save draft instead of publishing).

import { readFileSync } from "fs";
import Parser from "rss-parser";

const {
  SITE_URL,
  INGEST_SECRET,
  GEMINI_API_KEY,
  GROQ_API_KEY,
  PUBLISH = "true",
} = process.env;

const siteUrl = (SITE_URL || "").replace(/\/$/, "");

function fail(msg) {
  console.error("✖ " + msg);
  process.exit(1);
}

if (!siteUrl) fail("Missing SITE_URL (the deployed site URL)");
if (!INGEST_SECRET) fail("Missing INGEST_SECRET");
if (!GEMINI_API_KEY && !GROQ_API_KEY)
  fail("Need at least one of GEMINI_API_KEY or GROQ_API_KEY");

const UA = "growthlessons-bot/1.0 (+https://github.com/BossRifah/growthlessons)";
const SYSTEM =
  "You write blog posts by strictly following the provided brief, and you reply with ONLY the requested JSON object.";

// ---------------------------------------------------------------- config files
function loadText(rel, fallback = "") {
  try {
    return readFileSync(new URL(rel, import.meta.url), "utf8");
  } catch {
    return fallback;
  }
}

const workflow = loadText(
  "../content/workflow.md",
  "Write a practical, honest blog post on content marketing, SEO, or B2B growth for beginner marketers. 700-1000 words, Markdown, no invented stats."
);

let sourcesCfg = { sources: [], itemsPerSource: 3, maxTotalItems: 12 };
try {
  sourcesCfg = { ...sourcesCfg, ...JSON.parse(loadText("../content/sources.json", "{}")) };
} catch (e) {
  console.warn("Could not parse content/sources.json: " + e.message);
}

// --------------------------------------------------------------------- research
const rss = new Parser({ timeout: 9000, headers: { "User-Agent": UA } });

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchWithTimeout(url, ms = 9000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": UA } });
  } finally {
    clearTimeout(t);
  }
}

async function fromRss(src, n) {
  const feed = await rss.parseURL(src.url);
  return (feed.items || []).slice(0, n).map((it) => ({
    source: src.name,
    title: (it.title || "").trim(),
    snippet: htmlToText(it.contentSnippet || it.content || it.summary || "").slice(0, 240),
  }));
}

async function fromUrl(src) {
  const res = await fetchWithTimeout(src.url);
  const html = await res.text();
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return [
    {
      source: src.name,
      title: m ? m[1].trim() : src.name,
      snippet: htmlToText(html).slice(0, 1000),
    },
  ];
}

// Shuffle so a long source list rotates over time instead of the writer only
// ever reading the first few feeds before hitting maxTotalItems.
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function fetchResearch(cfg) {
  const items = [];
  for (const src of shuffled(cfg.sources || [])) {
    if (items.length >= cfg.maxTotalItems) break;
    try {
      let got;
      if (src.type === "url") {
        got = await fromUrl(src);
      } else {
        try {
          got = await fromRss(src, cfg.itemsPerSource);
        } catch (e) {
          // "Both": if the RSS parse fails, fall back to fetching the raw page.
          console.warn(`  ⚠ ${src.name} RSS failed (${e.message}); trying raw URL`);
          got = await fromUrl(src);
        }
      }
      items.push(...got);
      console.log(`  ✓ ${src.name}: ${got.length} item(s)`);
    } catch (e) {
      console.warn(`  ⚠ ${src.name} failed: ${e.message}`);
    }
  }
  return items.slice(0, cfg.maxTotalItems);
}

// ----------------------------------------------------------------------- prompt
function buildPrompt(research, recentTitles) {
  const researchBlock = research.length
    ? research
        .map((r) => `- [${r.source}] ${r.title}${r.snippet ? ` — ${r.snippet}` : ""}`)
        .join("\n")
    : "(no fresh material could be fetched today — write from your own expertise)";
  const recent = recentTitles.length
    ? recentTitles.map((t) => "- " + t).join("\n")
    : "- (none yet)";

  return `${workflow}

## Automation mode (overrides the brief where they conflict)
You are running unattended on a schedule. You do NOT have SERP screenshots,
AI-overview screenshots, Semrush data, or specific competitor URLs, so do not
ask for them and do not stop. Treat the research material below as your source
and competitor signal. Do the analysis steps (intent, entity map, question map,
outline) internally as your own reasoning; do NOT print the coverage table, the
outline, the meta block, or the quality-check report. Your visible output is the
finished blog post only.
Length: the post must be between 1500 and 4500 words. Aim for genuine depth in
that range, not padding: cover the topic thoroughly with real sections, examples,
and a FAQ, and stop when it is complete rather than stretching to hit a number.
Hard requirements that still apply: one question per section with a standalone
opening answer; sentence-case headings (the H1/title may use title case); no em
dashes; follow every rule in the tone and style section. Do NOT invent statistics
or attach numbers to named sources you cannot verify, and never use "[verify]" or
placeholder citations: if you are not confident a stat is real, write the point
without a number. Put the FAQ at the end of the content as a "## FAQ" section.

## Research material (recent items from my sources — use as background; pick your own angle)
${researchBlock}

## My recent posts (do NOT repeat these angles)
${recent}

## Output
Respond with ONLY a valid JSON object (no markdown fences) in exactly this shape:
{"title": "...", "excerpt": "one-sentence summary, max 160 chars", "content": "full post body in markdown"}
"content" is the full post in markdown (intro, body sections, and FAQ). Do not
include the title as an H1 inside content; the site renders the title separately.`;
}

// -------------------------------------------------------------------- providers
function extractJson(text) {
  let t = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in model output");
  return JSON.parse(t.slice(start, end + 1));
}

async function callGemini(prompt) {
  const model = "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.85,
        // ~8k tokens leaves room for a 4500-word post plus the JSON wrapper.
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    }),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  if (!text) throw new Error("Gemini returned empty output");
  return text;
}

async function callGroq(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.85,
      max_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("Groq returned empty output");
  return text;
}

async function generate(prompt) {
  if (GEMINI_API_KEY) {
    try {
      console.log("→ Generating with Gemini…");
      return await callGemini(prompt);
    } catch (e) {
      console.warn("  Gemini failed: " + e.message);
    }
  }
  if (GROQ_API_KEY) {
    console.log("→ Falling back to Groq…");
    return await callGroq(prompt);
  }
  throw new Error("All configured providers failed");
}

// ------------------------------------------------------------------- publishing
function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "");
}

// Read recent published titles from Payload's public REST API so the writer can
// avoid repeating angles. Failure here is non-fatal — we just skip the hint.
async function recentTitles() {
  try {
    const res = await fetchWithTimeout(
      `${siteUrl}/api/posts?limit=20&sort=-createdAt&depth=0`,
      9000
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.docs || []).map((d) => d.title).filter(Boolean);
  } catch (e) {
    console.warn("  Could not fetch recent titles: " + e.message);
    return [];
  }
}

async function ingest(post, publish) {
  const date = new Date().toISOString().slice(0, 10);
  const res = await fetch(`${siteUrl}/api/posts/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ingest-secret": INGEST_SECRET,
    },
    body: JSON.stringify({
      title: post.title.trim(),
      slug: `${slugify(post.title)}-${date}`,
      excerpt: (post.excerpt || "").trim().slice(0, 200),
      markdown: post.content.trim(),
      publish,
    }),
  });
  if (!res.ok) throw new Error(`Ingest HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

async function main() {
  console.log("Fetching research from your sources…");
  const research = await fetchResearch(sourcesCfg);
  console.log(`Collected ${research.length} item(s).`);

  const recent = await recentTitles();

  const raw = await generate(buildPrompt(research, recent));
  const post = extractJson(raw);
  if (!post.title || !post.content)
    throw new Error("Model output missing title or content");

  const publish = PUBLISH !== "false";
  const result = await ingest(post, publish);

  console.log(`✓ ${publish ? "Published" : "Saved draft"}: "${post.title.trim()}"`);
  console.log(`  id=${result.id}  slug=${result.slug}`);
}

main().catch((e) => {
  console.error("✖ " + e.message);
  process.exit(1);
});
