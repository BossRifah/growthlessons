import { postgresAdapter } from "@payloadcms/db-postgres";
import { EXPERIMENTAL_TableFeature, lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
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
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, EXPERIMENTAL_TableFeature()],
  }),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    // Keep serverless instances from reserving the session pool's connections.
    pool: {
      connectionString: process.env.DATABASE_URI || "",
      max: 2,
      idleTimeoutMillis: 2_000,
    },
    // Keep Payload's tables in their own Postgres schema so they never clash
    // with the project's original public.* tables (posts, profiles, etc.).
    schemaName: "payload",
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      alwaysInsertFields: true,
    }),
  ],
});
