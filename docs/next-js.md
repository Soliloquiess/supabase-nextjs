# Next.js 규칙 (App Router)

이 프로젝트의 Next.js 작성 규칙. CLAUDE.md에서 import된다.

## 서버 vs 클라이언트 컴포넌트
- **기본은 서버 컴포넌트.** 데이터 페칭(Supabase 조회)은 서버 컴포넌트/서버 액션에서 한다.
- `"use client"`는 **상호작용이 필요한 최소 단위**에만 (폼, 토글, 좋아요 버튼 등).
- 민감한 로직/키는 서버에만 둔다. `NEXT_PUBLIC_*` 외의 비밀은 클라이언트로 넘기지 않는다.

## 데이터 페칭 / 변경
- 읽기: 서버 컴포넌트에서 `lib/supabase/server.ts`의 클라이언트로 조회.
- 쓰기(작성/수정/삭제): **Server Actions** 또는 Route Handler. 클라이언트에서 직접 service-role 사용 금지.
- 변경 후에는 `revalidatePath`/`revalidateTag`로 캐시 갱신.

## 라우팅
- App Router 규칙(`app/`): `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`.
- 동적 라우트의 `params`/`searchParams`는 **Promise**이므로 `await` 한다.
- `useSearchParams`를 쓰는 클라이언트 컴포넌트는 `<Suspense>`로 감싼다.

## 인증 가드
- 보호 페이지는 서버에서 세션 확인 후 미로그인 시 `redirect("/auth/login")`.
- 미들웨어/`proxy.ts`로 세션 갱신 흐름을 유지한다(스타터 구성 준수).

## 성능
- 정적/ISR이 가능한 목록은 캐시를 활용하고, 사용자별 데이터는 동적으로.
- 이미지에는 `next/image`를 사용한다.
