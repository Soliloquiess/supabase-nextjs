# 코딩 스타일 가이드

이 프로젝트의 코드 컨벤션. CLAUDE.md에서 import된다.

## 언어 / 타입
- TypeScript strict. `any` 지양 — `unknown` + 좁히기 또는 정확한 타입.
- 함수 시그니처(특히 서버 액션)의 입력/출력 타입을 명시한다.

## 네이밍
- 변수/함수: `camelCase` · 컴포넌트/타입: `PascalCase` · 상수: `UPPER_SNAKE_CASE`.
- 파일: 컴포넌트 `kebab-case.tsx`(스타터 관례 따름), 라우트는 App Router 규칙.

## 컴포넌트
- 한 파일에 하나의 책임. 서버/클라이언트 경계를 분명히(클라이언트는 `"use client"` 최상단).
- UI는 `components/ui/*`(shadcn) 재사용. 새 원시 컴포넌트를 임의로 만들지 않는다.
- 스타일은 Tailwind 유틸리티. 조건부 클래스는 `cn()` 유틸 사용.

## 접근성
- 색만으로 정보를 전달하지 않는다(텍스트/aria 병행).
- 폼 요소에 label, 버튼/아이콘에 `aria-label`.

## 에러/상태
- 데이터 조회 실패는 사용자에게 알리고, 빈/로딩 상태를 처리한다.
- 비밀 값·토큰을 로그/클라이언트로 흘리지 않는다.

## 커밋
- 작은 단위로 자주. 메시지는 `type: 요약` (예: `feat:`, `fix:`, `chore:`, `docs:`).
- `.env.local` 등 비밀 파일은 절대 커밋하지 않는다.

## 검증
- 작업 후 `npm run lint`와 `npm run build`로 타입/린트를 확인한 뒤 커밋한다.
