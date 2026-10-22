import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GeometricBackdrop, Rosette } from "@/components/geometric";
import { BookRow } from "@/components/home/book-row";
import { ContinueCard } from "@/components/home/continue-card";
import { catalogueEntries, resumeIndex } from "@/lib/library-view";

const FEATURED_ID = "akhdari";

export default function HomePage() {
  const entries = catalogueEntries();
  const featured = entries.find((entry) => entry.id === FEATURED_ID && entry.readable) ?? entries.find((e) => e.readable);
  const hasTranslation = entries.some((entry) => entry.readable && entry.languages.length > 1);
  // Readable titles first; forthcoming ones keep their catalogue order after them.
  const shelf = [...entries.filter((e) => e.readable), ...entries.filter((e) => !e.readable)];

  return (
    <div className="mx-auto max-w-page px-4 pb-8 pt-4 sm:px-8 sm:pt-8">
      {/* Kept compact on phones so "The books" and the first card show without scrolling. */}
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden rounded-3xl border border-line-strong bg-paper-2 px-5 py-5 sm:px-10 sm:py-9 lg:px-12 lg:py-10"
      >
        <GeometricBackdrop className="absolute inset-0 h-full w-full text-gold opacity-[0.06]" />
        <Rosette className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 text-gold opacity-[0.12] sm:h-44 sm:w-44" />
        <div className="relative">
          <p className="eyebrow">{hasTranslation ? "Arabic & English" : "Fully vowelled Arabic"}</p>
          <h1
            id="hero-heading"
            className="mt-1.5 font-display text-[1.75rem] leading-tight tracking-tight text-ink [font-variant-caps:small-caps] sm:mt-2 sm:text-5xl"
          >
            Read. Study. Reflect.
          </h1>
          <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-ink-2 sm:mt-3 sm:text-lg">
            Classical Islamic texts in fully vowelled Arabic{hasTranslation ? ", with English translations where available" : ""}.
          </p>
          {featured ? (
            <Link
              href={`/books/${featured.id}/read`}
              className="btn btn-primary mt-4 h-11 rounded-full px-5 sm:mt-6 sm:h-12 sm:px-6 sm:text-base"
              aria-label={`Start reading ${featured.title}`}
            >
              Start reading
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </div>
      </section>

      <ContinueCard entries={entries} index={resumeIndex()} />

      <section aria-labelledby="books-heading" className="mt-7 sm:mt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="books-heading" className="font-display text-2xl text-ink [font-variant-caps:small-caps] sm:text-3xl">
            The books
          </h2>
          <Link href="/library" className="inline-flex min-h-11 items-center gap-1.5 text-base font-medium text-emerald hover:underline hover:underline-offset-4">
            See all
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted sm:mt-2 sm:text-base">
          The manuals in the library. Open one to read it, or see what is planned next.
        </p>
        <ul className="mt-4 grid gap-4 sm:mt-6 lg:grid-cols-2">
          {shelf.map((entry) => (
            <li key={entry.id}>
              <BookRow entry={entry} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
