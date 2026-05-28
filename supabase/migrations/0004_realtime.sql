-- Phase 2: Realtime — comments 테이블의 변경 이벤트를 클라이언트로 스트리밍.
-- 이미 publication에 포함돼 있으면 "already member" 에러가 날 수 있는데 무시 OK.

alter publication supabase_realtime add table public.comments;
