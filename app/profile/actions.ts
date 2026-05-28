"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB

/** 프로필 정보 업데이트(본인만 — RLS로 강제). */
export async function updateProfile(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // 빈 username은 허용하지 않음(있어야 다른 곳에서 표시 가능)
  if (!username) redirect("/profile?error=username");

  const { error } = await supabase
    .from("profiles")
    .update({ username, avatar_url: avatarUrl || null })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/profile");
  revalidatePath("/posts");
  redirect("/profile?ok=1");
}

/**
 * 아바타 이미지 파일을 Supabase Storage(avatars 버킷)에 업로드 후
 * profiles.avatar_url 을 public URL로 갱신한다.
 * Storage RLS로 본인 폴더(<uid>/...)에만 쓸 수 있도록 제한.
 */
export async function uploadAvatar(formData: FormData) {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/profile?error=file");
  }
  if (file.size > MAX_AVATAR_BYTES) redirect("/profile?error=size");
  if (!file.type.startsWith("image/")) redirect("/profile?error=type");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // 본인 폴더(<uid>/avatar) — Storage RLS의 폴더 검증과 매칭. upsert로 덮어쓰기.
  const path = `${user.id}/avatar`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      upsert: true,
      contentType: file.type || "image/png",
    });
  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  // 캐시 우회: 같은 경로를 덮어써도 브라우저가 옛 이미지를 캐싱하지 않도록 쿼리 추가
  const urlWithVersion = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: urlWithVersion })
    .eq("id", user.id);
  if (updateError) throw new Error(updateError.message);

  revalidatePath("/profile");
  revalidatePath("/posts");
  redirect("/profile?ok=upload");
}
