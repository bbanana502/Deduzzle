import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatePuzzle, MIN_DIGITS, MAX_DIGITS } from "@/lib/puzzle/engine";

const MAX_HINT_COUNT = 40;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_GAMES = 5;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const admin = createAdminClient();

  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count: recentGameCount } = await admin
    .from("games")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);

  if ((recentGameCount ?? 0) >= RATE_LIMIT_MAX_GAMES) {
    return NextResponse.json(
      { error: "너무 자주 게임을 생성했어요. 잠시 후 다시 시도해주세요." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const digitCount = Number(body?.digitCount);
  const requestedHintCount = Number(body?.hintCount);
  const nickname = typeof body?.nickname === "string" && body.nickname.trim()
    ? body.nickname.trim().slice(0, 20)
    : null;
  const difficulty = body?.difficulty === "easy" ? "easy" : "hard";

  if (
    !Number.isInteger(digitCount) ||
    digitCount < MIN_DIGITS ||
    digitCount > MAX_DIGITS
  ) {
    return NextResponse.json(
      { error: `자릿수는 ${MIN_DIGITS}~${MAX_DIGITS} 사이여야 합니다.` },
      { status: 400 }
    );
  }
  if (
    !Number.isInteger(requestedHintCount) ||
    requestedHintCount < 1 ||
    requestedHintCount > MAX_HINT_COUNT
  ) {
    return NextResponse.json(
      { error: `힌트 개수는 1~${MAX_HINT_COUNT} 사이여야 합니다.` },
      { status: 400 }
    );
  }

  const { answer, hints, remainingPool, minimumRequired } = generatePuzzle(
    digitCount,
    requestedHintCount
  );

  if (nickname) {
    await admin.from("profiles").upsert({ id: user.id, nickname });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .maybeSingle();

  const { data: game, error } = await admin
    .from("games")
    .insert({
      user_id: user.id,
      nickname: nickname ?? profile?.nickname ?? "익명",
      digit_count: digitCount,
      difficulty,
      answer,
      hints,
      remaining_pool: remainingPool,
      status: "playing",
    })
    .select("id")
    .single();

  if (error || !game) {
    return NextResponse.json({ error: "게임 생성에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({
    gameId: game.id,
    digitCount,
    difficulty,
    hints: hints.map((h) => h.text),
    minimumRequired,
    adjustedToMinimum: requestedHintCount < minimumRequired,
  });
}
