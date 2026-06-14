import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { getPostBySlug, formatDate } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { post } = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} — Growth Lessons`,
    description: post.excerpt || undefined,
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const { post, error } = await getPostBySlug(slug);

  if (error) {
    return (
      <div className="container">
        <div className="article">
          <div className="empty">Couldn&apos;t load this post: {error.message}</div>
        </div>
      </div>
    );
  }
  if (!post) notFound();

  return (
    <div className="container">
      <article className="article">
        <Link href="/blog" className="back-link">
          ← Back to blog
        </Link>
        <h1>{post.title}</h1>
        <p className="meta">{formatDate(post.published_at || post.created_at)}</p>

        {post.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="cover" src={post.cover_url} alt={post.title} />
        )}

        <div className="post-content">
          {post.content && <RichText data={post.content} />}
        </div>
      </article>
    </div>
  );
}
