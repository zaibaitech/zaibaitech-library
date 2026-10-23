import Link from "next/link";
import { CircleCheck, Clock, Info } from "lucide-react";
import type { CatalogueEntry } from "@/lib/library-view";
import { BookCover } from "../book-plate";

/** A book on the home page: cover, title, status, and the action to open it. Status is stated in words, not only by colour. */
export function BookRow({ entry }: { entry: CatalogueEntry }) {
  return (
    <article
      aria-labelledby={`row-${entry.id}`}
      className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 rounded-2xl border border-line-strong bg-paper-2 p-3.5 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-5 sm:p-4"
    >
      <Link href={`/books/${entry.id}`} tabIndex={-1} aria-hidden className="block self-start">
        <BookCover book={entry.book} authorAr={entry.authorAr} />
      </Link>
      <div className="flex min-w-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 id={`row-${entry.id}`} className="min-w-0 font-display text-lg leading-snug text-ink sm:text-xl">
            {entry.title}
          </h3>
          {entry.readable ? (
            <CircleCheck className="mt-1 h-5 w-5 shrink-0 text-emerald" aria-hidden />
          ) : (
            <Clock className="mt-1 h-5 w-5 shrink-0 text-faint" aria-hidden />
          )}
        </div>
        <p className="mt-0.5 text-sm leading-snug text-muted">{entry.subtitle}</p>
        <p className="mt-1.5 text-xs text-ink-2">
          {entry.readable ? `Available · ${entry.languages.join(" & ")}` : "Forthcoming · not yet readable"}
        </p>
        {/* Wraps so the info button drops below at very large text sizes. */}
        <div className="mt-auto flex flex-wrap gap-2.5 pt-4">
          {entry.readable ? (
            <>
              <Link href={`/books/${entry.id}/read`} className="btn btn-primary min-h-12 min-w-0 flex-1 basis-28 rounded-xl px-3 text-center text-base" aria-label={`Open ${entry.title}`}>
                Open book
              </Link>
              <Link
                href={`/books/${entry.id}`}
                aria-label={`About ${entry.title}`}
                title="About this book"
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line-strong text-ink-2 transition-colors hover:border-control hover:bg-paper-3 hover:text-ink motion-reduce:transition-none"
              >
                <Info className="h-5 w-5" aria-hidden />
              </Link>
            </>
          ) : (
            <Link href={`/books/${entry.id}`} className="btn btn-quiet min-h-12 min-w-0 flex-1 rounded-xl px-3 text-center" aria-label={`About ${entry.title}`}>
              About this title
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
