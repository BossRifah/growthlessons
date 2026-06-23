import type { CollectionConfig } from "payload";
import { addDataAndFileToRequest } from "payload";
import {
  convertMarkdownToLexical,
  editorConfigFactory,
} from "@payloadcms/richtext-lexical";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70)
    .replace(/^-|-$/g, "");
}

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "_status", "publishedAt"],
  },
  versions: {
    drafts: {
      autosave: false,
    },
  },
  access: {
    // Anyone can read published posts; logged-in editors can read everything.
    read: ({ req: { user } }) => {
      if (user) return true;
      return { _status: { equals: "published" } };
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "Auto-generated from the title if left blank.",
      },
    },
    {
      name: "excerpt",
      type: "textarea",
      maxLength: 200,
      admin: {
        description: "One-sentence summary used on cards and as meta description.",
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      admin: { position: "sidebar" },
    },
    {
      name: "coverUrl",
      type: "text",
      admin: {
        position: "sidebar",
        description:
          "Optional direct image URL (used if no cover image is uploaded).",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    {
      name: "content",
      type: "richText",
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.title) {
          data.slug = slugify(data.title);
        }
        return data;
      },
    ],
    beforeChange: [
      ({ data }) => {
        // Stamp a publish date the first time a post goes live.
        if (data._status === "published" && !data.publishedAt) {
          data.publishedAt = new Date().toISOString();
        }
        return data;
      },
    ],
  },
  endpoints: [
    {
      // POST /api/posts/ingest — used by the daily auto-writer. Accepts Markdown
      // and converts it to Lexical so the same content renders in the editor.
      path: "/ingest",
      method: "post",
      handler: async (req) => {
        const secret = req.headers.get("x-ingest-secret");
        const authorized =
          Boolean(req.user) ||
          (process.env.INGEST_SECRET && secret === process.env.INGEST_SECRET);
        if (!authorized) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        await addDataAndFileToRequest(req);
        const body: any = req.data || {};

        const title = String(body.title || "").trim();
        const markdown = String(body.markdown || body.content || "");
        if (!title || !markdown) {
          return Response.json(
            { error: "title and markdown are required" },
            { status: 400 }
          );
        }

        try {
          const editorConfig = await editorConfigFactory.default({
            config: req.payload.config,
          });
          const content = convertMarkdownToLexical({ editorConfig, markdown });

          const publish = body.publish !== false;
          const slug = body.slug
            ? slugify(String(body.slug))
            : slugify(title);

          // Look for an existing post with this slug so re-publishing the same
          // file updates it instead of failing on the unique-slug constraint.
          const existing = await req.payload.find({
            collection: "posts",
            where: { slug: { equals: slug } },
            limit: 1,
            depth: 0,
            overrideAccess: true,
          });
          const current = existing.docs?.[0];

          const publishedAt = body.publishedAt
            ? new Date(body.publishedAt).toISOString()
            : publish
              ? current?.publishedAt || new Date().toISOString()
              : undefined;

          const data: any = {
            title,
            slug,
            excerpt: String(body.excerpt || "").slice(0, 200),
            coverUrl: body.coverUrl ? String(body.coverUrl) : undefined,
            content,
            _status: publish ? "published" : "draft",
            publishedAt,
          };

          const doc = current
            ? await req.payload.update({
                collection: "posts",
                id: current.id,
                draft: !publish,
                overrideAccess: true,
                data,
              })
            : await req.payload.create({
                collection: "posts",
                draft: !publish,
                overrideAccess: true,
                data,
              });

          return Response.json({
            id: doc.id,
            slug: doc.slug,
            updated: Boolean(current),
          });
        } catch (err: any) {
          // Surface the real reason so it shows up in the publish workflow log.
          return Response.json(
            { error: err?.message || "ingest failed" },
            { status: 500 }
          );
        }
      },
    },
    {
      // POST /api/posts/purge — deletes posts by slug. Body: { slugs: [...] }.
      path: "/purge",
      method: "post",
      handler: async (req) => {
        const secret = req.headers.get("x-ingest-secret");
        const authorized =
          Boolean(req.user) ||
          (process.env.INGEST_SECRET && secret === process.env.INGEST_SECRET);
        if (!authorized) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        await addDataAndFileToRequest(req);
        const body: any = req.data || {};
        const slugs: string[] = Array.isArray(body.slugs)
          ? body.slugs.map((s: any) => String(s).trim()).filter(Boolean)
          : [];
        if (!slugs.length) {
          return Response.json({ error: "slugs array is required" }, { status: 400 });
        }

        try {
          const result = await req.payload.delete({
            collection: "posts",
            where: { slug: { in: slugs } },
            overrideAccess: true,
          });
          const deleted = (result?.docs || []).map((d: any) => d.slug);
          return Response.json({ deleted, count: deleted.length });
        } catch (err: any) {
          return Response.json(
            { error: err?.message || "purge failed" },
            { status: 500 }
          );
        }
      },
    },
  ],
};
