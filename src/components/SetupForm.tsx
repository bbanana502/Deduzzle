"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { ensureSession } from "@/lib/supabase/ensureSession";
import { startGame } from "@/lib/api";

export function SetupForm() {
  const [digitCount, setDigitCount] = useState(5);
  const [hintCount, setHintCount] = useState(6);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storeStart = useGameStore((s) => s.startGame);

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      await ensureSession();
      const res = await startGame({
        digitCount,
        hintCount,
        nickname: nickname.trim() || undefined,
      });
      storeStart({ gameId: res.gameId, digitCount: res.digitCount, hints: res.hints });
    } catch (e) {
      setError(e instanceof Error ? e.message : "게임을 시작하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          자릿수 (3~8)
        </label>
        <input
          type="range"
          min={3}
          max={8}
          value={digitCount}
          onChange={(e) => setDigitCount(Number(e.target.value))}
          className="w-full accent-indigo-600"
        />
        <div className="text-center text-lg font-semibold">{digitCount}자리</div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          힌트 개수 (유일한 정답에 부족하면 자동으로 채워드려요)
        </label>
        <input
          type="number"
          min={1}
          max={40}
          value={hintCount}
          onChange={(e) => setHintCount(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          닉네임 (랭킹 표시용, 선택)
        </label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          placeholder="익명"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleStart}
        disabled={loading}
        className="rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? "생성 중..." : "게임 시작"}
      </button>
    </div>
  );
}
