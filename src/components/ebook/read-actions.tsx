"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProgress } from "@/lib/storage";

export function ReadActions({
  bookId,
  firstUnitId,
  unitIds,
  legacyIds = {},
}: {
  bookId: string;
  firstUnitId: string;
  /** Every passage id in the book, used to ignore saved positions that no longer exist. */
  unitIds: string[];
  /** Earlier passage ids mapped to the passages that now hold them. */
  legacyIds?: Record<string, string>;
}) {
  const [lastUnitId, setLastUnitId] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadProgress(bookId).lastUnitId;
    const saved = stored ? (legacyIds[stored] ?? stored) : null;
    setLastUnitId(saved && unitIds.includes(saved) ? saved : null);
  }, [bookId, unitIds, legacyIds]);

  const base = `/books/${bookId}/read`;
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {lastUnitId ? (
        <>
          <Link href={`${base}#${lastUnitId}`} className="btn btn-primary">
            Continue reading
          </Link>
          <Link href={`${base}#${firstUnitId}`} className="link inline-flex min-h-11 items-center text-sm">
            Start from the beginning
          </Link>
        </>
      ) : (
        <Link href={base} className="btn btn-primary">
          Start reading
        </Link>
      )}
    </div>
  );
}
