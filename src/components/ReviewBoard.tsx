"use client";

import { useGameStore } from "@/store/gameStore";
import type { CellFeedback } from "@/lib/puzzle/types";

const COLORS: Record<CellFeedback, string> = {
  exact: "bg-emerald-500 text-white border-emerald-500",
  present: "bg-amber-400 text-white border-amber-400",
  absent:
    "bg-slate-200 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
};

export function ReviewBoard() {
  const score = useGameStore((s) => s.score);
  const review = useGameStore((s) => s.review);
  const reset = useGameStore((s) => s.reset);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center dark:border-indigo-900 dark:bg-indigo-950">
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">정답입니다!</p>
        <p className="text-4xl font-bold text-indigo-700 dark:text-indigo-200">{score}점</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          시도 기록 복기
        </h2>
        <div className="flex flex-col gap-2">
          {review?.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-xs text-slate-400">{i + 1}</span>
              <div className="flex gap-1">
                {r.guess.map((d, j) => (
                  <div
                    key={j}
                    className={`flex h-10 w-8 items-center justify-center rounded-md border font-mono text-sm font-semibold ${COLORS[r.feedback[j]]}`}
                  >
                    {d}
                  </div>
                ))}
              </div>
              {r.isCorrect && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  정답
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-emerald-500" /> 자리+숫자 일치
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-amber-400" /> 숫자만 포함
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-slate-200 dark:bg-slate-800" /> 불일치
          </span>
        </div>
      </div>

      <button
        onClick={reset}
        className="rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500"
      >
        새 게임 시작
      </button>
    </div>
  );
}
