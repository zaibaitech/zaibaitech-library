import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookPlate } from "@/components/book-plate";
import { ReadActions } from "@/components/ebook/read-actions";
import { LicenseNote } from "@/components/license-note";
import { books, getBook } from "@/content/books";
import { getBookContent } from "@/content/library";
import { studyToolsEnabled } from "@/lib/flags";
import { getPractice } from "@/content/practice";

type Params = { id: string };

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const book = getBook(params.id);
  return {
    title: book?.title ?? "Book",
    description: book?.description,
  };
}

export default function BookDetailPage({ params }: { params: Params }) {
  const book = getBook(params.id);
  if (!book) notFound();
  const content = book.status === "readable" ? getBookContent(book.id) : null;
  const practice = studyToolsEnabled ? getPractice(book.id) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <BookPlate book={book} compact className="max-w-[220px]" />
      <h1 className="mt-5 font-display text-3xl leading-tight text-ink">{book.title}</h1>
      <p className="mt-1 font-amiri text-2xl text-ink" dir="rtl" lang="ar">
        {book.titleAr}
      </p>
      <p className="mt-2 text-muted">{book.author}</p>
      <p className="mt-4 text-base leading-relaxed text-ink">
        A short manual of worship on the school of Imam Malik: what a person owes, then purification, then the prayer.
        The Arabic inside is the book.
      </p>
      {book.status === "readable" && content ? (
        <ReadActions bookId={book.id} />
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-line px-4 py-4 text-sm text-muted">
          This title is on the shelf so the library has a next book. Its text is not loaded.
        </p>
      )}
      {practice ? (
        <Link href={`/books/${book.id}/practice`} className="mt-3 inline-flex text-sm font-medium text-emerald">
          Practice
        </Link>
      ) : null}
      {content ? (
        <div className="mt-5">
          <LicenseNote />
        </div>
      ) : null}
      {content ? (
        <div className="mt-8">
          <h2 className="font-display text-2xl text-ink">Contents</h2>
          <ol className="mt-3 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-paper-2">
            {content.chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <Link
                  href={`/books/${book.id}/read#${chapter.id}`}
                  className="flex items-baseline gap-3 px-4 py-3 hover:bg-gold-soft/50"
                >
                  <span className="w-6 shrink-0 text-sm text-muted">{index + 1}</span>
                  <span className="min-w-0">
                    <span className="block font-medium text-ink">{chapter.headingEn}</span>
                    <span className="mt-0.5 block font-amiri text-lg leading-snug text-muted" dir="rtl" lang="ar">
                      {chapter.headingAr}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
