import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reader } from "@/components/reader/reader";
import { getBook } from "@/content/books";
import { getBookContent, readableContentIds } from "@/content/library";
import { getPractice } from "@/content/practice";
import { studyToolsEnabled } from "@/lib/flags";
import { availableTranslations } from "@/lib/translations";

type Params = { id: string };

export function generateStaticParams() {
  return readableContentIds().map((id) => ({ id }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const book = getBook(params.id);
  return { title: book ? `Read ${book.title}` : "Reader" };
}

export default function ReadPage({ params }: { params: Params }) {
  const book = getBook(params.id);
  const content = getBookContent(params.id);
  if (!book || !content || book.status !== "readable") notFound();
  const practiceHref = studyToolsEnabled && getPractice(book.id) ? `/books/${book.id}/practice` : null;
  return (
    <Reader
      book={book}
      content={content}
      translations={availableTranslations(book, content)}
      practiceHref={practiceHref}
    />
  );
}
