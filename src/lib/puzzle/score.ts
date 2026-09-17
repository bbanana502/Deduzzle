const BASE_PER_DIGIT = 100;
const EXTRA_HINT_PENALTY = 15;
const WRONG_GUESS_PENALTY = 10;
const MIN_SCORE = 10;

export function calculateScore(params: {
  digitCount: number;
  extraHintsUsed: number;
  wrongGuesses: number;
}): number {
  const { digitCount, extraHintsUsed, wrongGuesses } = params;
  const base = digitCount * BASE_PER_DIGIT;
  const penalty = extraHintsUsed * EXTRA_HINT_PENALTY + wrongGuesses * WRONG_GUESS_PENALTY;
  return Math.max(MIN_SCORE, base - penalty);
}
