import { describe, it, expect } from "vitest";
import { generatePuzzle, computeFeedback, buildReview } from "./engine";
import { generateAllCandidates } from "./solver";
import { evaluateHint } from "./evaluate";

describe("generatePuzzle", () => {
  it.each([3, 4, 5, 6])(
    "digitCount=%i: minimumRequired개의 힌트만으로 정답이 유일하게 좁혀진다",
    (digitCount) => {
      const { answer, hints, minimumRequired } = generatePuzzle(digitCount, 1);
      const requiredHints = hints.slice(0, minimumRequired);

      const candidates = generateAllCandidates(digitCount);
      const surviving = candidates.filter((c) =>
        requiredHints.every((h) => evaluateHint(h, c))
      );

      expect(surviving).toEqual([answer]);
    }
  );

  it("요청한 힌트 개수가 최소 요구량보다 크면 보너스 힌트로 채워지고, 모든 힌트는 정답에 대해 참이다", () => {
    const digitCount = 5;
    const { answer, hints, minimumRequired } = generatePuzzle(digitCount, 20);

    expect(hints.length).toBeGreaterThanOrEqual(minimumRequired);
    for (const hint of hints) {
      expect(evaluateHint(hint, answer)).toBe(true);
    }
  });

  it("remainingPool의 힌트도 전부 정답에 대해 참이다 (거짓 힌트가 섞이지 않는다)", () => {
    const { answer, remainingPool } = generatePuzzle(5, 1);
    for (const hint of remainingPool) {
      expect(evaluateHint(hint, answer)).toBe(true);
    }
  });
});

describe("computeFeedback", () => {
  it("자리와 숫자가 모두 일치하면 exact", () => {
    expect(computeFeedback([1, 2, 3], [1, 9, 9])[0]).toBe("exact");
  });

  it("숫자는 포함되지만 자리가 다르면 present", () => {
    expect(computeFeedback([3, 2, 1], [1, 2, 3])[0]).toBe("present");
  });

  it("숫자 자체가 없으면 absent", () => {
    expect(computeFeedback([9, 2, 3], [1, 2, 3])[0]).toBe("absent");
  });
});

describe("buildReview", () => {
  it("각 시도에 대해 guess/isCorrect/feedback을 그대로 매핑한다", () => {
    const answer = [1, 2, 3];
    const attempts = [
      { guess: [3, 2, 1], isCorrect: false, createdAt: "t1" },
      { guess: [1, 2, 3], isCorrect: true, createdAt: "t2" },
    ];

    const review = buildReview(attempts, answer);

    expect(review).toHaveLength(2);
    expect(review[0].feedback).toEqual(["present", "exact", "present"]);
    expect(review[1].isCorrect).toBe(true);
    expect(review[1].feedback).toEqual(["exact", "exact", "exact"]);
  });
});
