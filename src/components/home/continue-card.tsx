"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CatalogueEntry, ResumeIndex } from "@/lib/library-view";
import { loadRecentBooks } from "@/lib/storage";
import { BookCover } from "../book-plate";

type Resume = { entry: CatalogueEntry; chapterEn: string; chapterAr: string; percent: number; unitId: string };

/** Where this device left off. Renders nothing until a saved position is found, so the server output stays the same. */
export function ContinueCard({ entries, index }: { entries: CatalogueEntry[]; index: ResumeIndex }) {
  const [resume, setResume] = useState<Resume | null>(null);

  useEffect(() => {
    for (const { bookId, progress } of loadRecentBooks(Object.keys(index))) {
      const at = progress.lastUnitId ? index[bookId].units[progress.lastUnitId] : undefined;
      const entry = entries.find((item) => item.id === bookId);
      if (!at || !entry) continue; // saved id no longer exists
      setResume({
        entry,
        chapterEn: at.chapterEn,
        chapterAr: at.chapterAr,
        percent: Math.max(1, Math.round(((at.index + 1) / index[bookId].total) * 100)),
        unitId: at.id,
      });
      return;
    }
  }, [entries, index]);

  if (!resume) return null;
  const { entry } = resume;

  return (
    <section aria-labelledby="continue-heading" className="mt-10">
      <h2 id="continue-heading" className="font-display text-2xl text-ink [font-variant-caps:small-caps] sm:text-3xl">
        Continue reading
      </h2>
      <div className="mt-4 grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-line-strong bg-paper-2 p-3.5 sm:grid-cols-[80px_minmax(0,1fr)_auto] sm:gap-5 sm:p-4">
        <Link href={`/books/${entry.id}`} tabIndex={-1} aria-hidden className="block">
          <BookCover book={entry.book} authorAr={entry.authorAr} />
        </Link>
        <div className="min-w-0">
          <p className="font-display text-lg leading-snug text-ink">{entry.title}</p>
          <p className="mt-0.5 truncate text-sm text-muted">
            {resume.chapterEn}{" "}
            <span className="font-amiri text-base" dir="rtl" lang="ar">
              · {resume.chapterAr}
            </span>
          </p>
          <div className="mt-2.5 flex items-center gap-3">
            <div
              role="progressbar"
              aria-label={`Position in ${entry.title}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={resume.percent}
              className="h-1 flex-1 overflow-hidden rounded-full bg-line"
            >
              <div className="h-full rounded-full bg-gold" style={{ width: `${resume.percent}%` }} />
            </div>
            <span className="text-xs tabular-nums text-muted">{resume.percent}%</span>
          </div>
        </div>
        <Link
          href={`/books/${entry.id}/read#${resume.unitId}`}
          className="btn btn-primary col-span-2 h-12 rounded-xl text-base sm:col-span-1"
        >
          Continue reading
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
