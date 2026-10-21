"use client";

import { useMemo, useState } from "react";
import type { BookContent, LineWalk } from "@/content/types";
import { LicenseNote } from "../license-note";
import { SourceLine } from "./source-line";

export function LineWalkPanel({
  walk,
  bookId,
  content,
}: {
  walk: LineWalk;
  bookId: string;
  content: BookContent;
}) {
  const [index, setIndex] = useState(0);
  const step = walk.steps[index];
  const total = walk.steps.length;

  const entryButtons = useMemo(
    () =>
      walk.entries.map((entry) => ({
        ...entry,
        index: walk.steps.findIndex((item) => item.unitId === entry.unitId),
      })),
    [walk.entries, walk.steps],
  );

  if (!step) return null;

  return (
    <div>
      <p className="text-sm leading-relaxed text-muted">{walk.intro}</p>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {entryButtons.map((entry) => (
          <button
            key={entry.label}
            type="button"
            className="shrink-0 rounded-full border border-line px-3 py-1.5 text-sm"
            onClick={() => setIndex(Math.max(0, entry.index))}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-3xl border border-line bg-paper-2 p-4 sm:p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-gold">
          Line {index + 1} of {total}
        </p>
        <div className="mt-3">
          <SourceLine content={content} bookId={bookId} unitId={step.unitId} />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink">{step.pointer}</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="rounded-full border border-line px-4 py-2 text-sm disabled:opacity-40"
            disabled={index === 0}
            onClick={() => setIndex((current) => Math.max(0, current - 1))}
          >
            Previous line
          </button>
          <button
            type="button"
            className="rounded-full bg-emerald px-4 py-2 text-sm font-medium text-paper disabled:opacity-40"
            disabled={index === total - 1}
            onClick={() => setIndex((current) => Math.min(total - 1, current + 1))}
          >
            Next line
          </button>
        </div>
      </div>
      <div className="mt-4">
        <LicenseNote className="text-xs" />
      </div>
    </div>
  );
}
