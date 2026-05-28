import { Suspense } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "./actions";

export default function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  return (
    <div className="mx-auto w-full max-w-xl space-y-6 p-5">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중…</p>
        }
      >
        <ProfileContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ProfileContent({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">프로필</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </header>

      {ok && (
        <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          저장되었습니다.
        </p>
      )}
      {error === "username" && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          닉네임은 비울 수 없습니다.
        </p>
      )}

      <form action={updateProfile} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">닉네임</Label>
          <Input
            id="username"
            name="username"
            required
            defaultValue={profile?.username ?? ""}
            placeholder="다른 사람에게 보일 이름"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatar_url">아바타 URL (선택)</Label>
          <Input
            id="avatar_url"
            name="avatar_url"
            type="url"
            defaultValue={profile?.avatar_url ?? ""}
            placeholder="https://… (이미지 URL)"
          />
          <p className="text-xs text-muted-foreground">
            외부 이미지 URL을 붙여넣을 수 있어요. 업로드(Supabase Storage)는 추후 추가 예정.
          </p>
        </div>
        <Button type="submit">저장</Button>
      </form>

      {profile?.avatar_url && (
        <div className="space-y-2 border-t pt-4">
          <p className="text-sm text-muted-foreground">현재 아바타 미리보기</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatar_url}
            alt="아바타"
            className="size-20 rounded-full border object-cover"
          />
        </div>
      )}
    </>
  );
}
