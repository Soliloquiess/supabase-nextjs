---
description: ROADMAP 기준으로 다음 기능 하나를 최소 구현
argument-hint: [기능 이름]
---

`docs/ROADMAP.md`의 다음 미완 작업(또는 인자로 받은 "$ARGUMENTS")을 **MVP 최소 단위**로 구현해줘.

진행 원칙:
1. `docs/PRD.md`·`docs/ROADMAP.md`·`@docs/next-js.md`·`@docs/supabase.md`·`@docs/coding-style.md` 규칙 준수.
2. 데이터 쓰기는 Server Action, 읽기는 서버 컴포넌트. 보안은 RLS로(테이블 RLS on + 정책).
3. 구현 후 `npm run lint` + `npm run build`로 검증.
4. 기능 단위로 커밋(`feat: ...`). `.env.local` 등 비밀은 커밋 금지.
