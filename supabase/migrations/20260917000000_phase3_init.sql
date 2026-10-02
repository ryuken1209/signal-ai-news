-- ============================================================================
-- AI News Hub ("Signal") — Phase 3 Database Schema & Migrations
-- Generated for PostgreSQL & Supabase
-- Migration: 20260917000000_phase3_init.sql
-- ============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. PROFILES (Private user information linked to auth.users)
-- Does NOT duplicate email, passwords, or authentication credentials.
-- Only stores display info and is strictly private to the user by default.
-- ============================================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================================
-- 2. ARTICLES (Prepared for Phase 4/5 persistence & personalization)
-- Note: Phase 2 continues to use /api/news live RSS engine for the public feed.
-- Matches Phase 2 normalized article schema.
-- ============================================================================
create table if not exists public.articles (
  id text primary key,
  title text not null,
  description text,
  url text unique not null,
  source text not null,
  source_url text,
  image_url text,
  published_at timestamptz default now() not null,
  category text not null,
  reading_time_min integer default 2 not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_articles_published_at on public.articles(published_at desc);
create index if not exists idx_articles_category on public.articles(category);

-- ============================================================================
-- 3. CATEGORIES
-- ============================================================================
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  slug text unique not null,
  created_at timestamptz default now() not null
);

-- ============================================================================
-- 4. TAGS
-- ============================================================================
create table if not exists public.tags (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  slug text unique not null,
  created_at timestamptz default now() not null
);

-- ============================================================================
-- 5. ARTICLE_TAGS (Many-to-Many: Articles <-> Tags)
-- ============================================================================
create table if not exists public.article_tags (
  article_id text references public.articles(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (article_id, tag_id)
);

create index if not exists idx_article_tags_tag on public.article_tags(tag_id);

-- ============================================================================
-- 6. SAVED_ARTICLES (Bookmarks: User <-> Article)
-- ============================================================================
create table if not exists public.saved_articles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  article_id text references public.articles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (user_id, article_id)
);

create index if not exists idx_saved_articles_user on public.saved_articles(user_id);

-- ============================================================================
-- 7. COLLECTIONS (User-curated folders)
-- ============================================================================
create table if not exists public.collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  is_private boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_collections_user on public.collections(user_id);

-- ============================================================================
-- 8. COLLECTION_ARTICLES (Many-to-Many: Collections <-> Articles)
-- ============================================================================
create table if not exists public.collection_articles (
  collection_id uuid references public.collections(id) on delete cascade not null,
  article_id text references public.articles(id) on delete cascade not null,
  added_at timestamptz default now() not null,
  primary key (collection_id, article_id)
);

-- ============================================================================
-- 9. NOTES (Private user notes on articles)
-- ============================================================================
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  article_id text references public.articles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, article_id)
);

create index if not exists idx_notes_user on public.notes(user_id);

-- ============================================================================
-- 10. LIKES (User <-> Article Likes)
-- ============================================================================
create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  article_id text references public.articles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (user_id, article_id)
);

create index if not exists idx_likes_article on public.likes(article_id);

-- ============================================================================
-- 11. READING_HISTORY (Tracking read articles)
-- ============================================================================
create table if not exists public.reading_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  article_id text references public.articles(id) on delete cascade not null,
  progress_percent integer default 100 not null,
  read_at timestamptz default now() not null,
  unique (user_id, article_id)
);

create index if not exists idx_reading_history_user on public.reading_history(user_id);

-- ============================================================================
-- 12. USER_PREFERENCES (Personalization & Settings)
-- ============================================================================
create table if not exists public.user_preferences (
  user_id uuid references auth.users(id) on delete cascade primary key,
  theme text default 'dark' not null,
  email_digest boolean default false not null,
  preferences jsonb default '{}'::jsonb not null,
  updated_at timestamptz default now() not null
);

-- ============================================================================
-- 13. FOLLOWED_TOPICS (Topics/Categories followed by user)
-- ============================================================================
create table if not exists public.followed_topics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  topic text not null,
  created_at timestamptz default now() not null,
  unique (user_id, topic)
);

create index if not exists idx_followed_topics_user on public.followed_topics(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict user ownership isolation
-- ============================================================================

-- 1. Profiles (Strictly private to the user by default - no public directory)
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. Articles (Public catalog)
alter table public.articles enable row level security;

create policy "Articles are viewable by everyone"
  on public.articles for select
  using (true);

create policy "Authenticated users can insert articles"
  on public.articles for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update articles"
  on public.articles for update
  using (auth.role() = 'authenticated');

-- 3. Categories
alter table public.categories enable row level security;

create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

-- 4. Tags
alter table public.tags enable row level security;

create policy "Tags are viewable by everyone"
  on public.tags for select
  using (true);

-- 5. Article Tags
alter table public.article_tags enable row level security;

create policy "Article tags are viewable by everyone"
  on public.article_tags for select
  using (true);

create policy "Authenticated users can link article tags"
  on public.article_tags for insert
  with check (auth.role() = 'authenticated');

-- 6. Saved Articles (Bookmarks)
alter table public.saved_articles enable row level security;

create policy "Users manage their own saved articles"
  on public.saved_articles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 7. Collections
alter table public.collections enable row level security;

create policy "Users can view own or public collections"
  on public.collections for select
  using (auth.uid() = user_id or is_private = false);

create policy "Users can insert their own collections"
  on public.collections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own collections"
  on public.collections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own collections"
  on public.collections for delete
  using (auth.uid() = user_id);

-- 8. Collection Articles
alter table public.collection_articles enable row level security;

create policy "View articles in accessible collections"
  on public.collection_articles for select
  using (
    exists (
      select 1 from public.collections
      where id = collection_id
      and (user_id = auth.uid() or is_private = false)
    )
  );

create policy "Insert into own collection"
  on public.collection_articles for insert
  with check (
    exists (
      select 1 from public.collections
      where id = collection_id
      and user_id = auth.uid()
    )
  );

create policy "Delete from own collection"
  on public.collection_articles for delete
  using (
    exists (
      select 1 from public.collections
      where id = collection_id
      and user_id = auth.uid()
    )
  );

-- 9. Notes (Strictly private user notes)
alter table public.notes enable row level security;

create policy "Users manage their own notes"
  on public.notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 10. Likes
alter table public.likes enable row level security;

create policy "Likes are viewable by everyone"
  on public.likes for select
  using (true);

create policy "Users manage their own likes"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users delete their own likes"
  on public.likes for delete
  using (auth.uid() = user_id);

-- 11. Reading History (Strictly private)
alter table public.reading_history enable row level security;

create policy "Users manage their own reading history"
  on public.reading_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 12. User Preferences (Strictly private)
alter table public.user_preferences enable row level security;

create policy "Users manage their own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 13. Followed Topics (Strictly private)
alter table public.followed_topics enable row level security;

create policy "Users manage their own followed topics"
  on public.followed_topics for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- AUTOMATED PROFILE & PREFERENCES GENERATION TRIGGER
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  cleaned_username text;
begin
  cleaned_username := coalesce(
    new.raw_user_meta_data->>'username',
    lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')) || '_' || substr(new.id::text, 1, 4)
  );

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    cleaned_username,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- SEED DATA: Pre-populate standard categories
-- ============================================================================
insert into public.categories (name, slug)
values
  ('AI', 'ai'),
  ('Technology', 'technology'),
  ('Startups', 'startups'),
  ('Research', 'research'),
  ('Programming', 'programming'),
  ('Cybersecurity', 'cybersecurity')
on conflict (slug) do nothing;
