"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { getTerm } from "@/content/glossary";

export function GlossarySheet({
  termId,
  bookId,
  onClose,
}: {
  termId: string | null;
  bookId?: string;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const term = termId ? getTerm(termId) : null;

  useEffect(() => {
    if (!term) return;
    const node = panelRef.current;
    node?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, term]);

  if (!term) return null;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close glossary" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="glossary-title"
        tabIndex={-1}
        className="relative m-0 w-full max-w-lg rounded-t-3xl border border-line bg-paper-2 p-6 shadow-lift outline-none sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gold">{term.group}</p>
            <h2 id="glossary-title" className="mt-1 font-display text-2xl text-ink">
              {term.transliteration}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-4 font-amiri text-4xl leading-none text-ink" dir="rtl" lang="ar">
          {term.arabic}
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">{term.body}</p>
        {bookId && term.chapterId ? (
          <Link
            href={`/books/${bookId}/read#${term.chapterId}`}
            onClick={onClose}
            className="mt-5 inline-flex text-sm font-medium text-emerald underline decoration-gold underline-offset-4"
          >
            Open the chapter where this word is doing work
          </Link>
        ) : null}
      </div>
    </div>
  );
}
