# ROADMAP — 커뮤니티 게시판

> [`docs/PRD.md`](PRD.md)의 "무엇을"을 **어떤 순서로** 만들지 정리한 문서.
> 원칙: **골격(인증·DB) → 게시글 CRUD → 상호작용(댓글·좋아요) → 확장**. 기능부터 만들지 않는다.

## 전체 순서 한눈에 보기
```
Phase 1 (MVP)   인증 확인 + DB 스키마/RLS + 게시글 목록·작성·상세·수정·삭제
   ↓
Phase 2 (확장)   댓글 + 좋아요 + 검색/카테고리 + 실시간 + 프로필 + 배포 다듬기
```

---

## Phase 1 — MVP

선행: 없음 (Supabase 스타터의 인증은 이미 포함)

**작업 / 체크리스트**
- [ ] Supabase 프로젝트 생성, `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`·`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 설정 (사용자 작업)
- [~] DB 스키마 생성: `profiles`, `posts` 테이블 → SQL 작성 완료(`supabase/migrations/0001_init_posts.sql`), Supabase에서 실행 필요
- [~] RLS 활성화 + 정책: 위 SQL에 포함 (Supabase 실행 시 적용됨)
- [~] 가입 시 `profiles` 자동 생성 트리거: 위 SQL에 포함
- [x] 게시글 목록 페이지 `/posts` (최신순, 서버 컴포넌트에서 조회)
- [x] 게시글 작성 페이지 `/posts/new` (로그인 필요, Server Action `createPost`)
- [x] 게시글 상세 `/posts/[id]` (작성자명·일시·내용)
- [x] 게시글 수정/삭제 (작성자만 UI 노출 + Server Action + RLS로 강제)
- [x] 네비게이션에 `게시판` 링크 + 로그인 상태별 글쓰기 버튼

**완료 기준**: 로그인 후 글 작성→목록/상세 확인→본인 글만 수정/삭제 가능. 비로그인은 열람만.

---

## Phase 2 — 기능 확장

선행: Phase 1

**작업 / 체크리스트**
- [x] `comments` 테이블 + RLS, 상세 페이지 댓글 작성/목록/삭제 (`0002_comments.sql`)
- [x] `likes` 테이블 + RLS, 좋아요 토글(사용자당 1회) + 카운트 표시 (`0003_likes.sql`)
- [x] 목록 검색(제목/본문) — URL 쿼리 `?q=` + Supabase `ilike`
- [x] 페이지네이션 — `?page=N` + `.range()` + `count: exact`
- [x] 실시간 댓글: Supabase Realtime 구독 → `router.refresh()` (`0004_realtime.sql`)
- [~] 프로필 페이지(`/profile`): 닉네임/아바타 URL 편집 완료. Supabase Storage 업로드는 미구현(외부 URL만)
- [x] Vercel 배포 + 환경 변수 → https://supabase-nextjs-beta.vercel.app

**완료 기준**: 댓글·좋아요가 동작하고, 검색으로 글을 찾을 수 있으며, 배포 URL에서 전체 흐름이 동작.

---

## 단계별 의존 관계
| Phase | 선행 | 산출물 |
|---|---|---|
| 1 MVP | - | 인증 + 게시글 CRUD (RLS 보호) |
| 2 확장 | 1 | 댓글·좋아요·검색·실시간·프로필·배포 |
