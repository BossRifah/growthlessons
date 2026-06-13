# Growth Lessons

A simple, free blog website built with **Next.js** and **Supabase**.

- `/` — home page
- `/blog` — list of published posts
- `/blog/[slug]` — a single post

Posts live in your Supabase database. The site reads them at request time, so a
new post shows up as soon as you publish it — no redeploy needed.

---

## 1. Set up the database (one time)

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql).
3. Click **Run**. This creates the `posts`, `profiles`, `tags`, and `comments`
   tables with security rules already configured.

## 2. Configure environment variables

Your Supabase URL and publishable key are already in `.env.local`. If you ever
need to recreate it, copy `.env.example` to `.env.local` and fill in the values
from Supabase → **Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
```

> The publishable (anon) key is safe to expose in the browser. **Never** put
> your `service_role` / secret key in these files — Row Level Security is what
> protects your data.

## 3. Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## 4. Publishing a blog post

The easiest way (no code needed):

1. Supabase dashboard → **Table Editor** → **posts** → **Insert row**.
2. Fill in:
   - **title** — e.g. `My first lesson`
   - **slug** — the URL part, e.g. `my-first-lesson` (lowercase, no spaces)
   - **author_id** — your user id (see note below)
   - **excerpt** — a short summary shown on the blog list
   - **content** — the full post text
   - **published** — set to `true`
   - **published_at** — set to the current date/time
3. Save. Refresh `/blog` and it appears.

> **author_id note:** The `posts` table requires an author. Create a user under
> Supabase → **Authentication → Users → Add user**, then copy that user's id
> into `author_id`. (Want to skip auth for now? Tell me and I can relax that
> requirement.)

## 5. Deploy for free (Vercel)

1. Push this repo to GitHub (already done if you're reading this on GitHub).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import this
   repo.
3. In the project's **Environment Variables**, add the same two variables from
   `.env.local`.
4. Deploy. You'll get a free `https://your-site.vercel.app` URL.

---

## Tech

- [Next.js](https://nextjs.org) (App Router)
- [Supabase](https://supabase.com) (Postgres + auth + storage, free tier)
