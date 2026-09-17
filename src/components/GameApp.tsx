"use client";

import { useGameStore } from "@/store/gameStore";
import { SetupForm } from "./SetupForm";
import { PlayScreen } from "./PlayScreen";
import { ReviewBoard } from "./ReviewBoard";
import { Leaderboard } from "./Leaderboard";

export function GameApp() {
  const phase = useGameStore((s) => s.phase);
  const digitCount = useGameStore((s) => s.digitCount);

  return (
    <div className="flex flex-col gap-8 px-4 py-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Deduzzle
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          트라이얼이 아니라 논리로 숨겨진 숫자를 추리하세요.
        </p>
      </header>

      {phase === "setup" && <SetupForm />}
      {phase === "playing" && <PlayScreen />}
      {phase === "won" && <ReviewBoard />}

      <div className="mx-auto w-full max-w-xl">
        <Leaderboard digitCount={phase === "setup" ? undefined : digitCount} />
      </div>
    </div>
  );
}
