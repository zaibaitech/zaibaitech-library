import { Rosette } from "../geometric";

/** An understated chapter opening: a small ornament, the number, the Arabic heading, then its English. */
export function ChapterHeading({
  id,
  index,
  headingAr,
  headingEn,
  partAr,
  partEn,
  translatedHeading,
}: {
  id: string;
  index: number;
  headingAr: string;
  headingEn: string;
  /** Shown when a new part of the book begins. */
  partAr?: string;
  partEn?: string;
  /** The translation's rendering of the heading, shown instead of the short English label. */
  translatedHeading?: string | null;
}) {
  return (
    <header className="mb-10 text-center">
      {partAr ? (
        <p className="mb-8 flex items-center justify-center gap-3 text-gold">
          <span aria-hidden className="h-px w-8 bg-gold/40" />
          <span className="eyebrow">{partEn}</span>
          <span className="font-amiri text-lg" dir="rtl" lang="ar">
            {partAr}
          </span>
          <span aria-hidden className="h-px w-8 bg-gold/40" />
        </p>
      ) : null}
      <Rosette className="mx-auto h-5 w-5 text-gold/80" />
      <p className="mt-3 text-[0.68rem] uppercase tracking-[0.2em] text-muted">Chapter {index}</p>
      <h2 id={id} className="mt-2 font-amiri text-[1.9rem] leading-snug text-ink sm:text-[2.2rem]" dir="rtl" lang="ar">
        {headingAr}
      </h2>
      <p className="mx-auto mt-1 max-w-md font-display text-base italic leading-snug text-muted">{translatedHeading ?? headingEn}</p>
    </header>
  );
}
