"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Book, BookContent } from "@/content/types";
import { glossary } from "@/content/glossary";
import { segmentTerms } from "@/lib/arabic";
import { loadProgress, saveProgress } from "@/lib/storage";
import { GlossarySheet } from "../glossary-sheet";
import { useSettings } from "../settings-provider";

const SIZES = [
  { scale: 0, label: "Small" },
  { scale: 2, label: "Medium" },
  { scale: 4, label: "Large" },
] as const;

function nearestSize(fontScale: number) {
  return SIZES.reduce((best, size) =>
    Math.abs(size.scale - fontScale) < Math.abs(best.scale - fontScale) ? size : best,
  );
}

export function EbookReader({ book, content }: { book: Book; content: BookContent }) {
  const { settings, fontSize, setFontScale, setVowelled } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [chapterId, setChapterId] = useState(content.chapters[0]?.id ?? "");
  const [termId, setTermId] = useState<string | null>(null);
  const chapter = content.chapters.find((item) => item.id === chapterId) ?? content.chapters[0];
  const activeSize = nearestSize(settings.fontScale);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const match = content.chapters.find(
      (item) => item.id === hash || item.units.some((unit) => unit.id === hash),
    );
    if (match) setChapterId(match.id);
  }, [content.chapters]);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-unit]");
    let timer = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const top = visible[0]?.target as HTMLElement | undefined;
        if (!top?.dataset.unit) return;
        if (top.dataset.chapter) setChapterId(top.dataset.chapter);
        const unitId = top.dataset.unit;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          const progress = loadProgress(book.id);
          if (progress.lastUnitId === unitId) return;
          saveProgress(book.id, {
            seen: progress.seen,
            lastUnitId: unitId,
            updatedAt: Date.now(),
          });
        }, 500);
      },
      { rootMargin: "-56px 0px -72% 0px", threshold: 0 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [book.id]);

  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-3">
          <Link
            href={`/books/${book.id}`}
            aria-label="Back to the book"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink hover:bg-gold-soft"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{chapter?.headingEn}</p>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="text-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 shrink-0 items-center rounded-full border border-line bg-paper-2 px-3 text-sm font-medium text-ink"
          >
            Text
          </button>
        </div>
        {menuOpen ? (
          <div id="text-menu" className="mx-auto max-w-2xl px-3 pb-3">
            <div className="rounded-2xl border border-line bg-paper-2 p-3 shadow-lift">
              <p className="text-xs uppercase tracking-[0.16em] text-gold">Text size</p>
              <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Text size">
                {SIZES.map((size) => {
                  const selected = activeSize.scale === size.scale;
                  return (
                    <button
                      key={size.label}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setFontScale(size.scale)}
                      className={`rounded-xl px-2 py-2 text-sm ${
                        selected ? "bg-emerald text-paper" : "border border-line bg-paper text-ink"
                      }`}
                    >
                      {size.label}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                aria-pressed={settings.vowelled}
                onClick={() => setVowelled(!settings.vowelled)}
                className="mt-3 flex w-full items-center justify-between rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink"
              >
                <span>Vowels</span>
                <span className="font-medium text-emerald">{settings.vowelled ? "On" : "Off"}</span>
              </button>
            </div>
          </div>
        ) : null}
      </header>

      <article className="mx-auto max-w-2xl px-5 py-8">
        {content.chapters.map((item, index) => {
          const previous = content.chapters[index - 1];
          const showPart = !previous || previous.partEn !== item.partEn;
          return (
            <section key={item.id} id={item.id} className="ebook-anchor mb-12">
              {showPart && item.partAr !== item.headingAr ? (
                <p className="mb-3 text-center font-amiri text-lg text-gold" dir="rtl" lang="ar">
                  {item.partAr}
                </p>
              ) : null}
              <h2 className="mb-6 text-center font-amiri text-2xl leading-snug text-ink" dir="rtl" lang="ar">
                {item.headingAr}
              </h2>
              {item.units.map((unit) => {
                const arabic = settings.vowelled && unit.arabicVowelled ? unit.arabicVowelled : unit.arabic;
                return (
                  <p
                    key={unit.id}
                    id={unit.id}
                    data-unit={unit.id}
                    data-chapter={item.id}
                    className="ebook-anchor arabic-text mb-5 text-ink"
                    dir="rtl"
                    lang="ar"
                    style={{ fontSize }}
                  >
                    <ArabicLine text={arabic} onTerm={setTermId} />
                  </p>
                );
              })}
            </section>
          );
        })}
      </article>
      <GlossarySheet termId={termId} bookId={book.id} onClose={() => setTermId(null)} />
    </div>
  );
}

function ArabicLine({ text, onTerm }: { text: string; onTerm: (termId: string) => void }) {
  const segments = segmentTerms(text, glossary);
  return (
    <>
      {segments.map((segment, index) =>
        segment.termId ? (
          <button
            key={`${segment.termId}-${index}`}
            type="button"
            className="term"
            onClick={() => onTerm(segment.termId!)}
          >
            {segment.text}
          </button>
        ) : (
          <span key={`t-${index}`}>{segment.text}</span>
        ),
      )}
    </>
  );
}
