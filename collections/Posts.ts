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

        const editorConfig = await editorConfigFactory.default({
          config: req.payload.config,
        });
        const content = convertMarkdownToLexical({ editorConfig, markdown });

        const publish = body.publish !== false;
        // Allow callers (e.g. the one-off migration) to preserve an original
        // publish date; otherwise stamp now when publishing.
        const publishedAt = body.publishedAt
          ? new Date(body.publishedAt).toISOString()
          : publish
            ? new Date().toISOString()
            : undefined;
        const doc = await req.payload.create({
          collection: "posts",
          overrideAccess: true,
          draft: !publish,
          data: {
            title,
            slug: body.slug ? slugify(String(body.slug)) : undefined,
            excerpt: String(body.excerpt || "").slice(0, 200),
            content,
            _status: publish ? "published" : "draft",
            publishedAt,
          },
        });

        return Response.json({ id: doc.id, slug: doc.slug });
      },
    },
  ],
};
