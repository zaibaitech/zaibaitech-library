import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookPlate } from "@/components/book-plate";
import { Rosette } from "@/components/geometric";
import { BookLocalActions } from "@/components/book-local";
import { ReadActions } from "@/components/ebook/read-actions";
import { books, getBook } from "@/content/books";
import { getBookContent } from "@/content/library";
import { getSubject } from "@/content/subjects";
import { getPractice } from "@/content/practice";
import { authorOf } from "@/lib/library-view";
import { readableLanguages } from "@/lib/catalogue";
import { flattenUnits } from "@/lib/reading";
import { availableTranslations, pendingTranslations } from "@/lib/translations";
import { glossaryEnabled, studyToolsEnabled } from "@/lib/flags";

type Params = { id: string };

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const book = getBook(params.id);
  return {
    title: book?.title ?? "Book",
    description: book?.summary,
  };
}

export default function BookDetailPage({ params }: { params: Params }) {
  const book = getBook(params.id);
  if (!book) notFound();
  const author = authorOf(book);
  const content = book.status === "readable" ? getBookContent(book.id) : null;
  const flat = content ? flattenUnits(content) : [];
  const shown = content ? availableTranslations(book, content) : [];
  const pending = content ? pendingTranslations(book, content) : book.translations;
  const practice = studyToolsEnabled ? getPractice(book.id) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-ink">
          Library
        </Link>
        <span aria-hidden> / </span>
        <span className="text-ink">{book.title}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,16rem)_1fr]">
        <div>
          <BookPlate book={book} authorAr={author.nameAr} className="mx-auto w-full max-w-[16rem]" />
        </div>
        <div>
          <p className={content ? "text-xs font-medium text-emerald" : "text-xs font-medium text-gold"}>
            {content ? "Available to read" : "Forthcoming · text not yet available"}
          </p>
          <h1 className="mt-1 font-display text-3xl leading-tight text-ink sm:text-4xl">{book.title}</h1>
          <p className="mt-1 font-amiri text-3xl text-ink" dir="rtl" lang="ar">
            {book.titleAr}
          </p>
          <p className="mt-2 text-muted">{book.subtitle}</p>

          <dl className="mt-5 grid max-w-lg grid-cols-[7.5rem_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted">Author</dt>
            <dd className="text-ink">
              {author.name}{" "}
              <span className="font-amiri text-base" dir="rtl" lang="ar">
                ({author.nameAr})
              </span>
              {author.diedAH ? <span className="text-muted"> · d. {author.diedAH} AH</span> : null}
            </dd>
            <dt className="text-muted">Level</dt>
            <dd className="text-ink">{book.level}</dd>
            <dt className="text-muted">School</dt>
            <dd className="text-ink">{book.madhhab}</dd>
            <dt className="text-muted">Subjects</dt>
            <dd className="text-ink">{book.subjects.map((id) => getSubject(id).label).join(", ")}</dd>
            <dt className="text-muted">Reading in</dt>
            <dd className="text-ink">{readableLanguages(book, content).join(", ")}</dd>
            {content ? (
              <>
                <dt className="text-muted">Length</dt>
                <dd className="text-ink">
                  {content.chapters.length} chapters · {flat.length} numbered passages
                </dd>
              </>
            ) : null}
          </dl>

          <p className="mt-5 max-w-prose text-base leading-relaxed text-ink">{book.description}</p>

          <div className="mt-6">
            {content ? (
              <ReadActions
                bookId={book.id}
                firstUnitId={flat[0].unit.id}
                unitIds={flat.map((item) => item.unit.id)}
                legacyIds={content.legacyIds}
              />
            ) : (
              <p className="card border-dashed px-4 py-4 text-sm text-muted">
                This title is planned. Its text is not in the library, so there is nothing to read yet.
              </p>
            )}
          </div>
          {content ? (
            <div className="mt-4 max-w-lg">
              <BookLocalActions bookId={book.id} unitTotal={flat.length} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_20rem]">
        {content ? (
          <section aria-labelledby="contents-heading">
            <h2 id="contents-heading" className="font-display text-2xl text-ink">
              Contents
            </h2>
            <ol className="mt-4 grid gap-3 sm:grid-cols-2">
              {content.chapters.map((chapter, index) => (
                <li key={chapter.id}>
                  <Link
                    href={`/books/${book.id}/read#${chapter.id}`}
                    className="chapter-card group relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-gold/35 bg-paper-2 px-12 py-4 text-center hover:border-gold"
                  >
                    <Rosette className="absolute left-2 top-1/2 h-9 w-9 -translate-y-1/2 text-gold/70" />
                    <Rosette className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 text-gold/70" />
                    <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                      Chapter {index + 1}
                      {chapter.units.length > 0 ? ` · ${chapter.units.length} passages` : " · heading"}
                    </span>
                    <span className="mt-1 font-amiri text-2xl leading-snug text-emerald" dir="rtl" lang="ar">
                      {chapter.headingAr}
                    </span>
                    <span className="mt-0.5 text-sm font-medium text-ink group-hover:text-emerald">{chapter.headingEn}</span>
                    <span className="mt-1 text-xs leading-snug text-muted">{chapter.summaryEn}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <aside className="space-y-6">
          <section aria-labelledby="lang-heading" className="card p-4">
            <h2 id="lang-heading" className="text-sm font-medium text-ink">
              Languages and translations
            </h2>
            <p className="mt-2 text-sm text-ink">
              <span className="font-medium">{book.originalLanguage}</span> — original text
              {content ? "" : " (not yet in the library)"}
            </p>
            {shown.map((info) => (
              <p key={info.translationId} className="mt-1 text-sm text-ink">
                <span className="font-medium">{info.languageLabel}</span> — {info.translator}; {info.license}
              </p>
            ))}
            {shown.length === 0 ? (
              <p className="mt-2 text-sm leading-relaxed text-muted">
                No licensed translation of this book is available yet, so the library shows none. The reader is built
                to display reviewed translations beside the Arabic once one is licensed. English on this site names
                the book and its chapters and is not a translation of the text.
              </p>
            ) : null}
            {pending.length > 0 ? (
              <p className="mt-2 text-sm text-muted">
                In preparation: {pending.map((info) => info.languageLabel).join(", ")} (not yet reviewed).
              </p>
            ) : null}
          </section>

          {content ? (
            <section aria-labelledby="source-heading" className="card p-4">
              <h2 id="source-heading" className="text-sm font-medium text-ink">
                Source and licence
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted [overflow-wrap:anywhere]">
                Arabic text from OpenITI, work {content.source.openiti.replace(/^OpenITI /, "")}, licensed{" "}
                <a
                  href={content.source.licenseUrl}
                  className="font-medium text-ink underline decoration-gold/60 underline-offset-4"
                >
                  {content.source.license}
                </a>{" "}
                (attribution, non-commercial, share-alike).
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Copy errors in that witness are corrected only where evident, and each is listed in{" "}
                <Link
                  href="/about#corrections"
                  className="font-medium text-ink underline decoration-gold/60 underline-offset-4"
                >
                  the corrections record
                </Link>
                .
              </p>
            </section>
          ) : null}

          {content ? (
            <section aria-labelledby="aids-heading" className="card p-4">
              <h2 id="aids-heading" className="text-sm font-medium text-ink">
                Study aids
              </h2>
              <ul className="mt-2 space-y-2 text-sm text-muted">
                {glossaryEnabled ? (
                  <li>
                    <Link
                      href="/glossary"
                      className="font-medium text-ink underline decoration-gold/60 underline-offset-4"
                    >
                      Glossary
                    </Link>{" "}
                    — tap an underlined word in the reader for a short note.
                  </li>
                ) : null}
                {practice ? (
                  <li>
                    <Link
                      href={`/books/${book.id}/practice`}
                      className="font-medium text-ink underline decoration-gold/60 underline-offset-4"
                    >
                      Guided practice
                    </Link>
                  </li>
                ) : (
                  <li>
                    Guided practice and knowledge checks — <span className="text-gold">forthcoming</span>, once they have
                    been reviewed against the Arabic by a qualified teacher.
                  </li>
                )}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
