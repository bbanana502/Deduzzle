import type { Digits } from "./types";

/**
 * 서로 다른 숫자(0~9)로 이루어진 digitCount자리 자연수의 모든 순열을 생성한다.
 * 맨 앞자리는 0이 될 수 없다. (8자리 기준 약 181만 개, 서버 요청 1회 내에서 처리 가능한 수준)
 */
export function generateAllCandidates(digitCount: number): Digits[] {
  const results: Digits[] = [];
  const used = new Array(10).fill(false);
  const current: number[] = [];

  function backtrack() {
    if (current.length === digitCount) {
      results.push([...current]);
      return;
    }
    for (let d = 0; d <= 9; d++) {
      if (used[d]) continue;
      if (current.length === 0 && d === 0 && digitCount > 1) continue;
      used[d] = true;
      current.push(d);
      backtrack();
      current.pop();
      used[d] = false;
    }
  }

  backtrack();
  return results;
}

export function digitsToNumber(digits: Digits): number {
  return digits.reduce((acc, d) => acc * 10 + d, 0);
}

export function randomAnswer(digitCount: number): Digits {
  const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  if (pool[0] === 0 && digitCount > 1) {
    const swapIdx = pool.findIndex((d) => d !== 0);
    [pool[0], pool[swapIdx]] = [pool[swapIdx], pool[0]];
  }
  return pool.slice(0, digitCount);
}
