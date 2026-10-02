-- ============================================================================
-- AI News Hub ("Signal") — Phase 5 AI Intelligence & Notifications Schema
-- Migration: 20260917000001_phase5_ai_notifications.sql
-- ============================================================================

-- 1. ARTICLE_AI (Cached AI-generated article intelligence)
create table if not exists public.article_ai (
  article_id text primary key references public.articles(id) on delete cascade,
  summary text not null,
  key_points jsonb not null default '[]'::jsonb,
  explain_simply text,
  why_it_matters text,
  topics jsonb not null default '[]'::jsonb,
  model text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_article_ai_created_at on public.article_ai(created_at desc);

-- RLS: Cached article AI is reader-facing and publicly readable
alter table public.article_ai enable row level security;

create policy "Article AI briefs are viewable by everyone"
  on public.article_ai for select
  using (true);

create policy "Allow inserts to article AI"
  on public.article_ai for insert
  with check (true);

create policy "Allow updates to article AI"
  on public.article_ai for update
  using (true);

-- 2. NOTIFICATIONS (Strictly private user notifications)
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null, -- 'trending', 'followed_topic', 'recommendation', 'digest'
  title text not null,
  message text not null,
  article_id text references public.articles(id) on delete set null,
  read boolean default false not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_notifications_user_unread on public.notifications(user_id, read);
create index if not exists idx_notifications_user_created on public.notifications(user_id, created_at desc);

-- RLS: Strictly private to user
alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);
