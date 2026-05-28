"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

/**
 * 댓글 실시간 갱신 트리거. UI는 그리지 않고, 같은 post_id의 comments
 * 변경 이벤트(insert/update/delete)를 구독해 router.refresh()만 호출한다.
 * 그러면 서버 컴포넌트(CommentsSection)가 최신 댓글로 다시 렌더된다.
 */
export function CommentsRealtime({ postId }: { postId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, router]);

  return null;
}
