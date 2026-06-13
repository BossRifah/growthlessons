import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function getPost(slug) {
  const { data, error } = await supabase
    .from("posts")
    .select("title, excerpt, content, cover_url, published, published_at, created_at")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} — Growth Lessons`,
    description: post.excerpt || undefined,
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <article>
      <p className="post-meta">
        <Link href="/blog">← Back to blog</Link>
      </p>
      <h1>{post.title}</h1>
      <p className="post-meta">
        {formatDate(post.published_at || post.created_at)}
      </p>

      {post.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cover" src={post.cover_url} alt={post.title} />
      )}

      <div className="post-content">{post.content}</div>
    </article>
  );
}
