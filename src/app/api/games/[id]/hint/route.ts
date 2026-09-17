import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { drawExtraHint } from "@/lib/puzzle/engine";
import type { GameRow } from "@/lib/supabase/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: game, error } = await admin
    .from("games")
    .select("*")
    .eq("id", id)
    .single<GameRow>();

  if (error || !game || game.user_id !== user.id) {
    return NextResponse.json({ error: "게임을 찾을 수 없습니다." }, { status: 404 });
  }
  if (game.status !== "playing") {
    return NextResponse.json({ error: "이미 종료된 게임입니다." }, { status: 400 });
  }

  const { hint, remainingPool } = drawExtraHint(game.remaining_pool);
  if (!hint) {
    return NextResponse.json({ error: "더 이상 제공할 힌트가 없습니다." }, { status: 400 });
  }

  const { error: updateError } = await admin
    .from("games")
    .update({
      hints: [...game.hints, hint],
      remaining_pool: remainingPool,
      extra_hints_used: game.extra_hints_used + 1,
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "힌트 요청에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ text: hint.text });
}
