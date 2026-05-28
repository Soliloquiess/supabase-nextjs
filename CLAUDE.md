# CLAUDE.md

이 파일은 Claude Code가 이 저장소에서 작업할 때 참고하는 메인 컨텍스트다.

# 커뮤니티 게시판 (Supabase + Next.js)

Supabase(인증·Postgres·RLS)와 Next.js(App Router)로 만드는 회원제 커뮤니티 게시판.

## 현재 상태
**초기 설정 단계.** `create-next-app -e with-supabase` 스타터(인증·protected 페이지 포함) 위에
문서·개발 환경을 구성했다. 제품 기능(게시글/댓글/좋아요)은 ROADMAP의 Phase 1부터 구현한다.

# Project Context
- 제품 요구사항: @docs/PRD.md
- 개발 로드맵(Phase별): @docs/ROADMAP.md

# 기술 스택 컨텍스트 (규칙 — 작업 전 참고)
- Next.js 규칙: @docs/next-js.md
- Supabase 사용 가이드: @docs/supabase.md
- 코딩 스타일: @docs/coding-style.md

# 폴더 구조
```
app/                  App Router 페이지/라우트 (auth/, protected/ 스타터 포함)
components/           UI 컴포넌트 (components/ui/* = shadcn)
lib/supabase/         client.ts(브라우저) / server.ts(서버) / proxy.ts(세션 갱신)
docs/                 PRD·ROADMAP·기술 컨텍스트 문서
.claude/              커스텀 커맨드(commands/)·서브에이전트(agents/)·훅(settings.json)
.mcp.json             MCP 서버 설정 (Supabase MCP)
```

# 핵심 규칙 (요약 — 자세한 건 위 컨텍스트 문서)
- **데이터는 서버에서 페칭**, 쓰기는 Server Actions/Route Handler. 클라이언트 컴포넌트는 최소화.
- **보안은 RLS로 강제.** 프런트에서 숨기는 건 보안이 아니다. 모든 테이블 RLS on.
- **비밀 보호**: service-role 키는 클라이언트/저장소 금지. `.env.local`은 커밋하지 않는다
  (`.gitignore` 처리됨, `.env.example` 참고). 클라이언트 노출은 `NEXT_PUBLIC_*`(anon)만.
- 구현 순서는 ROADMAP을 따른다: **골격(인증·DB) → 게시글 CRUD → 댓글·좋아요 → 확장**.
- 작업 후 `npm run lint` · `npm run build`로 검증한 뒤 커밋한다.

# 명령어
- `npm run dev` / `npm run build` / `npm run start` / `npm run lint`

# 개발 도구 (.claude / .mcp.json)
- 커스텀 커맨드: `/typecheck`, `/db-types`, `/new-feature` (`.claude/commands/`)
- 서브에이전트: `supabase-reviewer` (RLS·보안 관점 코드 리뷰, `.claude/agents/`)
- 훅: `.env*` 직접 편집 차단 (`.claude/settings.json` + `.claude/hooks/protect-env.mjs`)
- MCP: Supabase MCP 서버 (`.mcp.json`) — 사용하려면 `SUPABASE_ACCESS_TOKEN`·project-ref 설정 필요
