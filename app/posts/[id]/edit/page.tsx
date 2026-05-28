import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePost } from "../../actions";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-5">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중…</p>
        }
      >
        <EditPostContent params={params} />
      </Suspense>
    </div>
  );
}

async function EditPostContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: post } = await supabase
    .from("posts")
    .select("id, title, content, author_id")
    .eq("id", id)
    .single();

  if (!post) notFound();
  if (post.author_id !== user.id) redirect(`/posts/${id}`);

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">글 수정</h1>

      <form action={updatePost} className="space-y-4">
        <input type="hidden" name="id" value={post.id} />
        <div className="space-y-2">
          <Label htmlFor="title">제목</Label>
          <Input id="title" name="title" required defaultValue={post.title} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">내용</Label>
          <textarea
            id="content"
            name="content"
            rows={10}
            defaultValue={post.content}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit">저장</Button>
          <Button asChild variant="outline" type="button">
            <Link href={`/posts/${post.id}`}>취소</Link>
          </Button>
        </div>
      </form>
    </>
  );
}
