import { getSupabase } from "@/lib/supabase";

const NOT_CONFIGURED = {
  message:
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
    "NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.",
};

// Fetch the most recent published posts. Returns { posts, error }.
// Never throws — a network/config failure resolves to an error message so
// pages can show a friendly state instead of crashing.
export async function getPublishedPosts(limit = 100) {
  const supabase = getSupabase();
  if (!supabase) return { posts: [], error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, slug, excerpt, cover_url, published_at, created_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(limit);

    return { posts: data || [], error };
  } catch (err) {
    return { posts: [], error: { message: err.message || "Network error" } };
  }
}

export async function getPostBySlug(slug) {
  const supabase = getSupabase();
  if (!supabase) return { post: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        "title, excerpt, content, cover_url, published, published_at, created_at"
      )
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    return { post: data, error };
  } catch (err) {
    return { post: null, error: { message: err.message || "Network error" } };
  }
}

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
