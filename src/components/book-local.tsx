"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clearBookLocalData, loadBookmarks, loadProgress } from "@/lib/storage";

export function BookLocalActions({ bookId, unitTotal }: { bookId: string; unitTotal: number }) {
  const [seen, setSeen] = useState(0);
  const [lastUnitId, setLastUnitId] = useState<string | null>(null);
  const [marks, setMarks] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const progress = loadProgress(bookId);
    setSeen(progress.seen.length);
    setLastUnitId(progress.lastUnitId);
    setMarks(loadBookmarks(bookId).length);
    setReady(true);
  }, [bookId]);

  if (!ready || (seen === 0 && marks === 0)) return null;

  return (
    <div className="rounded-2xl border border-line bg-paper-2 p-4">
      <p className="text-sm text-muted">
        {seen} of {unitTotal} lines opened
        {marks > 0 ? ` · ${marks} bookmark${marks === 1 ? "" : "s"}` : ""}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {lastUnitId ? (
          <Link
            href={`/books/${bookId}/read#${lastUnitId}`}
            className="rounded-full bg-emerald px-4 py-2 text-sm font-medium text-paper"
          >
            Continue reading
          </Link>
        ) : null}
        <button
          type="button"
          className="rounded-full border border-line px-4 py-2 text-sm"
          onClick={() => {
            clearBookLocalData(bookId);
            setSeen(0);
            setMarks(0);
            setLastUnitId(null);
          }}
        >
          Clear reading data on this device
        </button>
      </div>
    </div>
  );
}
