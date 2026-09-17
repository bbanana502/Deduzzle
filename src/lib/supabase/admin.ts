import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * service_role 키를 쓰는 서버 전용 클라이언트. RLS를 우회하므로 절대 클라이언트 번들에
 * 포함되면 안 되고, API Route(서버 코드)에서만 import해야 한다.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
