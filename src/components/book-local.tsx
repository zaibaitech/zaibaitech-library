"use client";

import { useEffect, useState } from "react";
import { clearBookLocalData, loadBookmarks, loadProgress } from "@/lib/storage";

export function BookLocalActions({ bookId, unitTotal }: { bookId: string; unitTotal: number }) {
  const [seen, setSeen] = useState(0);
  const [marks, setMarks] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const progress = loadProgress(bookId);
    setSeen(progress.seen.length);
    setMarks(loadBookmarks(bookId).length);
    setReady(true);
  }, [bookId]);

  if (!ready || (seen === 0 && marks === 0)) return null;

  return (
    <div className="card p-4">
      <p className="text-sm text-muted">
        {seen} of {unitTotal} passages opened on this device
        {marks > 0 ? ` · ${marks} bookmark${marks === 1 ? "" : "s"}` : ""}
      </p>
      <button
        type="button"
        className="mt-3 text-sm font-medium text-emerald underline decoration-gold underline-offset-4"
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
