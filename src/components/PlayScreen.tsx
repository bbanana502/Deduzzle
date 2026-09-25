"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { requestHint, submitGuess } from "@/lib/api";
import { GuessInput } from "./GuessInput";
import { NotesGrid } from "./NotesGrid";
import type { CellFeedback } from "@/lib/puzzle/types";

const FEEDBACK_COLORS: Record<CellFeedback, string> = {
  exact: "bg-emerald-500 text-white",
  present: "bg-amber-400 text-white",
  absent: "bg-red-400 text-white",
};

export function PlayScreen() {
  const gameId = useGameStore((s) => s.gameId);
  const digitCount = useGameStore((s) => s.digitCount);
  const difficulty = useGameStore((s) => s.difficulty);
  const hints = useGameStore((s) => s.hints);
  const attempts = useGameStore((s) => s.attempts);
  const addHint = useGameStore((s) => s.addHint);
  const addAttempt = useGameStore((s) => s.addAttempt);
  const win = useGameStore((s) => s.win);

  const [hintLoading, setHintLoading] = useState(false);
  const [guessLoading, setGuessLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noMoreHints, setNoMoreHints] = useState(false);

  async function handleHint() {
    if (!gameId) return;
    setHintLoading(true);
    setError(null);
    try {
      const res = await requestHint(gameId);
      addHint(res.text);
    } catch (e) {
      if (e instanceof Error && e.message.includes("더 이상 제공할 힌트가 없습니다")) {
        setNoMoreHints(true);
      } else {
        setError(e instanceof Error ? e.message : "힌트를 더 받을 수 없습니다.");
      }
    } finally {
      setHintLoading(false);
    }
  }

  async function handleGuess(guess: number[]) {
    if (!gameId) return;
    setGuessLoading(true);
    setError(null);
    try {
      const res = await submitGuess(gameId, guess);
      addAttempt({ guess, correct: res.correct, feedback: res.feedback });
      if (res.correct && res.score !== undefined && res.review) {
        win(res.score, res.review);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "제출에 실패했습니다.");
    } finally {
      setGuessLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">힌트</h2>
        <ul className="flex flex-col gap-2">
          {hints.map((h, i) => (
            <li
              key={i}
              className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800 dark:text-slate-200"
            >
              {i + 1}. {h}
            </li>
          ))}
        </ul>
        {noMoreHints ? (
          <p className="mt-4 text-sm text-slate-400">더 이상 제공할 힌트가 없어요. 지금까지의 힌트로 추리해보세요.</p>
        ) : (
          <button
            onClick={handleHint}
            disabled={hintLoading}
            className="mt-4 text-sm font-medium text-indigo-600 hover:underline disabled:opacity-50 dark:text-indigo-400"
          >
            {hintLoading ? "불러오는 중..." : "+ 힌트 추가 요청 (점수 감점)"}
          </button>
        )}
      </section>

      <NotesGrid />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {digitCount}자리 숫자 맞히기
        </h2>
        <GuessInput length={digitCount} onSubmit={handleGuess} disabled={guessLoading} />
        {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}
      </section>

      {attempts.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            시도 기록 ({attempts.length})
          </h2>
          <ul className="flex flex-col gap-2">
            {attempts.map((a, i) =>
              a.feedback ? (
                <li key={i} className="flex gap-1">
                  {a.guess.map((d, j) => (
                    <span
                      key={j}
                      className={`flex h-8 w-8 items-center justify-center rounded-md font-mono text-sm font-semibold ${FEEDBACK_COLORS[a.feedback![j]]}`}
                    >
                      {d}
                    </span>
                  ))}
                </li>
              ) : (
                <li
                  key={i}
                  className={`inline-block w-fit rounded-lg px-3 py-1 font-mono text-sm ${
                    a.correct
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {a.guess.join("")}
                </li>
              )
            )}
          </ul>
          {difficulty === "easy" ? (
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded bg-emerald-500" /> 자리+숫자 일치
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded bg-amber-400" /> 숫자만 포함
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded bg-red-400" /> 불일치
              </span>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-400">
              틀린 시도는 어디가 틀렸는지 알려주지 않아요. 정답을 맞히면 전체 기록을 복기해드릴게요.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
