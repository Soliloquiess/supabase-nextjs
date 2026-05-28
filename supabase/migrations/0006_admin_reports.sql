-- Phase 2+: 신고 + 관리자 모더레이션
-- · profiles.is_admin 컬럼 추가
-- · is_admin() 헬퍼 함수 (SECURITY DEFINER로 RLS 우회해 안전하게 조회)
-- · reports 테이블 + RLS
-- · posts의 update/delete 정책을 확장해 관리자도 어느 글이든 처리 가능

-- ── 1) profiles.is_admin ───────────────────────────────
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- ── 2) 헬퍼 함수: 현재 사용자가 관리자인지 ──────────────
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ── 3) reports 테이블 ──────────────────────────────────
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason      text not null,
  status      text not null default 'pending', -- 'pending' | 'resolved'
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists reports_status_idx on public.reports (status, created_at);

alter table public.reports enable row level security;

-- 신고 작성: 로그인 사용자, 본인을 reporter로만
drop policy if exists "authenticated can report" on public.reports;
create policy "authenticated can report"
  on public.reports for insert to authenticated
  with check (auth.uid() = reporter_id);

-- 조회: 관리자 전체 / 본인 신고만
drop policy if exists "admin or self can view reports" on public.reports;
create policy "admin or self can view reports"
  on public.reports for select to authenticated
  using (public.is_admin() or auth.uid() = reporter_id);

-- 수정/삭제: 관리자만 (상태 변경, 정리)
drop policy if exists "admin can update reports" on public.reports;
create policy "admin can update reports"
  on public.reports for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin can delete reports" on public.reports;
create policy "admin can delete reports"
  on public.reports for delete to authenticated
  using (public.is_admin());

-- ── 4) posts 정책 확장: 관리자도 모든 글 수정/삭제 가능 ─
drop policy if exists "authors can update own posts" on public.posts;
create policy "authors can update own posts"
  on public.posts for update to authenticated
  using (auth.uid() = author_id or public.is_admin())
  with check (auth.uid() = author_id or public.is_admin());

drop policy if exists "authors can delete own posts" on public.posts;
create policy "authors can delete own posts"
  on public.posts for delete to authenticated
  using (auth.uid() = author_id or public.is_admin());

-- ── 5) 관리자 지정 안내 ────────────────────────────────
-- 특정 사용자를 관리자로 지정하려면(예: 본인 계정), 아래를 한 번 더 실행:
--   update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'your@email.com');
