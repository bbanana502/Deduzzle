import { createClient } from "./client";

/** 익명 로그인 세션이 없으면 새로 만든다. Supabase 대시보드에서 Anonymous Sign-ins를 켜둬야 동작한다. */
export async function ensureSession() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;

  const { data: signInData, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return signInData.session;
}
