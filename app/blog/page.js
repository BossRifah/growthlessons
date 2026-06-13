import { getPublishedPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog — Growth Lessons",
  description: "Read the latest posts.",
};

export default async function BlogPage() {
  const { posts, error } = await getPublishedPosts();

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">The blog</p>
          <h1>
            Lessons worth <em className="accent-purple">giving a hoot</em> about
          </h1>
          <p>Practical writing on growth, habits, and ideas that compound.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          {error ? (
            <div className="empty">Couldn&apos;t load posts: {error.message}</div>
          ) : posts.length === 0 ? (
            <div className="empty">
              No published posts yet. Add one in your Supabase{" "}
              <strong>Table Editor → posts</strong> (set <code>published</code>{" "}
              to true) and it will appear here.
            </div>
          ) : (
            <div className="card-grid">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
