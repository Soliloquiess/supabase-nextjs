import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authorName, type PostRow } from "../types";
import { deletePost, toggleLike } from "../actions";
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

  // 좋아요 카운트 + 현재 사용자의 좋아요 여부
  const { count: likeCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", post.id);

  let isLiked = false;
  if (user) {
    const { data: likedRow } = await supabase
      .from("likes")
      .select("post_id")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .maybeSingle();
    isLiked = !!likedRow;
  }

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

      <form action={toggleLike} className="flex">
        <input type="hidden" name="post_id" value={post.id} />
        <Button
          type="submit"
          variant={isLiked ? "default" : "outline"}
          size="sm"
          aria-pressed={isLiked}
        >
          <Heart
            className={cn("size-4", isLiked && "fill-red-500 text-red-500")}
            aria-hidden
          />
          좋아요 {likeCount ?? 0}
        </Button>
      </form>

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
