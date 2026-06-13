import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Always fetch fresh data so new posts show up without a rebuild.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog — Growth Lessons",
  description: "Read the latest posts.",
};

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, published_at, created_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    return (
      <section>
        <h1>Blog</h1>
        <div className="empty">
          Couldn&apos;t load posts: {error.message}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h1>Blog</h1>

      {!posts || posts.length === 0 ? (
        <div className="empty">
          No published posts yet. Add one in your Supabase{" "}
          <strong>Table Editor → posts</strong> (set <code>published</code> to
          true), and it will appear here.
        </div>
      ) : (
        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.id}>
              <p className="post-meta">
                {formatDate(post.published_at || post.created_at)}
              </p>
              <h2>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
