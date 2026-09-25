"use client";

import { useRef, useState, type KeyboardEvent } from "react";

export function GuessInput({
  length,
  onSubmit,
  disabled,
}: {
  length: number;
  onSubmit: (guess: number[]) => void;
  disabled?: boolean;
}) {
  const [values, setValues] = useState<string[]>(() => Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  function updateValue(idx: number, raw: string) {
    const digit = raw.replace(/[^0-9]/g, "").slice(-1);
    const next = [...values];
    next[idx] = digit;
    setValues(next);
    if (digit && idx < length - 1) inputsRef.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !values[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "Enter") trySubmit();
  }

  function trySubmit() {
    if (disabled || values.some((v) => v === "")) return;
    onSubmit(values.map(Number));
    setValues(Array(length).fill(""));
    inputsRef.current[0]?.focus();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
        {values.map((v, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            value={v}
            disabled={disabled}
            onChange={(e) => updateValue(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            inputMode="numeric"
            maxLength={1}
            className="h-10 w-8 rounded-lg border border-slate-300 text-center text-lg font-semibold focus:border-indigo-500 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 sm:h-12 sm:w-10 sm:text-xl"
          />
        ))}
      </div>
      <button
        onClick={trySubmit}
        disabled={disabled || values.some((v) => v === "")}
        className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-40"
      >
        제출
      </button>
    </div>
  );
}
