import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { authorName, type CommentRow } from "../types";
import { createComment, deleteComment } from "../actions";

/** 상세 페이지의 댓글 섹션. 목록 조회 + 작성 폼(로그인 시) + 삭제(본인). */
export async function CommentsSection({
  postId,
  currentUserId,
}: {
  postId: string;
  currentUserId: string | null;
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select("id, post_id, author_id, content, created_at, profiles(username)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  const comments = (data ?? []) as unknown as CommentRow[];

  return (
    <section className="space-y-4 border-t pt-6">
      <h2 className="text-lg font-semibold">댓글 ({comments.length})</h2>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">첫 댓글을 남겨보세요.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {authorName(c.profiles)} ·{" "}
                  {new Date(c.created_at).toLocaleString("ko-KR")}
                </p>
                {currentUserId === c.author_id && (
                  <form action={deleteComment}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="post_id" value={postId} />
                    <Button type="submit" variant="ghost" size="sm">
                      삭제
                    </Button>
                  </form>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{c.content}</p>
            </li>
          ))}
        </ul>
      )}

      {currentUserId ? (
        <form action={createComment} className="space-y-2 border-t pt-4">
          <input type="hidden" name="post_id" value={postId} />
          <textarea
            name="content"
            required
            rows={3}
            placeholder="댓글을 입력하세요"
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          />
          <Button type="submit" size="sm">
            댓글 등록
          </Button>
        </form>
      ) : (
        <p className="border-t pt-4 text-sm text-muted-foreground">
          댓글을 쓰려면{" "}
          <Link href="/auth/login" className="underline">
            로그인
          </Link>
          하세요.
        </p>
      )}
    </section>
  );
}
