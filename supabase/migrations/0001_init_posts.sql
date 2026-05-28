-- Phase 1 스키마: profiles, posts + RLS + 트리거
-- Supabase 대시보드 SQL Editor에 붙여 실행하거나, supabase CLI 마이그레이션으로 적용.

-- ── profiles ──────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are viewable by everyone" on public.profiles;
create policy "profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- ── posts ─────────────────────────────────────────────────
create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  content    text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

-- 읽기: 누구나
drop policy if exists "posts are viewable by everyone" on public.posts;
create policy "posts are viewable by everyone"
  on public.posts for select using (true);

-- 작성: 로그인 사용자, 본인을 author로만
drop policy if exists "authenticated can insert own posts" on public.posts;
create policy "authenticated can insert own posts"
  on public.posts for insert to authenticated
  with check (auth.uid() = author_id);

-- 수정/삭제: 작성자 본인만
drop policy if exists "authors can update own posts" on public.posts;
create policy "authors can update own posts"
  on public.posts for update to authenticated
  using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "authors can delete own posts" on public.posts;
create policy "authors can delete own posts"
  on public.posts for delete to authenticated
  using (auth.uid() = author_id);

-- ── updated_at 자동 갱신 ──────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ── 가입 시 profiles 자동 생성 ───────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
