"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { savePost, deletePost } from "@/app/admin/actions";

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

// Two-pane CMS editor: form fields on the left, live markdown preview on the
// right. The slug auto-follows the title until you edit the slug by hand.
export default function PostEditor({ post = null }) {
  const isEdit = Boolean(post?.id);
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [coverUrl, setCoverUrl] = useState(post?.cover_url || "");
  const [content, setContent] = useState(post?.content || "");
  const [published, setPublished] = useState(Boolean(post?.published));

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const effectiveSlug = slugTouched ? slug : slugify(title);

  return (
    <div className="admin-wrap">
      <div className="admin-bar">
        <div className="admin-bar-left">
          <Link href="/admin" className="admin-back">
            ← All posts
          </Link>
          <h1 className="admin-title">{isEdit ? "Edit post" : "New post"}</h1>
        </div>
        <span className={`status-pill ${published ? "is-live" : "is-draft"}`}>
          {published ? "Published" : "Draft"}
        </span>
      </div>

      <div className="editor-grid">
        <form action={savePost} className="editor-form">
          {isEdit && <input type="hidden" name="id" value={post.id} />}

          <label className="field">
            <span className="field-label">Title</span>
            <input
              className="field-input"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="How to build a content distribution strategy"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Slug</span>
            <input
              className="field-input mono"
              name="slug"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="auto-generated-from-title"
            />
          </label>

          <label className="field">
            <span className="field-label">
              Excerpt <span className="field-hint">{excerpt.length}/200</span>
            </span>
            <textarea
              className="field-input"
              name="excerpt"
              rows={2}
              maxLength={200}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="One-sentence summary used on cards and meta description."
            />
          </label>

          <label className="field">
            <span className="field-label">Cover image URL</span>
            <input
              className="field-input mono"
              name="cover_url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://… (optional)"
            />
          </label>

          <label className="field">
            <span className="field-label">
              Content (Markdown) <span className="field-hint">{words} words</span>
            </span>
            <textarea
              className="field-input editor-textarea mono"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write in Markdown. Headings, **bold**, tables, and lists all render."
            />
          </label>

          <label className="toggle">
            <input
              type="checkbox"
              name="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <span>Published (visible on the live blog)</span>
          </label>

          <div className="editor-actions">
            <button type="submit" className="btn btn-purple">
              {isEdit ? "Save changes" : "Create post"}
            </button>
            {effectiveSlug && published && (
              <Link
                href={`/blog/${effectiveSlug}`}
                className="btn btn-ghost"
                target="_blank"
              >
                View live
              </Link>
            )}
          </div>
        </form>

        <div className="editor-preview">
          <div className="preview-label">Live preview</div>
          <article className="article preview-body">
            <h1>{title || "Untitled post"}</h1>
            <div className="post-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || "_Start typing to see your post render here._"}
              </ReactMarkdown>
            </div>
          </article>
        </div>
      </div>

      {isEdit && (
        <form
          action={deletePost}
          className="danger-zone"
          onSubmit={(e) => {
            if (!confirm("Delete this post permanently?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={post.id} />
          <button type="submit" className="btn btn-danger">
            Delete post
          </button>
        </form>
      )}
    </div>
  );
}
