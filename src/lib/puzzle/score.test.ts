import { describe, it, expect } from "vitest";
import { calculateScore } from "./score";

describe("calculateScore", () => {
  it("페널티가 없으면 자릿수 * 100", () => {
    expect(calculateScore({ digitCount: 5, extraHintsUsed: 0, wrongGuesses: 0 })).toBe(500);
  });

  it("추가 힌트와 오답 횟수만큼 감점된다", () => {
    // base 500 - (2*15) - (3*10) = 500 - 30 - 30 = 440
    expect(calculateScore({ digitCount: 5, extraHintsUsed: 2, wrongGuesses: 3 })).toBe(440);
  });

  it("점수는 최소 10점 아래로 내려가지 않는다", () => {
    expect(
      calculateScore({ digitCount: 3, extraHintsUsed: 100, wrongGuesses: 100 })
    ).toBe(10);
  });

  it("자릿수가 클수록 기본 점수가 높다", () => {
    const five = calculateScore({ digitCount: 5, extraHintsUsed: 0, wrongGuesses: 0 });
    const eight = calculateScore({ digitCount: 8, extraHintsUsed: 0, wrongGuesses: 0 });
    expect(eight).toBeGreaterThan(five);
  });
});
