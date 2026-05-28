---
description: Supabase DB 타입 생성 (lib/database.types.ts)
---

Supabase 스키마로부터 TypeScript 타입을 생성해줘.

- 명령 예: `npx supabase gen types typescript --project-id <PROJECT_REF> > lib/database.types.ts`
  (또는 로컬: `npx supabase gen types typescript --local > lib/database.types.ts`)
- 먼저 `.env.local`/설정에서 project ref를 확인하고, 없으면 사용자에게 물어봐.
- 생성 후 `lib/supabase/*` 클라이언트에 `Database` 제네릭을 연결할 수 있게 안내해줘.

⚠️ 토큰/키는 출력하거나 커밋하지 말 것.
