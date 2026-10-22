import Link from "next/link";
import { BookPlate } from "@/components/book-plate";
import { Catalogue } from "@/components/catalogue";
import { ContinueReading } from "@/components/continue-reading";
import { catalogueEntries, resumeIndex } from "@/lib/library-view";

const FEATURED_ID = "akhdari";

export default function HomePage() {
  const entries = catalogueEntries();
  const featured = entries.find((entry) => entry.id === FEATURED_ID && entry.readable);
  const index = resumeIndex();

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:pt-14">
        <p className="eyebrow">Zaibaitech Library</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight text-ink sm:text-5xl">
          Classical Islamic texts, made easier to study.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          A reading room for foundational manuals, with large, fully vowelled Arabic, clear chapters, and your place
          saved on this device. Built for those still growing into Arabic.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {featured ? (
            <Link href={`/books/${featured.id}/read`} className="btn btn-primary">
              Start with {featured.title}
            </Link>
          ) : null}
          <a href="#catalogue" className="btn btn-quiet">
            Browse the library
          </a>
        </div>
      </section>

      <ContinueReading index={index} />

      {featured ? (
        <section aria-labelledby="featured-heading" className="mx-auto max-w-6xl px-4 pt-12">
          <h2 id="featured-heading" className="eyebrow">
            Featured book
          </h2>
          <div className="card mt-3 grid gap-6 p-4 sm:p-6 md:grid-cols-[minmax(0,17rem)_1fr] md:items-center">
            <BookPlate book={featured.book} authorAr={featured.authorAr} className="mx-auto w-full max-w-[17rem]" />
            <div>
              <h3 className="font-display text-3xl text-ink">{featured.title}</h3>
              <p className="mt-1 font-amiri text-2xl text-ink" dir="rtl" lang="ar">
                {featured.titleAr}
              </p>
              <p className="mt-2 text-sm text-muted">by {featured.authorName}</p>
              <p className="mt-4 text-base leading-relaxed text-ink">{featured.summary}</p>
              <dl className="mt-4 grid max-w-md grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <dt className="text-muted">Level</dt>
                <dd className="text-ink">{featured.level}</dd>
                <dt className="text-muted">School</dt>
                <dd className="text-ink">{featured.madhhab}</dd>
                <dt className="text-muted">Subjects</dt>
                <dd className="text-ink">{featured.subjects.map((s) => s.label).join(", ")}</dd>
                <dt className="text-muted">Reading in</dt>
                <dd className="text-ink">{featured.languages.join(", ")}</dd>
              </dl>
              {featured.languages.length === 1 ? (
                <p className="mt-3 text-sm text-muted">No licensed English translation is available yet.</p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/books/${featured.id}/read`} className="btn btn-primary">
                  Read in Arabic
                </Link>
                <Link href={`/books/${featured.id}`} className="btn btn-quiet">
                  Book details
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <Catalogue entries={entries} />
    </div>
  );
}
