# PRD — 커뮤니티 게시판 (Community Board)

> Supabase(인증·DB·RLS)와 Next.js(App Router)로 만드는 회원제 커뮤니티 게시판.
> 회원이 글을 쓰고, 댓글을 달고, 좋아요를 누르는 가장 기본적인 커뮤니티를 MVP로 구축한다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 프로젝트명 | 커뮤니티 게시판 (Community Board) |
| 목적 | 회원제 글쓰기/댓글/좋아요가 가능한 최소 커뮤니티를 빠르게 출시하고 점진 확장 |
| 목표 | ① Supabase 인증으로 가입/로그인 ② 게시글 CRUD ③ 댓글·좋아요 ④ RLS로 본인 글만 수정/삭제 |
| 대상 사용자 | 특정 주제로 글을 나누고 싶은 일반 사용자 |

### 왜 Supabase인가
인증(Auth) · 데이터베이스(Postgres) · 행 단위 보안(RLS) · 실시간(Realtime)을 한 번에 제공해
별도 백엔드 없이도 "로그인한 사용자만, 자기 글만 수정" 같은 규칙을 DB 레벨에서 안전하게 강제할 수 있다.

---

## 2. 핵심 기능

### MVP (Must)
1. **인증** — 이메일 회원가입/로그인/로그아웃 (Supabase Auth, 스타터 제공분 활용)
2. **게시글 목록** — 최신순 글 목록 (제목·작성자·작성시각·댓글/좋아요 수)
3. **게시글 작성** — 로그인 사용자만 제목·본문 작성
4. **게시글 상세** — 본문 + 댓글 목록 + 좋아요
5. **게시글 수정/삭제** — 작성자 본인만 (RLS로 강제)
6. **댓글** — 로그인 사용자 댓글 작성, 본인 댓글 삭제
7. **좋아요** — 게시글 좋아요 토글 (사용자당 1회)

### 확장 (Later / Out of MVP)
- 카테고리/태그, 검색
- 이미지 첨부 (Supabase Storage)
- 실시간 댓글 (Realtime 구독)
- 프로필 페이지·아바타
- 신고/관리자 모더레이션
- 페이지네이션/무한 스크롤

---

## 3. 기술 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript | 서버 컴포넌트에서 데이터 페칭 |
| Auth/DB | Supabase (Auth, Postgres, RLS) | `@supabase/ssr` + `@supabase/supabase-js` |
| Styling | Tailwind CSS + shadcn/ui | 스타터 제공 컴포넌트 재사용 |
| Icons | Lucide React | |
| 배포 | Vercel | 환경 변수로 Supabase 키 주입 |

> 🔒 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 는 공개 가능한 anon 키다.
> 민감 작업은 RLS 정책으로 막고, 서비스 롤 키는 절대 클라이언트에 노출하지 않는다.

---

## 4. 데이터 모델 (Supabase / Postgres)

```
profiles   (id=auth.users.id PK, username, avatar_url, created_at)
posts      (id PK, author_id FK→profiles, title, content, created_at, updated_at)
comments   (id PK, post_id FK→posts, author_id FK→profiles, content, created_at)
likes      (post_id FK→posts, user_id FK→profiles, created_at, PK(post_id,user_id))
```

RLS 정책(요지):
- `posts`/`comments`: 읽기는 모두 허용, 작성은 `auth.uid() = author_id`, 수정/삭제는 본인만
- `likes`: 본인 행만 추가/삭제, 읽기 허용
- `profiles`: 읽기 허용, 본인 행만 수정

---

## 5. 사용자 스토리

- **방문자**: 로그인 없이도 게시글 목록과 상세를 읽고 싶다.
- **신규 사용자**: 이메일로 가입하고 로그인해서 글을 쓰고 싶다.
- **작성자**: 내가 쓴 글만 수정/삭제하고 싶다(남의 글은 못 건드리게).
- **독자**: 마음에 드는 글에 좋아요를 누르고(중복 없이) 댓글을 달고 싶다.
- **로그인 사용자**: 로그아웃하면 더 이상 글쓰기 버튼이 보이지 않아야 한다.

---

## 6. 성공 기준 (MVP 완료 정의)
- 가입→로그인→글 작성→목록/상세 확인→댓글·좋아요→로그아웃이 끊김 없이 동작
- 다른 사용자의 글 수정/삭제가 RLS로 차단됨(클라이언트 우회 불가)
- 비로그인 상태에서도 목록·상세 열람 가능, 쓰기 액션은 로그인 유도
- Vercel 배포 URL에서 위 흐름이 동작
