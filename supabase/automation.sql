-- Run this in the Supabase SQL Editor to enable the daily auto-publisher.
--
-- The automation inserts posts with no logged-in user, so author_id must be
-- allowed to be empty. (Posts inserted by the script use the service_role key,
-- which bypasses Row Level Security.)

alter table public.posts
  alter column author_id drop not null;
