import { getPayload } from "payload";
import config from "@payload-config";

const NOT_CONFIGURED = {
  message:
    "Payload is not configured. Set DATABASE_URI and PAYLOAD_SECRET in your " +
    "environment.",
};

// Map a Payload post document to the flat shape the UI components expect
// (cover_url, published_at, created_at), so PostCard and the pages stay simple.
function mapPost(doc) {
  if (!doc) return null;
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt || "",
    cover_url:
      (doc.coverImage && typeof doc.coverImage === "object"
        ? doc.coverImage.url
        : null) || null,
    published_at: doc.publishedAt || null,
    created_at: doc.createdAt || null,
    content: doc.content || null,
  };
}

async function client() {
  return getPayload({ config });
}

export async function getPublishedPosts(limit = 100) {
  try {
    const payload = await client();
    const res = await payload.find({
      collection: "posts",
      where: { _status: { equals: "published" } },
      sort: "-publishedAt",
      limit,
      depth: 1,
    });
    return { posts: (res.docs || []).map(mapPost), error: null };
  } catch (err) {
    if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) {
      return { posts: [], error: NOT_CONFIGURED };
    }
    return { posts: [], error: { message: err.message || "Network error" } };
  }
}

export async function getPostBySlug(slug) {
  try {
    const payload = await client();
    const res = await payload.find({
      collection: "posts",
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }],
      },
      limit: 1,
      depth: 1,
    });
    return { post: mapPost(res.docs?.[0]), error: null };
  } catch (err) {
    if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) {
      return { post: null, error: NOT_CONFIGURED };
    }
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
