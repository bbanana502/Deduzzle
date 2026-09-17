import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** 요청자의 로그인 세션을 읽기 위한 서버용 클라이언트 (anon key, RLS 적용됨). */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출된 경우 쿠키를 쓸 수 없음 — 미들웨어가 세션 갱신을 대신 처리한다.
          }
        },
      },
    }
  );
}
