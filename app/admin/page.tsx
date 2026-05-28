import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { adminDeletePost, resolveReport } from "./actions";

interface ReportRow {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  post_id: string;
  posts: { id: string; title: string } | { id: string; title: string }[] | null;
  profiles:
    | { username: string | null }
    | { username: string | null }[]
    | null;
}

function pickOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-5">
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">불러오는 중…</p>}
      >
        <AdminContent />
      </Suspense>
    </div>
  );
}

async function AdminContent() {
  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // 관리자 확인
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) redirect("/");

  // 모든 신고(최신순). RLS가 관리자에게 전체 조회 허용.
  const { data } = await supabase
    .from("reports")
    .select("id, reason, status, created_at, post_id, posts(id, title), profiles(username)")
    .order("created_at", { ascending: false });

  const reports = (data ?? []) as unknown as ReportRow[];
  const pending = reports.filter((r) => r.status === "pending");
  const resolved = reports.filter((r) => r.status === "resolved");

  return (
    <>
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">관리자</h1>
        <p className="text-sm text-muted-foreground">
          신고된 게시글을 검토하고 처리합니다.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-semibold">
          처리 대기 ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            대기 중인 신고가 없습니다.
          </p>
        ) : (
          <ul className="divide-y rounded-md border">
            {pending.map((r) => {
              const post = pickOne(r.posts);
              const reporter = pickOne(r.profiles);
              return (
                <li key={r.id} className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={`/posts/${r.post_id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {post?.title ?? "(삭제된 글)"}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString("ko-KR")}
                    </span>
                  </div>
                  <p className="text-sm">
                    <span className="text-muted-foreground">사유:</span> {r.reason}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    신고자: {reporter?.username ?? "익명"}
                  </p>
                  <div className="flex gap-2">
                    <form action={resolveReport}>
                      <input type="hidden" name="report_id" value={r.id} />
                      <Button type="submit" variant="outline" size="sm">
                        처리 완료
                      </Button>
                    </form>
                    {post && (
                      <form action={adminDeletePost}>
                        <input type="hidden" name="post_id" value={r.post_id} />
                        <Button type="submit" variant="destructive" size="sm">
                          글 삭제
                        </Button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {resolved.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-muted-foreground">
            처리 완료 ({resolved.length})
          </h2>
          <ul className="divide-y rounded-md border opacity-70">
            {resolved.slice(0, 10).map((r) => {
              const post = pickOne(r.posts);
              return (
                <li key={r.id} className="p-3 text-sm">
                  <span className="text-muted-foreground line-through">
                    {post?.title ?? "(삭제된 글)"}
                  </span>{" "}
                  — {r.reason}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}
