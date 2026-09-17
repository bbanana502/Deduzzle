"use client";

import { useEffect, useState } from "react";
import { fetchLeaderboard } from "@/lib/api";

type Entry = { nickname: string; digit_count: number; score: number; finished_at: string };

export function Leaderboard({ digitCount }: { digitCount?: number }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchLeaderboard(digitCount)
      .then((res) => {
        if (active) setEntries(res.entries);
      })
      .catch(() => {
        if (active) setEntries([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [digitCount]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        랭킹 {digitCount ? `(${digitCount}자리)` : "(전체)"}
      </h2>
      {loading ? (
        <p className="text-sm text-slate-400">불러오는 중...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-slate-400">아직 기록이 없어요.</p>
      ) : (
        <ol className="flex flex-col gap-1 text-sm">
          {entries.map((e, i) => (
            <li key={i} className="flex justify-between">
              <span>
                {i + 1}. {e.nickname}{" "}
                <span className="text-slate-400">({e.digit_count}자리)</span>
              </span>
              <span className="font-semibold">{e.score}점</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
