import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authorName, type PostRow } from "./types";

const PAGE_SIZE = 10;

// Next 16(cacheComponents): 동적 데이터(쿠키/auth/searchParams)는 Suspense 안에서 읽는다.
export default function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
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

/** q, page를 보존하면서 특정 페이지로 가는 URL을 만든다. */
function pageHref(targetPage: number, q: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (targetPage > 1) params.set("page", String(targetPage));
  const s = params.toString();
  return s ? `/posts?${s}` : "/posts";
}

async function PostsContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q: rawQ, page: rawPage } = await searchParams;

  // 검색어: .or() 필터의 구분자/와일드카드 충돌 방지를 위한 sanitize
  const q = (rawQ ?? "").replace(/[%,()*]/g, " ").trim();
  // 페이지: 1 이상 정수로 클램프
  const parsedPage = parseInt(rawPage ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("posts")
    .select(
      "id, title, content, author_id, created_at, updated_at, profiles(username)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
  }

  const { data, count } = await query;
  const posts = (data ?? []) as unknown as PostRow[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {q
          ? `"${q}" 검색 결과 ${total}건`
          : `총 ${total}개의 글`}
      </p>

      {posts.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {q ? "검색 결과가 없습니다." : "아직 게시글이 없습니다. 첫 글을 작성해 보세요."}
        </p>
      ) : (
        <>
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

          {totalPages > 1 && (
            <nav
              className="flex items-center justify-center gap-3 pt-2"
              aria-label="페이지 이동"
            >
              {page > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={pageHref(page - 1, q)}>← 이전</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  ← 이전
                </Button>
              )}
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages} 페이지
              </span>
              {page < totalPages ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={pageHref(page + 1, q)}>다음 →</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  다음 →
                </Button>
              )}
            </nav>
          )}
        </>
      )}
    </>
  );
}
