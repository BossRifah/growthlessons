import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin-auth";
import { getAdminSupabase } from "@/lib/supabase-admin";
import { formatDate } from "@/lib/posts";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  if (!(await isAuthed())) redirect("/admin/login");

  const supabase = getAdminSupabase();
  let posts = [];
  let error = null;
  if (!supabase) {
    error = "Server is missing SUPABASE_SERVICE_ROLE_KEY.";
  } else {
    const res = await supabase
      .from("posts")
      .select("id, title, slug, published, published_at, updated_at, created_at")
      .order("updated_at", { ascending: false });
    posts = res.data || [];
    error = res.error?.message || null;
  }

  return (
    <div className="admin-wrap">
      <div className="admin-bar">
        <div className="admin-bar-left">
          <h1 className="admin-title">Content</h1>
          <span className="admin-count">{posts.length} posts</span>
        </div>
        <div className="admin-bar-right">
          <Link href="/admin/new" className="btn btn-purple">
            + New post
          </Link>
          <form action={logout}>
            <button type="submit" className="btn btn-ghost">
              Log out
            </button>
          </form>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {posts.length === 0 && !error ? (
        <div className="empty">No posts yet. Create your first one.</div>
      ) : (
        <div className="admin-list">
          <div className="admin-row admin-row-head">
            <span>Title</span>
            <span>Status</span>
            <span>Updated</span>
            <span></span>
          </div>
          {posts.map((p) => (
            <div className="admin-row" key={p.id}>
              <span className="admin-cell-title">
                <Link href={`/admin/edit/${p.id}`}>{p.title}</Link>
                <span className="admin-slug">/{p.slug}</span>
              </span>
              <span>
                <span
                  className={`status-pill ${
                    p.published ? "is-live" : "is-draft"
                  }`}
                >
                  {p.published ? "Published" : "Draft"}
                </span>
              </span>
              <span className="admin-date">
                {formatDate(p.updated_at || p.created_at)}
              </span>
              <span className="admin-cell-actions">
                <Link href={`/admin/edit/${p.id}`} className="admin-link">
                  Edit
                </Link>
                {p.published && (
                  <Link
                    href={`/blog/${p.slug}`}
                    className="admin-link"
                    target="_blank"
                  >
                    View
                  </Link>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
