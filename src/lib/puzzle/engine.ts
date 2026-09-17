import type { Digits, HintSpec, AttemptReview, CellFeedback } from "./types";
import { generateAllCandidates, randomAnswer } from "./solver";
import { buildHintPool } from "./hints";
import { evaluateHint } from "./evaluate";

export const MIN_DIGITS = 3;
export const MAX_DIGITS = 8;

export interface GenerateResult {
  answer: Digits;
  /** 게임 시작 시 공개되는 힌트 */
  hints: HintSpec[];
  /** 아직 사용하지 않은 나머지 힌트 (추가 힌트 요청 시 여기서 꺼내 씀) */
  remainingPool: HintSpec[];
  /** 유일성 확보에 필요했던 최소 힌트 개수 (요청보다 컸다면 자동 보강된 것) */
  minimumRequired: number;
}

/**
 * 정답을 생성하고, 후보 풀에서 힌트를 그리디하게 골라 "유일한 정답"이 보장될 때까지 추가한다.
 * 유일성 확보 이후 요청한 힌트 개수(requestedHintCount)까지는 참인 보너스 힌트로 채운다.
 */
export function generatePuzzle(
  digitCount: number,
  requestedHintCount: number
): GenerateResult {
  const answer = randomAnswer(digitCount);
  const pool = buildHintPool(answer);

  let candidates = generateAllCandidates(digitCount);
  const selected: HintSpec[] = [];
  const remaining = [...pool];

  const SAMPLE_SIZE = 25;

  while (candidates.length > 1 && remaining.length > 0) {
    const sample = remaining.slice(0, SAMPLE_SIZE);
    let bestIdx = 0;
    let bestCount = Infinity;
    for (let k = 0; k < sample.length; k++) {
      const count = candidates.reduce(
        (acc, c) => acc + (evaluateHint(sample[k], c) ? 1 : 0),
        0
      );
      if (count < bestCount) {
        bestCount = count;
        bestIdx = k;
      }
    }
    const chosen = sample[bestIdx];
    const poolIdx = remaining.indexOf(chosen);
    remaining.splice(poolIdx, 1);
    candidates = candidates.filter((c) => evaluateHint(chosen, c));
    selected.push(chosen);
  }

  const minimumRequired = selected.length;

  // 유일성 확보 후, 사용자가 요청한 힌트 개수까지 "참인 보너스 힌트"로 채운다.
  while (selected.length < requestedHintCount && remaining.length > 0) {
    selected.push(remaining.shift()!);
  }

  return { answer, hints: selected, remainingPool: remaining, minimumRequired };
}

/** 게임 진행 중 "힌트 추가 요청" 시, 남은 풀에서 하나를 꺼내 준다. */
export function drawExtraHint(remainingPool: HintSpec[]): {
  hint: HintSpec | null;
  remainingPool: HintSpec[];
} {
  if (remainingPool.length === 0) return { hint: null, remainingPool };
  const [hint, ...rest] = remainingPool;
  return { hint, remainingPool: rest };
}

export function computeFeedback(guess: Digits, answer: Digits): CellFeedback[] {
  const answerSet = new Set(answer);
  return guess.map((g, i) => {
    if (answer[i] === g) return "exact";
    if (answerSet.has(g)) return "present";
    return "absent";
  });
}

export function buildReview(
  attempts: { guess: Digits; isCorrect: boolean; createdAt: string }[],
  answer: Digits
): AttemptReview[] {
  return attempts.map((a) => ({
    guess: a.guess,
    isCorrect: a.isCorrect,
    createdAt: a.createdAt,
    feedback: computeFeedback(a.guess, answer),
  }));
}
