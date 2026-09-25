import { create } from "zustand";
import type { AttemptReview } from "@/lib/puzzle/types";

export type ClientAttempt = { guess: number[]; correct: boolean };

/** notes[position][digit] === true 면 "아직 가능한 후보"로 표시된 상태 */
export type Notes = boolean[][];

type Phase = "setup" | "playing" | "won";

function createNotes(digitCount: number): Notes {
  return Array.from({ length: digitCount }, () => Array(10).fill(true));
}

interface GameState {
  phase: Phase;
  gameId: string | null;
  digitCount: number;
  hints: string[];
  attempts: ClientAttempt[];
  score: number | null;
  review: AttemptReview[] | null;
  notes: Notes;

  startGame: (payload: { gameId: string; digitCount: number; hints: string[] }) => void;
  addHint: (text: string) => void;
  addAttempt: (attempt: ClientAttempt) => void;
  win: (score: number, review: AttemptReview[]) => void;
  toggleNote: (position: number, digit: number) => void;
  resetNotes: () => void;
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
  notes: [],

  startGame: ({ gameId, digitCount, hints }) =>
    set({
      phase: "playing",
      gameId,
      digitCount,
      hints,
      attempts: [],
      score: null,
      review: null,
      notes: createNotes(digitCount),
    }),
  addHint: (text) => set((s) => ({ hints: [...s.hints, text] })),
  addAttempt: (attempt) => set((s) => ({ attempts: [...s.attempts, attempt] })),
  win: (score, review) => set({ phase: "won", score, review }),
  toggleNote: (position, digit) =>
    set((s) => {
      const notes = s.notes.map((row) => [...row]);
      notes[position][digit] = !notes[position][digit];
      return { notes };
    }),
  resetNotes: () => set((s) => ({ notes: createNotes(s.digitCount) })),
  reset: () =>
    set({
      phase: "setup",
      gameId: null,
      hints: [],
      attempts: [],
      score: null,
      review: null,
      notes: [],
    }),
}));
