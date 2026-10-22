import { Rosette } from "../geometric";
import { toArabicDigits } from "@/lib/arabic";

/** The ornamented heading that opens each chapter in the reader. */
export function ChapterBanner({
  id,
  index,
  headingAr,
  headingEn,
  partAr,
}: {
  id: string;
  index: number;
  headingAr: string;
  headingEn: string;
  /** Shown above the banner when a new part of the book begins. */
  partAr?: string;
}) {
  return (
    <div className="mb-6">
      {partAr ? (
        <p className="mb-3 flex items-center justify-center gap-3 font-amiri text-xl text-gold" dir="rtl" lang="ar">
          <span aria-hidden className="h-px w-10 bg-gold/50" />
          {partAr}
          <span aria-hidden className="h-px w-10 bg-gold/50" />
        </p>
      ) : null}
      <header className="chapter-banner relative overflow-hidden rounded-2xl px-14 py-5 text-center sm:px-20">
        <Rosette className="chapter-banner-ornament absolute left-2 top-1/2 h-11 w-11 -translate-y-1/2 sm:left-4 sm:h-14 sm:w-14" />
        <Rosette className="chapter-banner-ornament absolute right-2 top-1/2 h-11 w-11 -translate-y-1/2 sm:right-4 sm:h-14 sm:w-14" />
        <p className="chapter-banner-sub text-[0.68rem] uppercase tracking-[0.22em]">
          Chapter {index} · <span lang="ar">{toArabicDigits(index)}</span>
        </p>
        <h2 id={id} className="mt-1 font-amiri text-3xl leading-snug sm:text-4xl" dir="rtl" lang="ar">
          {headingAr}
        </h2>
        <p className="chapter-banner-sub mt-1 text-sm font-medium">{headingEn}</p>
      </header>
    </div>
  );
}
