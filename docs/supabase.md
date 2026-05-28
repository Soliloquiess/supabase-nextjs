# Supabase 사용 가이드

이 프로젝트의 Supabase 사용 규칙. CLAUDE.md에서 import된다.

## 클라이언트 생성 (스타터 구조 준수)
- `lib/supabase/server.ts` — **서버 컴포넌트/액션/Route Handler용** (쿠키 기반 세션).
- `lib/supabase/client.ts` — **브라우저(클라이언트 컴포넌트)용**.
- `lib/supabase/proxy.ts` / 미들웨어 — 요청마다 세션 갱신.
- 컨텍스트에 맞는 클라이언트를 쓴다. 서버 로직에서 브라우저 클라이언트를 쓰지 않는다.

## 환경 변수
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`(anon/publishable) 만 클라이언트 노출 허용.
- **service-role 키는 절대 클라이언트/리포지토리에 넣지 않는다.** `.env.local`은 커밋 금지(`.gitignore` 처리됨, `.env.example` 참고).

## 보안은 RLS로 (가장 중요)
- 모든 테이블에 **RLS를 켜고** 정책으로 접근을 제어한다. "프런트에서 숨기는 것"은 보안이 아니다.
- 표준 정책 패턴:
  - 읽기: 공개 데이터는 `using (true)`.
  - 쓰기: `with check (auth.uid() = author_id)`.
  - 수정/삭제: `using (auth.uid() = author_id)`.
- 예) posts insert 정책:
  ```sql
  create policy "insert own posts" on posts
    for insert to authenticated
    with check (auth.uid() = author_id);
  ```

## 가입 시 프로필 생성
- `auth.users`에 행이 생기면 트리거로 `profiles`를 만든다(`on auth.users` after insert).

## 타입
- 가능하면 Supabase CLI로 DB 타입을 생성해 쿼리에 타입을 입힌다
  (`supabase gen types typescript`). 생성 타입은 `lib/database.types.ts` 등에 둔다.

## 실시간 (Phase 2)
- 댓글 등은 `supabase.channel(...).on("postgres_changes", ...)` 구독으로 실시간 반영.
