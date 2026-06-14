import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Posts } from "./collections/Posts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: "— Growth Lessons",
    },
  },
  collections: [Posts, Media, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || "" },
    // Keep Payload's tables in their own Postgres schema so they never clash
    // with the project's original public.* tables (posts, profiles, etc.).
    schemaName: "payload",
  }),
  sharp,
  plugins: [
    // Store uploaded media in Supabase Storage (S3-compatible).
    s3Storage({
      collections: { media: true },
      bucket: process.env.S3_BUCKET || "",
      config: {
        forcePathStyle: true,
        region: process.env.S3_REGION || "us-east-1",
        endpoint: process.env.S3_ENDPOINT || undefined,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
        },
      },
    }),
  ],
});
