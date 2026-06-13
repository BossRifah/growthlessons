import Link from "next/link";
import { formatDate } from "@/lib/posts";

export default function PostCard({ post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="post-card">
      {post.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="thumb" src={post.cover_url} alt={post.title} />
      ) : (
        <div className="thumb" />
      )}
      <div className="body">
        <div className="cat">Article</div>
        <h3>{post.title}</h3>
        {post.excerpt && <p className="excerpt">{post.excerpt}</p>}
        <div className="foot">
          <span>{formatDate(post.published_at || post.created_at)}</span>
          <span>Read →</span>
        </div>
      </div>
    </Link>
  );
}
