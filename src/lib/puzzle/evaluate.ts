import type { Digits, HintSpec } from "./types";
import { digitsToNumber } from "./solver";

/** 후보 숫자 배열이 주어진 힌트 spec을 만족하는지 판정한다. */
export function evaluateHint(spec: HintSpec, digits: Digits): boolean {
  switch (spec.kind) {
    case "range":
      return digits[spec.pos] >= spec.lo && digits[spec.pos] <= spec.hi;
    case "compare":
      return digits[spec.bigger] > digits[spec.smaller];
    case "parity":
      return digits[spec.pos] % 2 === (spec.parity === "even" ? 0 : 1);
    case "sum":
      return spec.positions.reduce((a, i) => a + digits[i], 0) === spec.total;
    case "diff":
      return Math.abs(digits[spec.posA] - digits[spec.posB]) === spec.diff;
    case "multiple":
      return digitsToNumber(digits) % spec.m === 0;
    case "contains":
      return spec.included ? digits.includes(spec.digit) : !digits.includes(spec.digit);
    case "positionParity": {
      const idx = digits.indexOf(spec.digit);
      if (idx === -1) return false;
      return (idx + 1) % 2 === (spec.parity === "odd" ? 1 : 0);
    }
  }
}
