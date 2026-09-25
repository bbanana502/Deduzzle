"use client";

import { useGameStore } from "@/store/gameStore";

const PLACE_NAMES = ["일", "십", "백", "천", "만", "십만", "백만", "천만"];

function placeName(index: number, digitCount: number): string {
  return PLACE_NAMES[digitCount - 1 - index];
}

export function NotesGrid() {
  const digitCount = useGameStore((s) => s.digitCount);
  const notes = useGameStore((s) => s.notes);
  const toggleNote = useGameStore((s) => s.toggleNote);
  const resetNotes = useGameStore((s) => s.resetNotes);
  const freeNotes = useGameStore((s) => s.freeNotes);
  const setFreeNotes = useGameStore((s) => s.setFreeNotes);

  if (notes.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          메모장 (자리별 가능한 숫자)
        </h2>
        <button
          onClick={resetNotes}
          className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          초기화
        </button>
      </div>
      <p className="mb-3 text-xs text-slate-400">
        아니라고 추론한 숫자를 눌러서 지워보세요.
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {notes.map((row, pos) => (
          <div key={pos} className="flex flex-shrink-0 flex-col items-center gap-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {placeName(pos, digitCount)}
            </span>
            <div className="grid grid-cols-2 gap-0.5 rounded-lg bg-slate-50 p-1 dark:bg-slate-800">
              {row.map((possible, digit) => (
                <button
                  key={digit}
                  onClick={() => toggleNote(pos, digit)}
                  aria-pressed={!possible}
                  className={`flex h-6 w-6 items-center justify-center rounded font-mono text-[11px] transition ${
                    possible
                      ? "bg-white text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200"
                      : "text-slate-300 line-through dark:text-slate-600"
                  }`}
                >
                  {digit}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
        <label className="mb-2 block text-xs font-medium text-slate-500 dark:text-slate-400">
          자유 메모 (추론 과정을 마음껏 적어두세요)
        </label>
        <textarea
          value={freeNotes}
          onChange={(e) => setFreeNotes(e.target.value)}
          rows={4}
          placeholder="예) 천의 자리 - 십의 자리 = 8 이니까 (8,0) 또는 (9,1)..."
          className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        />
      </div>
    </section>
  );
}
