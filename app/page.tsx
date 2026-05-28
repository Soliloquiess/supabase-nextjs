import { Suspense } from "react";
import Link from "next/link";
import {
  Heart,
  MessageSquare,
  Pencil,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";

import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

const features = [
  {
    icon: Pencil,
    title: "게시글 작성",
    body: "로그인하면 글을 쓸 수 있고, 본인 글만 수정·삭제할 수 있어요.",
  },
  {
    icon: MessageSquare,
    title: "실시간 댓글",
    body: "Supabase Realtime으로 새 댓글이 새로고침 없이 바로 보입니다.",
  },
  {
    icon: Heart,
    title: "좋아요",
    body: "마음에 드는 글에 한 번 클릭. 사용자당 1회 토글.",
  },
  {
    icon: Search,
    title: "검색 · 페이지네이션",
    body: "제목·내용으로 검색하고, 10개씩 페이지로 끊어서 가볍게.",
  },
  {
    icon: User,
    title: "프로필",
    body: "닉네임·아바타를 직접 설정. 파일 업로드(Supabase Storage) 지원.",
  },
  {
    icon: ShieldCheck,
    title: "RLS 보안",
    body: "권한은 데이터베이스 행 단위 보안(RLS)으로 강제합니다.",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <nav className="w-full border-b border-b-foreground/10">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 text-sm">
          <div className="flex items-center gap-5 font-semibold">
            <Link href="/">커뮤니티 게시판</Link>
            <Link
              href="/posts"
              className="font-normal text-foreground/70 hover:text-foreground"
            >
              게시판
            </Link>
            <Link
              href="/profile"
              className="font-normal text-foreground/70 hover:text-foreground"
            >
              프로필
            </Link>
          </div>
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <Suspense>
              <AuthButton />
            </Suspense>
          )}
        </div>
      </nav>

      <section className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-24">
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
            Next.js · Supabase · Realtime
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            함께 쓰고 함께 읽는
            <br />
            작은 커뮤니티
          </h1>
          <p className="max-w-xl text-balance text-muted-foreground">
            가입하고 글을 쓰고, 댓글로 이야기를 나누고, 좋아요로 응원하세요.
            실시간 댓글과 검색까지 갖춘 가벼운 게시판입니다.
          </p>
          <Suspense fallback={<div className="h-10" />}>
            <HeroCtas />
          </Suspense>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-5 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/30"
            >
              <Icon className="size-5 text-primary" aria-hidden />
              <h3 className="mt-3 font-medium">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-auto w-full border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-muted-foreground">
          <p>
            Next.js +{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium hover:underline"
            >
              Supabase
            </a>{" "}
            · 인프런 강의 미션 프로젝트
          </p>
          <ThemeSwitcher />
        </div>
      </footer>
    </main>
  );
}

/** 로그인 상태에 따라 두 번째 CTA를 글쓰기/가입하기로 분기. cookies/auth 사용이라 Suspense 안에서. */
async function HeroCtas() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      <Button asChild>
        <Link href="/posts">게시판 둘러보기 →</Link>
      </Button>
      {user ? (
        <Button asChild variant="outline">
          <Link href="/posts/new">글쓰기</Link>
        </Button>
      ) : (
        <Button asChild variant="outline">
          <Link href="/auth/sign-up">가입하기</Link>
        </Button>
      )}
    </div>
  );
}
