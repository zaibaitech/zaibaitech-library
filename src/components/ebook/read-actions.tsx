"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProgress } from "@/lib/storage";

export function ReadActions({
  bookId,
  firstUnitId,
  unitIds,
}: {
  bookId: string;
  firstUnitId: string;
  /** Every passage id in the book, used to ignore saved positions that no longer exist. */
  unitIds: string[];
}) {
  const [lastUnitId, setLastUnitId] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadProgress(bookId).lastUnitId;
    setLastUnitId(saved && unitIds.includes(saved) ? saved : null);
  }, [bookId, unitIds]);

  const base = `/books/${bookId}/read`;
  return (
    <div className="flex flex-wrap items-center gap-3">
      {lastUnitId ? (
        <>
          <Link href={`${base}#${lastUnitId}`} className="btn btn-primary">
            Continue reading
          </Link>
          <Link href={`${base}#${firstUnitId}`} className="btn btn-quiet">
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
