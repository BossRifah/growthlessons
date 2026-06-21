import { getPublishedPosts } from "@/lib/posts";

const BASE = "https://growthlessons.vercel.app";

export const dynamic = "force-dynamic";

// Auto-generated sitemap: homepage, blog index, and every published post.
export default async function sitemap() {
  let posts = [];
  try {
    const res = await getPublishedPosts(1000);
    posts = res.posts || [];
  } catch {
    posts = [];
  }

  const postEntries = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.published_at || p.created_at || new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...postEntries,
  ];
}
