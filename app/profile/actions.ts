"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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
