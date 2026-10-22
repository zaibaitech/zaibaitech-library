"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadRecentBooks } from "@/lib/storage";
import type { ResumeIndex } from "@/lib/library-view";

type Item = {
  bookId: string;
  title: string;
  chapterEn: string;
  chapterAr: string;
  percent: number;
  lastUnitId: string;
};

export function ContinueReading({ index }: { index: ResumeIndex }) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const found: Item[] = [];
    for (const { bookId, progress } of loadRecentBooks(Object.keys(index))) {
      const entry = index[bookId];
      const at = progress.lastUnitId ? entry.units[progress.lastUnitId] : undefined;
      if (!at) continue; // saved id no longer exists in the book
      found.push({
        bookId,
        title: entry.title,
        chapterEn: at.chapterEn,
        chapterAr: at.chapterAr,
        percent: Math.round(((at.index + 1) / entry.total) * 100),
        lastUnitId: progress.lastUnitId!,
      });
    }
    setItems(found);
  }, [index]);

  if (items.length === 0) return null;
  const [latest, ...rest] = items;

  return (
    <section aria-labelledby="continue-heading" className="mx-auto max-w-6xl px-4 pt-8">
      <h2 id="continue-heading" className="eyebrow">
        Continue reading
      </h2>
      <div className="card mt-3 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-display text-xl text-ink">{latest.title}</p>
          <p className="mt-1 text-sm text-muted">
            You were in <span className="font-medium text-ink">{latest.chapterEn}</span>{" "}
            <span className="font-amiri text-base" dir="rtl" lang="ar">
              ({latest.chapterAr})
            </span>
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div
              role="progressbar"
              aria-label={`Position in ${latest.title}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={latest.percent}
              className="h-1.5 w-40 max-w-full overflow-hidden rounded-full bg-line"
            >
              <div className="h-full bg-emerald" style={{ width: `${latest.percent}%` }} />
            </div>
            <span className="text-xs text-muted">{latest.percent}% through the book</span>
          </div>
        </div>
        <Link href={`/books/${latest.bookId}/read#${latest.lastUnitId}`} className="btn btn-primary shrink-0">
          Continue reading
        </Link>
      </div>
      {rest.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-ink">Recently opened</h3>
          <ul className="mt-2 divide-y divide-line rounded-2xl border border-line bg-paper-2">
            {rest.map((item) => (
              <li key={item.bookId}>
                <Link
                  href={`/books/${item.bookId}/read#${item.lastUnitId}`}
                  className="flex min-h-12 items-center justify-between gap-3 px-4 py-2 text-sm hover:bg-gold-soft/50"
                >
                  <span className="font-medium text-ink">{item.title}</span>
                  <span className="text-muted">{item.chapterEn}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
