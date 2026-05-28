import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { authorName, type PostRow } from "../types";
import { deletePost } from "../actions";
import { CommentsSection } from "./comments-section";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <article className="mx-auto w-full max-w-2xl space-y-6 p-5">
      <Link
        href="/posts"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        목록으로
      </Link>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중…</p>
        }
      >
        <PostDetailContent params={params} />
      </Suspense>
    </article>
  );
}

async function PostDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("posts")
    .select(
      "id, title, content, author_id, created_at, updated_at, profiles(username)",
    )
    .eq("id", id)
    .single();

  if (!data) notFound();
  const post = data as unknown as PostRow;
  const isAuthor = user?.id === post.author_id;

  return (
    <>
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{post.title}</h1>
        <p className="text-sm text-muted-foreground">
          {authorName(post.profiles)} ·{" "}
          {new Date(post.created_at).toLocaleString("ko-KR")}
        </p>
      </header>

      <div className="text-[0.95rem] whitespace-pre-wrap leading-7">
        {post.content || "(내용 없음)"}
      </div>

      {isAuthor && (
        <div className="flex gap-2 border-t pt-4">
          <Button asChild variant="outline" size="sm">
            <Link href={`/posts/${post.id}/edit`}>수정</Link>
          </Button>
          <form action={deletePost}>
            <input type="hidden" name="id" value={post.id} />
            <Button type="submit" variant="destructive" size="sm">
              삭제
            </Button>
          </form>
        </div>
      )}

      <CommentsSection postId={post.id} currentUserId={user?.id ?? null} />
    </>
  );
}
