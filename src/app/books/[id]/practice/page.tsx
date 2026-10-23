import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PracticeApp } from "@/components/practice/practice-app";
import { getBook } from "@/content/books";
import { getBookContent } from "@/content/library";
import { getPractice, practiceBookIds } from "@/content/practice";
import { studyToolsEnabled } from "@/lib/flags";
import { publicContent } from "@/lib/translations";

type Params = { id: string };

export function generateStaticParams() {
  return practiceBookIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const book = getBook(id);
  return { title: book ? `Practice ${book.title}` : "Practice" };
}

export default async function PracticePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const book = getBook(id);
  const content = getBookContent(id);
  const practice = getPractice(id);
  if (!studyToolsEnabled || !book || !content || !practice || book.status !== "readable") notFound();

  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-muted">Opening practice…</div>}>
      <PracticeApp book={book} content={publicContent(book, content)} practice={practice} />
    </Suspense>
  );
}
