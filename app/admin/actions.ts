"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/** 신고 처리 완료 표시. RLS로 관리자만 실행 가능(아니면 0행 영향). */
export async function resolveReport(formData: FormData) {
  const reportId = String(formData.get("report_id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", reportId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

/** 관리자 권한으로 글 삭제(RLS의 admin 정책으로 허용). 페이지 이동 없이 /admin에 머무름. */
export async function adminDeletePost(formData: FormData) {
  const postId = String(formData.get("post_id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/posts");
}
