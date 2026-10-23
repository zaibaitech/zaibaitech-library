"use client";

import { useEffect, useState } from "react";
import { clearBookLocalData, loadBookmarks, loadProgress } from "@/lib/storage";

/** What this device has stored for a book. `unitIds` are in reading order, so the position matches Home's "Continue reading". */
export function BookLocalActions({ bookId, unitIds }: { bookId: string; unitIds: string[] }) {
  const [seen, setSeen] = useState(0);
  const [percent, setPercent] = useState<number | null>(null);
  const [marks, setMarks] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const progress = loadProgress(bookId);
    setSeen(progress.seen.length);
    const at = progress.lastUnitId ? unitIds.indexOf(progress.lastUnitId) : -1;
    setPercent(at >= 0 ? Math.max(1, Math.round(((at + 1) / unitIds.length) * 100)) : null);
    setMarks(loadBookmarks(bookId).length);
    setReady(true);
  }, [bookId, unitIds]);

  if (!ready || (seen === 0 && marks === 0)) return null;

  return (
    <div className="text-sm text-muted">
      <p>
        {percent !== null ? `${percent}% through · ` : ""}
        {seen} of {unitIds.length} passages opened on this device
        {marks > 0 ? ` · ${marks} bookmark${marks === 1 ? "" : "s"}` : ""}
      </p>
      <button
        type="button"
        className="inline-flex min-h-11 items-center text-sm text-muted underline decoration-line-strong underline-offset-4 hover:text-ink"
        onClick={() => {
          clearBookLocalData(bookId);
          window.location.reload();
        }}
      >
        Clear my reading data on this device
      </button>
    </div>
  );
}
