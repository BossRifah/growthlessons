# Payload CMS setup & cutover

The site now uses **Payload CMS** (admin at `/admin`) as the source of truth for
blog posts, replacing the old custom admin and direct Supabase reads. Posts are
stored in a dedicated `payload` schema in your existing Supabase Postgres
database, so the old `public.*` tables are left untouched until you choose to
drop them.

This is a one-time setup. Do it on a Vercel **preview** deploy of the
`claude/bold-gates-84kave` branch first, verify, then merge to production.

---

## 1. Environment variables (Vercel → Project → Settings → Environment Variables)

Add these for **Production and Preview**:

| Variable | Where to get it |
|---|---|
| `PAYLOAD_SECRET` | Any long random string. `openssl rand -base64 32` |
| `DATABASE_URI` | Supabase → Settings → Database → Connection string → **Connection pooling (Transaction)**. URL-encode the password. |
| `INGEST_SECRET` | Any random string (the auto-writer will use the same value). |
| `S3_BUCKET` | A Supabase Storage bucket name, e.g. `media` (create it, make it public). |
| `S3_REGION` | Your Supabase project region, e.g. `us-east-1`. |
| `S3_ENDPOINT` | `https://YOUR-PROJECT.supabase.co/storage/v1/s3` |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Supabase → Storage → **S3 connection** → new access key. |

You can keep the existing `NEXT_PUBLIC_SUPABASE_*` vars; they are no longer used
by the site but do no harm.

> **Important:** use the **pooler** connection string (port 6543) on Vercel, not
> the direct connection, or you'll exhaust connections on serverless.

## 2. Create the database tables

Payload manages its own schema. After the env vars are set, run migrations once.
Easiest is locally against the same database:

```bash
# with .env.local filled in (PAYLOAD_SECRET + DATABASE_URI)
npm install
npx payload migrate:create   # generates the initial migration
npx payload migrate          # applies it to the `payload` schema
```

(Alternatively, set `push: true` on the postgres adapter for a first run to
auto-create tables, then switch back. Migrations are the safer path.)

## 3. Create your first admin user

Visit `https://<your-deploy>/admin`. On first load Payload shows a **Create
first user** screen. Set your email + password. That's your CMS login.

## 4. Enable the auto-writer to post

1. In `/admin`, open your user → enable **API Key** (optional; the writer uses
   the shared secret by default).
2. In **GitHub → repo Settings → Secrets and variables → Actions**, set:
   - `SITE_URL` = your deployed URL (no trailing slash)
   - `INGEST_SECRET` = the same value you put in Vercel
   - keep `GEMINI_API_KEY` / `GROQ_API_KEY`
   - the old `SUPABASE_*` / `AUTHOR_ID` secrets are no longer needed.
3. Trigger **Actions → Daily blog post → Run workflow** to test. It will POST to
   `/api/posts/ingest`, which converts the Markdown to Lexical and publishes.

## 5. Migrate the 3 existing posts (optional, one-time)

Brings the old posts into Payload with their slugs and dates preserved:

```bash
# .env.migrate needs: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SITE_URL, INGEST_SECRET
node --env-file=.env.migrate scripts/migrate-from-supabase.mjs
```

## 6. After you're happy

- The old `public.posts/profiles/tags/comments` tables are unused and can be
  dropped whenever you like (keep a backup first).
- Merge `claude/bold-gates-84kave` to your production branch.

---

### How it fits together

- **Editing:** `/admin` (Payload) — rich-text Lexical editor, drafts, media.
- **Public site:** reads published posts via Payload's Local API (`lib/posts.js`).
- **Auto-writer:** `scripts/generate-post.mjs` → `POST /api/posts/ingest`.
- **Media:** uploaded to Supabase Storage via the S3 adapter.
