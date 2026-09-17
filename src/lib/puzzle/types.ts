export type Digits = number[];

/**
 * 힌트는 DB에 JSON으로 저장/복원 가능하도록 순수 데이터(spec)로 표현한다.
 * 실제 판정 로직은 evaluate.ts의 evaluateHint()가 담당한다.
 */
export type HintSpec =
  | { kind: "range"; text: string; pos: number; lo: number; hi: number }
  | { kind: "compare"; text: string; bigger: number; smaller: number }
  | { kind: "parity"; text: string; pos: number; parity: "even" | "odd" }
  | { kind: "sum"; text: string; positions: number[]; total: number }
  | { kind: "diff"; text: string; posA: number; posB: number; diff: number }
  | { kind: "multiple"; text: string; m: number }
  | { kind: "contains"; text: string; digit: number; included: boolean }
  | { kind: "positionParity"; text: string; digit: number; parity: "even" | "odd" };

export interface Attempt {
  guess: Digits;
  isCorrect: boolean;
  createdAt: string;
}

/** 정답 공개 후 자리별 복기용 피드백 */
export type CellFeedback = "exact" | "present" | "absent";

export interface AttemptReview {
  guess: Digits;
  feedback: CellFeedback[];
  isCorrect: boolean;
  createdAt: string;
}

export interface GameConfig {
  digitCount: number;
  /** 플레이어가 원하는 목표 힌트 개수 (유일성 확보에 더 필요하면 자동 보강) */
  requestedHintCount: number;
}

export interface GeneratedPuzzle {
  answer: Digits;
  hints: HintSpec[];
}
