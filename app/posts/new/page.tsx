import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPost } from "../actions";

export default function NewPostPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-5">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중…</p>
        }
      >
        <NewPostContent />
      </Suspense>
    </div>
  );
}

async function NewPostContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">새 글 작성</h1>

      <form action={createPost} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">제목</Label>
          <Input id="title" name="title" required placeholder="제목을 입력하세요" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">내용</Label>
          <textarea
            id="content"
            name="content"
            rows={10}
            placeholder="내용을 입력하세요"
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit">등록</Button>
          <Button asChild variant="outline" type="button">
            <Link href="/posts">취소</Link>
          </Button>
        </div>
      </form>
    </>
  );
}
