"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/** 게시글 작성 (로그인 필요, 본인을 author로). */
export async function createPost(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!title) redirect("/posts/new?error=title");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data, error } = await supabase
    .from("posts")
    .insert({ title, content, author_id: user.id })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/posts");
  redirect(`/posts/${data.id}`);
}

/** 게시글 수정 (RLS로 작성자 본인만 실제 반영). */
export async function updatePost(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!id || !title) redirect(`/posts/${id}/edit?error=title`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update({ title, content })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/posts/${id}`);
  revalidatePath("/posts");
  redirect(`/posts/${id}`);
}

/** 게시글 삭제 (RLS로 작성자 본인만 실제 반영). */
export async function deletePost(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/posts");
  redirect("/posts");
}

/** 댓글 작성 (로그인 필요, 본인을 author로). */
export async function createComment(formData: FormData) {
  const postId = String(formData.get("post_id") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  if (!postId || !content) redirect(`/posts/${postId}`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: user.id, content });
  if (error) throw new Error(error.message);

  revalidatePath(`/posts/${postId}`);
}

/** 댓글 삭제 (RLS로 작성자 본인만 실제 반영). */
export async function deleteComment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const postId = String(formData.get("post_id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/posts/${postId}`);
}
