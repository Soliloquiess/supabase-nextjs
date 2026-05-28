-- Phase 2+: 아바타 이미지를 Supabase Storage에 저장.
--
-- ⚠️ 실행 전에 Supabase 대시보드에서 다음을 먼저 해주세요:
--   Storage → New bucket → name="avatars", Public=ON
--   (Public이면 누구나 이미지를 GET 가능. 업로드/수정은 아래 정책으로 제한)
--
-- 이 SQL은 storage.objects 테이블에 RLS 정책을 추가:
--   · 누구나 avatars 버킷 파일을 읽기 가능(public 버킷이라 사실상 자동이지만 명시)
--   · 본인 user_id 폴더(예: <uid>/avatar.png)에만 업로드/덮어쓰기/삭제 가능

-- 읽기: 누구나 (Public 버킷의 기본이지만, RLS 정책으로 명시)
drop policy if exists "avatars are publicly readable" on storage.objects;
create policy "avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- 업로드: 로그인 사용자, 본인 폴더(<auth.uid()>/...)에만
drop policy if exists "users can upload own avatar" on storage.objects;
create policy "users can upload own avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 수정/덮어쓰기: 본인 폴더만
drop policy if exists "users can update own avatar" on storage.objects;
create policy "users can update own avatar"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 삭제: 본인 폴더만
drop policy if exists "users can delete own avatar" on storage.objects;
create policy "users can delete own avatar"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
