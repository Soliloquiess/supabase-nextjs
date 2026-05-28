import { Suspense } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { authorName, type PostRow } from "./types";

// Next 16(cacheComponents): 동적 데이터(쿠키/auth)는 Suspense 안에서 읽는다.
export default function PostsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-5">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중…</p>
        }
      >
        <PostsContent />
      </Suspense>
    </div>
  );
}

async function PostsContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("posts")
    .select(
      "id, title, content, author_id, created_at, updated_at, profiles(username)",
    )
    .order("created_at", { ascending: false });

  const posts = (data ?? []) as unknown as PostRow[];

  return (
    <>
      <div className="flex items-center justify-between">
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

      {posts.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          아직 게시글이 없습니다. 첫 글을 작성해 보세요.
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
