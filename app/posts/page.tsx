import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authorName, type PostRow } from "./types";

// Next 16(cacheComponents): 동적 데이터(쿠키/auth/searchParams)는 Suspense 안에서 읽는다.
export default function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-5">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중…</p>
        }
      >
        <PostsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function PostsContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: rawQ } = await searchParams;
  // .or() 필터의 구분자/와일드카드 충돌을 피하기 위해 위험 문자만 제거.
  const q = (rawQ ?? "").replace(/[%,()*]/g, " ").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("posts")
    .select(
      "id, title, content, author_id, created_at, updated_at, profiles(username)",
    )
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
  }

  const { data } = await query;
  const posts = (data ?? []) as unknown as PostRow[];

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">커뮤니티 게시판</h1>
        {user ? (
          <Button asChild>
            <Link href="/posts/new">글쓰기</Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/auth/login">로그인하고 글쓰기</Link>
          </Button>
        )}
      </div>

      {/* 검색: GET 폼이라 추가 JS 없이 URL ?q=...로 제출 */}
      <form action="/posts" method="get" className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="제목·내용 검색"
            aria-label="게시글 검색"
            className="pl-8"
          />
        </div>
        <Button type="submit" variant="outline">
          검색
        </Button>
        {q && (
          <Button asChild type="button" variant="ghost">
            <Link href="/posts">초기화</Link>
          </Button>
        )}
      </form>

      {q && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          &ldquo;{q}&rdquo; 검색 결과 {posts.length}건
        </p>
      )}

      {posts.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {q ? "검색 결과가 없습니다." : "아직 게시글이 없습니다. 첫 글을 작성해 보세요."}
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {posts.map((post) => (
            <li key={post.id} className="p-4 hover:bg-accent/50">
              <Link href={`/posts/${post.id}`} className="block">
                <h2 className="font-medium">{post.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {post.content}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {authorName(post.profiles)} ·{" "}
                  {new Date(post.created_at).toLocaleDateString("ko-KR")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
