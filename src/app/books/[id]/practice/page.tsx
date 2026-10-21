import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PracticeApp } from "@/components/practice/practice-app";
import { getBook } from "@/content/books";
import { getBookContent } from "@/content/library";
import { getPractice, practiceBookIds } from "@/content/practice";
import { studyToolsEnabled } from "@/lib/flags";

type Params = { id: string };

export function generateStaticParams() {
  return practiceBookIds().map((id) => ({ id }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const book = getBook(params.id);
  return { title: book ? `Practice ${book.title}` : "Practice" };
}

export default function PracticePage({ params }: { params: Params }) {
  const book = getBook(params.id);
  const content = getBookContent(params.id);
  const practice = getPractice(params.id);
  if (!studyToolsEnabled || !book || !content || !practice || book.status !== "readable") notFound();

  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-muted">Opening practice…</div>}>
      <PracticeApp book={book} content={content} practice={practice} />
    </Suspense>
  );
}
