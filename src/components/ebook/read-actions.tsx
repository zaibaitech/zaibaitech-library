"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProgress } from "@/lib/storage";

export function ReadActions({ bookId }: { bookId: string }) {
  const [lastUnitId, setLastUnitId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLastUnitId(loadProgress(bookId).lastUnitId);
    setReady(true);
  }, [bookId]);

  const start = `/books/${bookId}/read`;
  const resume = lastUnitId ? `${start}#${lastUnitId}` : start;

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <Link href={resume} className="rounded-full bg-emerald px-5 py-3 text-sm font-medium text-paper">
        {ready && lastUnitId ? "Continue" : "Start reading"}
      </Link>
      {ready && lastUnitId ? (
        <Link href={start} className="text-sm font-medium text-emerald underline decoration-gold underline-offset-4">
          Start from the beginning
        </Link>
      ) : null}
    </div>
  );
}
