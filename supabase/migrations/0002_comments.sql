-- Phase 2: comments 테이블 + RLS
-- Supabase SQL Editor에 붙여 실행.

create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx
  on public.comments (post_id, created_at);

alter table public.comments enable row level security;

-- 읽기: 누구나
drop policy if exists "comments are viewable by everyone" on public.comments;
create policy "comments are viewable by everyone"
  on public.comments for select using (true);

-- 작성: 로그인 사용자, 본인을 author로만
drop policy if exists "authenticated can insert own comments" on public.comments;
create policy "authenticated can insert own comments"
  on public.comments for insert to authenticated
  with check (auth.uid() = author_id);

-- 삭제: 작성자 본인만 (수정은 MVP에선 미지원)
drop policy if exists "authors can delete own comments" on public.comments;
create policy "authors can delete own comments"
  on public.comments for delete to authenticated
  using (auth.uid() = author_id);
