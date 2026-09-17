"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { requestHint, submitGuess } from "@/lib/api";
import { GuessInput } from "./GuessInput";

export function PlayScreen() {
  const gameId = useGameStore((s) => s.gameId);
  const digitCount = useGameStore((s) => s.digitCount);
  const hints = useGameStore((s) => s.hints);
  const attempts = useGameStore((s) => s.attempts);
  const addHint = useGameStore((s) => s.addHint);
  const addAttempt = useGameStore((s) => s.addAttempt);
  const win = useGameStore((s) => s.win);

  const [hintLoading, setHintLoading] = useState(false);
  const [guessLoading, setGuessLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleHint() {
    if (!gameId) return;
    setHintLoading(true);
    setError(null);
    try {
      const res = await requestHint(gameId);
      addHint(res.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "힌트를 더 받을 수 없습니다.");
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
      addAttempt({ guess, correct: res.correct });
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
        <button
          onClick={handleHint}
          disabled={hintLoading}
          className="mt-4 text-sm font-medium text-indigo-600 hover:underline disabled:opacity-50 dark:text-indigo-400"
        >
          {hintLoading ? "불러오는 중..." : "+ 힌트 추가 요청 (점수 감점)"}
        </button>
      </section>

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
          <ul className="flex flex-wrap gap-2">
            {attempts.map((a, i) => (
              <li
                key={i}
                className={`rounded-lg px-3 py-1 font-mono text-sm ${
                  a.correct
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {a.guess.join("")}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-400">
            틀린 시도는 어디가 틀렸는지 알려주지 않아요. 정답을 맞히면 전체 기록을 복기해드릴게요.
          </p>
        </section>
      )}
    </div>
  );
}
