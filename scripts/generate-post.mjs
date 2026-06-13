// Daily blog post generator.
//
// Flow: read recent post titles (to avoid repeats) -> ask Gemini to write a
// fresh post (falls back to Groq if Gemini fails) -> insert it into Supabase.
//
// Runs from GitHub Actions (see .github/workflows/daily-post.yml) or locally:
//   node --env-file=.env.automation scripts/generate-post.mjs
//
// Required env:
//   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
//   SUPABASE_SERVICE_ROLE_KEY   <- secret, server-only, bypasses RLS to insert
//   GEMINI_API_KEY              <- primary writer (free tier)
// Optional env:
//   GROQ_API_KEY                <- free fallback writer (Groq, not xAI's Grok)
//   AUTHOR_ID                   <- a profiles.id to attribute posts to
//   PUBLISH                     <- "false" to save as draft instead of publishing

import { createClient } from "@supabase/supabase-js";

const {
  SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  GEMINI_API_KEY,
  GROQ_API_KEY,
  AUTHOR_ID,
  PUBLISH = "true",
} = process.env;

const supabaseUrl = SUPABASE_URL || NEXT_PUBLIC_SUPABASE_URL;

function fail(msg) {
  console.error("✖ " + msg);
  process.exit(1);
}

if (!supabaseUrl) fail("Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)");
if (!SUPABASE_SERVICE_ROLE_KEY) fail("Missing SUPABASE_SERVICE_ROLE_KEY");
if (!GEMINI_API_KEY && !GROQ_API_KEY)
  fail("Need at least one of GEMINI_API_KEY or GROQ_API_KEY");

const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const SYSTEM = `You are Rifah, a content-led growth marketer with 6+ years scaling B2B SaaS startups (including two YC companies). You write practical, no-fluff lessons on SEO, content marketing, LLM/AI visibility (GEO), and B2B growth. Your readers are beginner-to-intermediate marketers who want to become specialized SEO, content, or growth professionals. Voice: clear, direct, experienced, and encouraging. Teach with concrete steps and examples.`;

function buildPrompt(recentTitles) {
  const recent = recentTitles.length
    ? recentTitles.map((t) => "- " + t).join("\n")
    : "- (none yet)";
  return `${SYSTEM}

Write ONE complete blog post for my blog "Growth Lessons".

Do NOT overlap with these recent posts:
${recent}

Requirements:
- Choose a fresh, specific, genuinely useful topic in my niche.
- 700-1000 words.
- Body in Markdown: use ## subheadings, short paragraphs, and bullet lists where useful.
- Actionable, with at least one concrete example or mini-framework.
- Do NOT invent statistics, numbers, or fake case studies. Keep claims honest and general.

Respond with ONLY a valid JSON object (no markdown fences) in exactly this shape:
{"title": "...", "excerpt": "one-sentence summary, max 160 chars", "content": "full post body in markdown"}`;
}

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
        maxOutputTokens: 4096,
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

async function resolveAuthor() {
  if (AUTHOR_ID) return AUTHOR_ID;
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .limit(1)
    .maybeSingle();
  return data?.id || null;
}

async function uniqueSlug(base) {
  let slug = base;
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    slug = `${base}-${i + 2}`;
  }
  return `${base}-${Date.now()}`;
}

async function main() {
  const { data: recent } = await supabase
    .from("posts")
    .select("title")
    .order("created_at", { ascending: false })
    .limit(20);
  const recentTitles = (recent || []).map((r) => r.title);

  const raw = await generate(buildPrompt(recentTitles));
  const post = extractJson(raw);
  if (!post.title || !post.content)
    throw new Error("Model output missing title or content");

  const date = new Date().toISOString().slice(0, 10);
  const slug = await uniqueSlug(`${slugify(post.title)}-${date}`);
  const publish = PUBLISH !== "false";

  const row = {
    title: post.title.trim(),
    slug,
    excerpt: (post.excerpt || "").trim().slice(0, 200),
    content: post.content.trim(),
    author_id: await resolveAuthor(),
    published: publish,
    published_at: publish ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from("posts")
    .insert(row)
    .select("id, slug")
    .single();
  if (error) throw new Error("Supabase insert failed: " + error.message);

  console.log(`✓ ${publish ? "Published" : "Saved draft"}: "${row.title}"`);
  console.log(`  id=${data.id}  slug=${data.slug}`);
}

main().catch((e) => {
  console.error("✖ " + e.message);
  process.exit(1);
});
