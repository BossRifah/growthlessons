import { getPublishedPosts } from "@/lib/posts";

const BASE = "https://growthlessons.vercel.app";

export const dynamic = "force-dynamic";

// Serves /llms.txt: a curated, AI-friendly map of the site that updates as new
// posts are published.
export async function GET() {
  let posts = [];
  try {
    const res = await getPublishedPosts(1000);
    posts = res.posts || [];
  } catch {
    posts = [];
  }

  const lines = [
    "# Growth Lessons",
    "",
    "> Practical marketing, content, SEO, and B2B growth lessons from Rifah, a content-led growth marketer with 6+ years scaling B2B startups.",
    "",
    "## Pages",
    `- Home: ${BASE}/`,
    `- Blog: ${BASE}/blog`,
    "",
    "## Blog posts",
    ...posts.map((p) =>
      p.excerpt
        ? `- [${p.title}](${BASE}/blog/${p.slug}): ${p.excerpt}`
        : `- [${p.title}](${BASE}/blog/${p.slug})`
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
