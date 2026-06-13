-- ============================================================
-- Blog schema for Supabase
-- Paste this whole file into the Supabase SQL Editor and run it.
-- Project: https://rltycapmkmxwdiipytxm.supabase.co
-- ============================================================

-- ----------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------
create extension if not exists "pgcrypto";   -- for gen_random_uuid()

-- ----------------------------------------------------------
-- Helper: keep updated_at fresh on every UPDATE
-- ----------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- PROFILES  (one row per auth user)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique,
  full_name   text,
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- POSTS
-- ============================================================
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references public.profiles (id) on delete cascade,
  title        text not null,
  slug         text not null unique,
  excerpt      text,
  content      text,
  cover_url    text,
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists posts_author_idx    on public.posts (author_id);
create index if not exists posts_published_idx on public.posts (published, published_at desc);

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ============================================================
-- TAGS  +  POST <-> TAG join table
-- ============================================================
create table if not exists public.tags (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique,
  slug  text not null unique
);

create table if not exists public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id  uuid not null references public.tags  (id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ============================================================
-- COMMENTS
-- ============================================================
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts    (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comments_post_idx on public.comments (post_id, created_at);

drop trigger if exists trg_comments_updated_at on public.comments;
create trigger trg_comments_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles  enable row level security;
alter table public.posts     enable row level security;
alter table public.tags      enable row level security;
alter table public.post_tags enable row level security;
alter table public.comments  enable row level security;

-- ---- Profiles ----
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- ---- Posts ----
create policy "Published posts are viewable by everyone"
  on public.posts for select
  using (published = true or auth.uid() = author_id);

create policy "Authors can insert their own posts"
  on public.posts for insert with check (auth.uid() = author_id);

create policy "Authors can update their own posts"
  on public.posts for update using (auth.uid() = author_id);

create policy "Authors can delete their own posts"
  on public.posts for delete using (auth.uid() = author_id);

-- ---- Tags (public read, authenticated write) ----
create policy "Tags are viewable by everyone"
  on public.tags for select using (true);

create policy "Authenticated users can manage tags"
  on public.tags for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---- Post <-> Tag links: managed by the post's author ----
create policy "Post tags are viewable by everyone"
  on public.post_tags for select using (true);

create policy "Authors can manage tags on their posts"
  on public.post_tags for all
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_tags.post_id and p.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.posts p
      where p.id = post_tags.post_id and p.author_id = auth.uid()
    )
  );

-- ---- Comments ----
create policy "Comments on visible posts are viewable by everyone"
  on public.comments for select
  using (
    exists (
      select 1 from public.posts p
      where p.id = comments.post_id
        and (p.published = true or p.author_id = auth.uid())
    )
  );

create policy "Authenticated users can comment"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own comments"
  on public.comments for update using (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on public.comments for delete using (auth.uid() = author_id);
