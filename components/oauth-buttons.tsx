"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * Google / GitHub OAuth 로그인 버튼.
 * Supabase가 Authorization Code Flow + PKCE를 처리하고,
 * 인증 후 /auth/callback?code=... 로 돌아온다.
 *
 * 사용 가능 여부는 Supabase 대시보드(Authentication → Providers)에서
 * 해당 provider를 켜야 한다.
 */
export function OAuthButtons({ next = "/" }: { next?: string }) {
  const [loading, setLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(provider: "google" | "github") {
    setError(null);
    setLoading(provider);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (error) {
        setError(error.message);
        setLoading(null);
      }
      // 성공 시 외부 provider로 리다이렉트되므로 이 함수는 반환되지 않음
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인 오류");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">또는</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => signIn("google")}
        disabled={loading !== null}
      >
        {loading === "google" ? "Google로 이동 중…" : "Google로 계속하기"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => signIn("github")}
        disabled={loading !== null}
      >
        {loading === "github" ? "GitHub로 이동 중…" : "GitHub로 계속하기"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
