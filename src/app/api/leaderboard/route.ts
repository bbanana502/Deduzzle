import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const digitCount = searchParams.get("digitCount");

  const admin = createAdminClient();
  let query = admin
    .from("games")
    .select("nickname, digit_count, score, finished_at")
    .eq("status", "won")
    .order("score", { ascending: false })
    .limit(20);

  if (digitCount) {
    query = query.eq("digit_count", Number(digitCount));
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "랭킹 조회에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ entries: data });
}
