import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reader } from "@/components/reader/reader";
import { getBook } from "@/content/books";
import { getReadableContent, readableContentIds } from "@/content/library";
import { isProse } from "@/content/types";
import { getPractice } from "@/content/practice";
import { studyToolsEnabled } from "@/lib/flags";
import { availableTranslations, publicContent } from "@/lib/translations";

type Params = { id: string };

export function generateStaticParams() {
  return readableContentIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const book = getBook(id);
  return { title: book ? `Read ${book.title}` : "Reader" };
}

export default async function ReadPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const book = getBook(id);
  const content = getReadableContent(id);
  if (!book || !content || book.status !== "readable") notFound();
  if (isProse(content)) {
    // An English book: its own text, with no translations to gate.
    return <Reader book={book} content={content} translations={[]} practiceHref={null} />;
  }
  const practiceHref = studyToolsEnabled && getPractice(book.id) ? `/books/${book.id}/practice` : null;
  return (
    <Reader
      book={book}
      content={publicContent(book, content)}
      translations={availableTranslations(book, content)}
      practiceHref={practiceHref}
    />
  );
}
