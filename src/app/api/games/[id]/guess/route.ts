import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildReview } from "@/lib/puzzle/engine";
import { calculateScore } from "@/lib/puzzle/score";
import type { GameRow, AttemptRow } from "@/lib/supabase/types";

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

  const body = await request.json().catch(() => null);
  const guess = body?.guess;

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

  const isValidShape =
    Array.isArray(guess) &&
    guess.length === game.digit_count &&
    guess.every((d) => Number.isInteger(d) && d >= 0 && d <= 9) &&
    new Set(guess).size === guess.length;

  if (!isValidShape) {
    return NextResponse.json(
      { error: `서로 다른 숫자로 이루어진 ${game.digit_count}자리 숫자를 입력해주세요.` },
      { status: 400 }
    );
  }

  const isCorrect = guess.every((d: number, i: number) => d === game.answer[i]);

  await admin.from("attempts").insert({
    game_id: id,
    guess,
    is_correct: isCorrect,
  });

  if (!isCorrect) {
    await admin
      .from("games")
      .update({ wrong_guesses: game.wrong_guesses + 1 })
      .eq("id", id);
    // 어디가 틀렸는지는 알려주지 않는다. 정답을 맞혀야만 전체 기록을 복기할 수 있다.
    return NextResponse.json({ correct: false });
  }

  const score = calculateScore({
    digitCount: game.digit_count,
    extraHintsUsed: game.extra_hints_used,
    wrongGuesses: game.wrong_guesses,
  });

  await admin
    .from("games")
    .update({ status: "won", score, finished_at: new Date().toISOString() })
    .eq("id", id);

  const { data: attempts } = await admin
    .from("attempts")
    .select("*")
    .eq("game_id", id)
    .order("created_at", { ascending: true })
    .returns<AttemptRow[]>();

  const review = buildReview(
    (attempts ?? []).map((a) => ({
      guess: a.guess,
      isCorrect: a.is_correct,
      createdAt: a.created_at,
    })),
    game.answer
  );

  return NextResponse.json({ correct: true, score, review });
}
