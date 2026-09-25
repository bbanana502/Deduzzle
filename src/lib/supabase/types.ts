import type { Digits, HintSpec } from "../puzzle/types";

export interface GameRow {
  id: string;
  user_id: string;
  nickname: string;
  digit_count: number;
  difficulty: "easy" | "hard";
  answer: Digits;
  hints: HintSpec[];
  remaining_pool: HintSpec[];
  extra_hints_used: number;
  wrong_guesses: number;
  status: "playing" | "won";
  score: number | null;
  created_at: string;
  finished_at: string | null;
}

export interface AttemptRow {
  id: string;
  game_id: string;
  guess: Digits;
  is_correct: boolean;
  created_at: string;
}
