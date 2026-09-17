import type { AttemptReview } from "@/lib/puzzle/types";

async function handle<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? "요청에 실패했습니다.");
  return body as T;
}

export function startGame(payload: {
  digitCount: number;
  hintCount: number;
  nickname?: string;
}) {
  return fetch("/api/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) =>
    handle<{
      gameId: string;
      digitCount: number;
      hints: string[];
      minimumRequired: number;
      adjustedToMinimum: boolean;
    }>(res)
  );
}

export function requestHint(gameId: string) {
  return fetch(`/api/games/${gameId}/hint`, { method: "POST" }).then((res) =>
    handle<{ text: string }>(res)
  );
}

export function submitGuess(gameId: string, guess: number[]) {
  return fetch(`/api/games/${gameId}/guess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guess }),
  }).then((res) =>
    handle<{ correct: boolean; score?: number; review?: AttemptReview[] }>(res)
  );
}

export function fetchLeaderboard(digitCount?: number) {
  const qs = digitCount ? `?digitCount=${digitCount}` : "";
  return fetch(`/api/leaderboard${qs}`).then((res) =>
    handle<{
      entries: { nickname: string; digit_count: number; score: number; finished_at: string }[];
    }>(res)
  );
}
