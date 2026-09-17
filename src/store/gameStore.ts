import { create } from "zustand";
import type { AttemptReview } from "@/lib/puzzle/types";

export type ClientAttempt = { guess: number[]; correct: boolean };

type Phase = "setup" | "playing" | "won";

interface GameState {
  phase: Phase;
  gameId: string | null;
  digitCount: number;
  hints: string[];
  attempts: ClientAttempt[];
  score: number | null;
  review: AttemptReview[] | null;

  startGame: (payload: { gameId: string; digitCount: number; hints: string[] }) => void;
  addHint: (text: string) => void;
  addAttempt: (attempt: ClientAttempt) => void;
  win: (score: number, review: AttemptReview[]) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: "setup",
  gameId: null,
  digitCount: 5,
  hints: [],
  attempts: [],
  score: null,
  review: null,

  startGame: ({ gameId, digitCount, hints }) =>
    set({
      phase: "playing",
      gameId,
      digitCount,
      hints,
      attempts: [],
      score: null,
      review: null,
    }),
  addHint: (text) => set((s) => ({ hints: [...s.hints, text] })),
  addAttempt: (attempt) => set((s) => ({ attempts: [...s.attempts, attempt] })),
  win: (score, review) => set({ phase: "won", score, review }),
  reset: () =>
    set({
      phase: "setup",
      gameId: null,
      hints: [],
      attempts: [],
      score: null,
      review: null,
    }),
}));
