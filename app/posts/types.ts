// 게시글 조회 결과의 최소 타입. (Supabase DB 타입을 생성하면 이걸 대체 가능 — /db-types)
export interface PostRow {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  // 조인된 작성자. Supabase는 관계를 객체 또는 배열로 줄 수 있어 둘 다 허용.
  profiles: { username: string | null } | { username: string | null }[] | null;
}

/** 조인된 profiles에서 작성자 이름을 안전하게 추출. */
export function authorName(profiles: PostRow["profiles"]): string {
  const p = Array.isArray(profiles) ? profiles[0] : profiles;
  return p?.username ?? "익명";
}

/** 댓글 조회 결과 타입. profiles는 작성자 username 조인용. */
export interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles: PostRow["profiles"];
}
