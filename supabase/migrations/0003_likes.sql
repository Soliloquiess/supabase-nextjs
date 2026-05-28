-- Phase 2: likes 테이블 + RLS
-- 사용자당 게시글 1회 좋아요(복합 PK가 강제).

create table if not exists public.likes (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.likes enable row level security;

-- 읽기: 누구나(카운트 표시용)
drop policy if exists "likes are viewable by everyone" on public.likes;
create policy "likes are viewable by everyone"
  on public.likes for select using (true);

-- 좋아요: 로그인 사용자 본인만
drop policy if exists "authenticated can like" on public.likes;
create policy "authenticated can like"
  on public.likes for insert to authenticated
  with check (auth.uid() = user_id);

-- 좋아요 해제: 본인만
drop policy if exists "users can unlike own" on public.likes;
create policy "users can unlike own"
  on public.likes for delete to authenticated
  using (auth.uid() = user_id);
