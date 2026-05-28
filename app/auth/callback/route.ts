import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * OAuth(또는 매직 링크) 콜백 핸들러.
 * Supabase가 `?code=...` 로 리다이렉트하면 이 라우트가 받아서
 * 세션으로 교환(쿠키 설정)하고 `next`(없으면 /)로 보낸다.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${url.origin}${next}`);
    }
    return NextResponse.redirect(
      `${url.origin}/auth/error?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${url.origin}/auth/error?error=no_code`);
}
