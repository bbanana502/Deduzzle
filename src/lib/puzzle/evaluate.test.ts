import { describe, it, expect } from "vitest";
import { evaluateHint } from "./evaluate";
import type { HintSpec } from "./types";

describe("evaluateHint", () => {
  it("range: 자리 숫자가 범위 안에 있으면 true", () => {
    const spec: HintSpec = { kind: "range", text: "", pos: 1, lo: 2, hi: 5 };
    expect(evaluateHint(spec, [9, 3, 0, 0])).toBe(true);
    expect(evaluateHint(spec, [9, 6, 0, 0])).toBe(false);
  });

  it("compare: 지정된 자리가 실제로 더 커야 true", () => {
    const spec: HintSpec = { kind: "compare", text: "", bigger: 0, smaller: 1 };
    expect(evaluateHint(spec, [5, 3])).toBe(true);
    expect(evaluateHint(spec, [3, 5])).toBe(false);
    expect(evaluateHint(spec, [5, 5])).toBe(false);
  });

  it("parity: 짝/홀 판정", () => {
    const even: HintSpec = { kind: "parity", text: "", pos: 0, parity: "even" };
    expect(evaluateHint(even, [4])).toBe(true);
    expect(evaluateHint(even, [3])).toBe(false);
    const odd: HintSpec = { kind: "parity", text: "", pos: 0, parity: "odd" };
    expect(evaluateHint(odd, [3])).toBe(true);
  });

  it("sum: 지정된 자리들의 합이 정확히 일치해야 true", () => {
    const spec: HintSpec = { kind: "sum", text: "", positions: [0, 2], total: 9 };
    expect(evaluateHint(spec, [4, 9, 5, 1])).toBe(true);
    expect(evaluateHint(spec, [4, 9, 6, 1])).toBe(false);
  });

  it("diff: 두 자리 차이의 절댓값이 일치해야 true", () => {
    const spec: HintSpec = { kind: "diff", text: "", posA: 0, posB: 1, diff: 3 };
    expect(evaluateHint(spec, [7, 4])).toBe(true);
    expect(evaluateHint(spec, [4, 7])).toBe(true);
    expect(evaluateHint(spec, [4, 4])).toBe(false);
  });

  it("multiple: 전체 숫자가 배수여야 true", () => {
    const spec: HintSpec = { kind: "multiple", text: "", m: 3 };
    expect(evaluateHint(spec, [1, 2])).toBe(true); // 12 % 3 === 0
    expect(evaluateHint(spec, [1, 3])).toBe(false); // 13 % 3 !== 0
  });

  it("contains: included true/false 각각 정확히 판정", () => {
    const included: HintSpec = { kind: "contains", text: "", digit: 5, included: true };
    expect(evaluateHint(included, [1, 5, 3])).toBe(true);
    expect(evaluateHint(included, [1, 2, 3])).toBe(false);

    const excluded: HintSpec = { kind: "contains", text: "", digit: 5, included: false };
    expect(evaluateHint(excluded, [1, 2, 3])).toBe(true);
    expect(evaluateHint(excluded, [1, 5, 3])).toBe(false);
  });

  it("positionParity: 숫자가 없으면 false, 있으면 그 자리(1-indexed)의 홀짝으로 판정", () => {
    const spec: HintSpec = { kind: "positionParity", text: "", digit: 7, parity: "odd" };
    // 7 is at index 0 -> 1-indexed position 1 -> odd
    expect(evaluateHint(spec, [7, 2, 3])).toBe(true);
    // 7 is at index 1 -> 1-indexed position 2 -> even, not odd
    expect(evaluateHint(spec, [2, 7, 3])).toBe(false);
    // 7 not present at all
    expect(evaluateHint(spec, [2, 3, 4])).toBe(false);
  });
});
