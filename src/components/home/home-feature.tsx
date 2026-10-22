"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CatalogueEntry, ResumeIndex } from "@/lib/library-view";
import { loadRecentBooks } from "@/lib/storage";
import { BookCover } from "../book-plate";

type Resume = { bookId: string; title: string; titleAr: string; chapterEn: string; chapterAr: string; percent: number; unitId: string };

/**
 * The single feature on the home page: where this device left off, if anywhere;
 * otherwise the featured book. Rendered as the featured book on the server.
 */
export function HomeFeature({ featured, entries, index }: { featured: CatalogueEntry; entries: CatalogueEntry[]; index: ResumeIndex }) {
  const [resume, setResume] = useState<Resume | null>(null);

  useEffect(() => {
    for (const { bookId, progress } of loadRecentBooks(Object.keys(index))) {
      const at = progress.lastUnitId ? index[bookId].units[progress.lastUnitId] : undefined;
      const entry = entries.find((item) => item.id === bookId);
      if (!at || !entry) continue; // saved id no longer exists
      setResume({
        bookId,
        title: entry.title,
        titleAr: entry.titleAr,
        chapterEn: at.chapterEn,
        chapterAr: at.chapterAr,
        percent: Math.max(1, Math.round(((at.index + 1) / index[bookId].total) * 100)),
        unitId: at.id,
      });
      return;
    }
  }, [entries, index]);

  const entry = resume ? (entries.find((item) => item.id === resume.bookId) ?? featured) : featured;

  return (
    <section aria-labelledby="feature-heading" className="border-y border-line py-10 sm:py-12">
      {/* One copy of every element: on phones the details run full width under the cover and title. */}
      <div className="grid grid-cols-[104px_minmax(0,1fr)] items-start gap-x-5 gap-y-6 sm:grid-cols-[176px_minmax(0,1fr)] sm:gap-x-10">
        <Link href={`/books/${entry.id}`} tabIndex={-1} aria-hidden className="block sm:row-span-2">
          <BookCover book={entry.book} authorAr={entry.authorAr} />
        </Link>
        <div className="min-w-0 sm:self-end">
          <p id="feature-heading" className="eyebrow">
            {resume ? "Continue reading" : "Featured book"}
          </p>
          <h2 className="mt-2 font-display text-2xl leading-tight text-ink sm:text-4xl">{entry.title}</h2>
          <p className="mt-1 w-fit max-w-full font-amiri text-xl text-ink-2 sm:text-2xl" dir="rtl" lang="ar">
            {entry.titleAr}
          </p>
          <p className="mt-1 text-sm text-muted">{entry.authorName}</p>
        </div>
        <div className="col-span-2 sm:col-span-1 sm:col-start-2">
          {resume ? <ResumeDetail resume={resume} /> : <FeaturedDetail entry={entry} />}
        </div>
      </div>
    </section>
  );
}

function FeaturedDetail({ entry }: { entry: CatalogueEntry }) {
  return (
    <>
      <p className="max-w-xl text-base leading-relaxed text-ink-2">{entry.summary}</p>
      <p className="mt-3 text-sm text-muted">
        {entry.madhhab} · {entry.level} · {entry.languages.join(" & ")}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href={`/books/${entry.id}/read`} className="btn btn-primary">
          Start reading
        </Link>
        <Link href={`/books/${entry.id}`} className="link text-sm">
          About this book
        </Link>
      </div>
    </>
  );
}

function ResumeDetail({ resume }: { resume: Resume }) {
  return (
    <>
      <p className="text-base text-ink-2">
        {resume.chapterEn}{" "}
        <span className="font-amiri text-lg text-muted" dir="rtl" lang="ar">
          · {resume.chapterAr}
        </span>
      </p>
      <div className="mt-3 flex max-w-sm items-center gap-3">
        <div
          role="progressbar"
          aria-label={`Position in ${resume.title}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={resume.percent}
          className="h-[3px] flex-1 overflow-hidden rounded-full bg-line"
        >
          <div className="h-full bg-emerald" style={{ width: `${resume.percent}%` }} />
        </div>
        <span className="text-xs tabular-nums text-muted">{resume.percent}%</span>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href={`/books/${resume.bookId}/read#${resume.unitId}`} className="btn btn-primary">
          Continue reading
        </Link>
        <Link href={`/books/${resume.bookId}`} className="link text-sm">
          Contents
        </Link>
      </div>
    </>
  );
}
