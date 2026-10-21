import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EbookReader } from "@/components/ebook/ebook-reader";
import { ReaderApp } from "@/components/reader/reader-app";
import { getBook } from "@/content/books";
import { getBookContent, readableContentIds } from "@/content/library";
import { studyToolsEnabled } from "@/lib/flags";

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
  if (studyToolsEnabled) return <ReaderApp book={book} content={content} />;
  return <EbookReader book={book} content={content} />;
}
