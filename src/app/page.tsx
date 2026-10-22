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
    <div className="mx-auto max-w-page px-4 pb-8 pt-6 sm:px-8 sm:pt-10">
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden rounded-3xl border border-line-strong bg-paper-2 px-6 py-8 sm:px-12 sm:py-14"
      >
        <GeometricBackdrop className="absolute inset-0 h-full w-full text-gold opacity-[0.09]" />
        <Rosette className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 text-gold opacity-[0.16] sm:h-64 sm:w-64" />
        <div className="relative">
          <p className="eyebrow leading-relaxed">
            Classical texts · {hasTranslation ? "Arabic & English" : "Fully vowelled Arabic"} · Careful reading
          </p>
          <h1
            id="hero-heading"
            className="mt-4 max-w-2xl font-display text-[2.1rem] leading-[1.1] tracking-tight text-ink [font-variant-caps:small-caps] sm:text-6xl"
          >
            Read the text.
            <br />
            Understand the meaning.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-2 sm:text-lg">
            Foundational manuals of Islamic law in fully vowelled Arabic
            {hasTranslation ? ", with a reviewed English translation where one has been published" : ""}. Your place is kept
            on this device.
          </p>
          {featured ? (
            <Link
              href={`/books/${featured.id}/read`}
              className="btn btn-primary mt-7 h-14 rounded-full px-7 text-base shadow-lift"
              aria-label={`Start reading ${featured.title}`}
            >
              Start reading
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          ) : null}
        </div>
      </section>

      <ContinueCard entries={entries} index={resumeIndex()} />

      <section aria-labelledby="books-heading" className="mt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="books-heading" className="font-display text-2xl text-ink [font-variant-caps:small-caps] sm:text-3xl">
            The books
          </h2>
          <Link href="/library" className="inline-flex min-h-11 items-center gap-1.5 text-base font-medium text-emerald hover:underline hover:underline-offset-4">
            See all
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <p className="mt-2 max-w-xl text-base leading-relaxed text-muted">
          The manuals in the library. Open one to read it, or see what is planned next.
        </p>
        <ul className="mt-6 grid gap-4 lg:grid-cols-2">
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
