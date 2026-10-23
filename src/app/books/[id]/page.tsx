import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock } from "lucide-react";
import { BookCover } from "@/components/book-plate";
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
import { toArabicDigits } from "@/lib/arabic";
import { longDate } from "@/lib/dates";
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
  const languages = readableLanguages(book, content);

  return (
    <div className="mx-auto max-w-page px-5 pb-8 pt-8 sm:px-8 sm:pt-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/library" className="-my-3 inline-flex min-h-11 items-center hover:text-ink">
              Library
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li aria-current="page" className="text-ink-2">
            {book.title}
          </li>
        </ol>
      </nav>

      <header className="mt-8 grid gap-8 sm:grid-cols-[12rem_1fr] sm:gap-12 lg:grid-cols-[15rem_1fr]">
        <div className="mx-auto w-40 sm:mx-0 sm:w-full">
          <BookCover book={book} authorAr={author.nameAr} />
        </div>
        <div className="min-w-0">
          {content ? null : (
            <p className="mb-5 flex items-start gap-2 rounded-md border border-line-strong bg-paper-3 px-4 py-3 text-sm text-ink-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                <span className="font-medium text-ink">Forthcoming.</span> This title is planned. Its text is not in the
                library yet, so there is nothing to read.
              </span>
            </p>
          )}
          <h1 className="font-display text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">{book.title}</h1>
          <p className="mt-2 w-fit max-w-full font-amiri text-3xl text-ink-2" dir="rtl" lang="ar">
            {book.titleAr}
          </p>
          <p className="mt-3 text-base text-muted">
            {author.name}
            {author.diedAH ? <span className="text-faint"> · d. {author.diedAH} AH</span> : null}
          </p>
          <p className="mt-6 max-w-reading text-base leading-relaxed text-ink-2">{book.description}</p>
          {content ? (
            <div className="mt-8">
              <ReadActions
                bookId={book.id}
                firstUnitId={flat[0].unit.id}
                unitIds={flat.map((item) => item.unit.id)}
                legacyIds={content.legacyIds}
              />
              <div className="mt-4 max-w-reading">
                <BookLocalActions bookId={book.id} unitIds={flat.map((item) => item.unit.id)} />
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        {content ? (
          <section aria-labelledby="contents-heading" className="min-w-0">
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <h2 id="contents-heading" className="font-display text-2xl text-ink">
                Contents
              </h2>
              <p className="text-sm text-muted">
                {content.chapters.length} chapters · {flat.length} passages
              </p>
            </div>
            <ol>
              {content.chapters.map((chapter, index) => (
                <li key={chapter.id} className="border-b border-line">
                  <Link
                    href={`/books/${book.id}/read#${chapter.id}`}
                    className="group grid grid-cols-[2rem_1fr] gap-x-3 py-4 sm:grid-cols-[2.5rem_1fr_auto] sm:items-baseline sm:gap-x-4"
                  >
                    <span className="pt-0.5 text-sm tabular-nums text-faint">{index + 1}</span>
                    <span className="min-w-0">
                      <span className="block text-base font-medium text-ink group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4">
                        {chapter.headingEn}
                      </span>
                      <span className="mt-0.5 block text-sm leading-snug text-muted">{chapter.summaryEn}</span>
                    </span>
                    <span
                      className="col-start-2 mt-1 font-amiri text-lg leading-snug text-ink-2 sm:col-start-3 sm:mt-0 sm:text-right"
                      dir="rtl"
                      lang="ar"
                    >
                      {chapter.headingAr}
                      <span className="sr-only">, </span>
                      <span className="ms-2 text-sm text-faint" aria-hidden>
                        {toArabicDigits(index + 1)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <aside aria-labelledby="details-heading" className={content ? "" : "lg:col-start-1"}>
          <h2 id="details-heading" className="border-b border-line pb-3 font-display text-2xl text-ink">
            About this edition
          </h2>
          <dl className="text-sm">
            <Row label="Author">
              {author.name}{" "}
              <span className="font-amiri text-base text-muted" dir="rtl" lang="ar">
                {author.nameAr}
              </span>
              {author.diedAH ? (
                <span className="block text-faint">
                  d. {author.diedAH} AH{author.datingSource ? ` — ${author.datingSource}` : ""}
                </span>
              ) : null}
            </Row>
            <Row label="School">{book.madhhab}</Row>
            <Row label="Level">{book.level}</Row>
            <Row label="Subjects">{book.subjects.map((id) => getSubject(id).label).join(", ")}</Row>
            <Row label="Languages">
              {languages.join(", ")}
              {content ? null : <span className="block text-faint">Original language; not yet in the library</span>}
            </Row>
            {shown.map((info) => (
              <Row key={info.translationId} label={`${info.languageLabel} translation`}>
                {info.translator}
                {info.licenseUrl ? (
                  <>
                    {" · "}
                    <a href={info.licenseUrl} className="link -my-3 inline-flex min-h-11 items-center font-normal">
                      {info.license}
                    </a>
                  </>
                ) : (
                  ` · ${info.license}`
                )}
                {info.review ? (
                  <span className="block text-faint">Reviewed for publication, {longDate(info.review.reviewedOn)}</span>
                ) : null}
              </Row>
            ))}
            {content && shown.length === 0 ? (
              <Row label="Translation">
                <span className="text-muted">None published yet. The reader shows the Arabic alone.</span>
              </Row>
            ) : null}
            {pending.length > 0 ? (
              <Row label="In preparation">
                <span className="text-muted">
                  {pending.map((info) => info.languageLabel).join(", ")}, not yet reviewed
                </span>
              </Row>
            ) : null}
            {content ? (
              <>
                <Row label="Arabic source">
                  <span className="[overflow-wrap:anywhere]">{content.source.openiti.replace(/^OpenITI /, "OpenITI ")}</span>
                </Row>
                <Row label="Licence">
                  <a href={content.source.licenseUrl} className="link -my-3 inline-flex min-h-11 items-center font-normal">
                    {content.source.license}
                  </a>
                  <span className="block text-faint">Attribution, non-commercial, share-alike</span>
                </Row>
                <Row label="Corrections">
                  <Link href="/about#corrections" className="link -my-3 inline-flex min-h-11 items-center font-normal">
                    Listed on Sources
                  </Link>
                </Row>
              </>
            ) : null}
          </dl>

          {content ? (
            <div className="mt-10">
              <h2 className="border-b border-line pb-3 font-display text-xl text-ink">Study aids</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {glossaryEnabled ? (
                  <li>
                    <Link href="/glossary" className="link py-[13px]">
                      Glossary
                    </Link>{" "}
                    — tap an underlined Arabic word in the reader for a short note.
                  </li>
                ) : null}
                <li>
                  {practice ? (
                    <Link href={`/books/${book.id}/practice`} className="link">
                      Guided practice
                    </Link>
                  ) : (
                    <>Guided practice and knowledge checks are forthcoming, after review against the Arabic by a qualified teacher.</>
                  )}
                </li>
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] gap-x-4 border-b border-line py-3">
      <dt className="text-muted [overflow-wrap:anywhere]">{label}</dt>
      <dd className="min-w-0 text-ink [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}
