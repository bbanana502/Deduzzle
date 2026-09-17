import type { Digits, HintSpec } from "./types";
import { digitsToNumber } from "./solver";

const PLACE_NAMES = ["일", "십", "백", "천", "만", "십만", "백만", "천만"];

/** 왼쪽부터 index인 자리의 한국어 자리명 (예: 5자리 중 index 0 -> "만") */
function placeName(index: number, digitCount: number): string {
  const fromRight = digitCount - 1 - index;
  return `${PLACE_NAMES[fromRight]}의 자리`;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * 정답을 기준으로, 참인 힌트 후보들을 최대한 다양하게 생성한다.
 * 여기서 나온 힌트는 전부 "참"이며, engine.ts가 이 중 일부를 골라 유일성을 확보한다.
 */
export function buildHintPool(answer: Digits): HintSpec[] {
  const n = answer.length;
  const pool: HintSpec[] = [];

  // 1) 범위 힌트
  for (let i = 0; i < n; i++) {
    const v = answer[i];
    const width = randInt(2, 4);
    const lo = Math.max(0, v - randInt(0, width));
    const hi = Math.min(9, v + randInt(0, width));
    if (lo === hi) continue;
    pool.push({
      kind: "range",
      pos: i,
      lo,
      hi,
      text: `${placeName(i, n)} 숫자는 ${lo}와 ${hi} 사이에 있다.`,
    });
  }

  // 2) 대소 비교 힌트
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = answer[i];
      const b = answer[j];
      if (a === b) continue;
      const bigger = a > b ? i : j;
      const smaller = a > b ? j : i;
      pool.push({
        kind: "compare",
        bigger,
        smaller,
        text: `${placeName(bigger, n)} 숫자가 ${placeName(smaller, n)} 숫자보다 크다.`,
      });
    }
  }

  // 3) 홀짝 힌트
  for (let i = 0; i < n; i++) {
    const parity: "even" | "odd" = answer[i] % 2 === 0 ? "even" : "odd";
    pool.push({
      kind: "parity",
      pos: i,
      parity,
      text: `${placeName(i, n)} 숫자는 ${parity === "even" ? "짝수" : "홀수"}이다.`,
    });
  }

  // 4) 합 힌트: 전체 합 + 앞/뒤 절반 합
  const allIdx = Array.from({ length: n }, (_, i) => i);
  const totalSum = answer.reduce((a, b) => a + b, 0);
  pool.push({
    kind: "sum",
    positions: allIdx,
    total: totalSum,
    text: `모든 자리 숫자의 합은 ${totalSum}이다.`,
  });

  if (n >= 4) {
    const half = Math.floor(n / 2);
    const frontIdx = allIdx.slice(0, half);
    const backIdx = allIdx.slice(half);
    const frontSum = frontIdx.reduce((a, i) => a + answer[i], 0);
    const backSum = backIdx.reduce((a, i) => a + answer[i], 0);
    pool.push({
      kind: "sum",
      positions: frontIdx,
      total: frontSum,
      text: `앞 ${half}개 자리(${frontIdx.map((i) => placeName(i, n)).join(", ")}) 숫자의 합은 ${frontSum}이다.`,
    });
    pool.push({
      kind: "sum",
      positions: backIdx,
      total: backSum,
      text: `뒤 ${n - half}개 자리(${backIdx.map((i) => placeName(i, n)).join(", ")}) 숫자의 합은 ${backSum}이다.`,
    });
  }

  // 5) 두 자리 차이 힌트
  const pairs: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) pairs.push([i, j]);
  }
  for (const [i, j] of shuffle(pairs).slice(0, Math.min(4, pairs.length))) {
    const diff = Math.abs(answer[i] - answer[j]);
    pool.push({
      kind: "diff",
      posA: i,
      posB: j,
      diff,
      text: `${placeName(i, n)} 숫자와 ${placeName(j, n)} 숫자의 차이는 ${diff}이다.`,
    });
  }

  // 6) 배수 힌트: 실제로 나누어떨어지는 경우만 채택
  const value = digitsToNumber(answer);
  for (const m of [3, 4, 5, 9, 11]) {
    if (value % m === 0) {
      pool.push({
        kind: "multiple",
        m,
        text: `이 숫자 전체는 ${m}의 배수이다.`,
      });
    }
  }

  // 7) 포함/제외 힌트 (자릿수보다 작은 자리에 등장하지 않는 숫자)
  const present = new Set(answer);
  const absentDigits = Array.from({ length: 10 }, (_, d) => d).filter(
    (d) => !present.has(d)
  );
  for (const d of shuffle(absentDigits).slice(0, Math.min(3, absentDigits.length))) {
    pool.push({
      kind: "contains",
      digit: d,
      included: false,
      text: `숫자 ${d}는 포함되지 않는다.`,
    });
  }

  // 8) 특정 숫자의 위치(왼쪽에서부터 홀/짝 번째 자리) 힌트
  for (let i = 0; i < n; i++) {
    const posFromLeft1 = i + 1;
    const parity: "even" | "odd" = posFromLeft1 % 2 === 1 ? "odd" : "even";
    pool.push({
      kind: "positionParity",
      digit: answer[i],
      parity,
      text: `숫자 ${answer[i]}는 왼쪽에서부터 ${parity === "odd" ? "홀수" : "짝수"}번째 자리에 있다.`,
    });
  }

  return shuffle(pool);
}
