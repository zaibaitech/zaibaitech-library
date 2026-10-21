"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  ChevronLeft,
  Minus,
  MoreHorizontal,
  Plus,
  Search,
  X,
} from "lucide-react";
import type { Book, BookContent, Chapter } from "@/content/types";
import { glossary } from "@/content/glossary";
import { foldArabic, segmentTerms, toArabicDigits } from "@/lib/arabic";
import { cn } from "@/lib/cn";
import {
  loadBookmarks,
  loadProgress,
  saveBookmarks,
  saveProgress,
  type ReadingProgress,
} from "@/lib/storage";
import { GlossarySheet } from "../glossary-sheet";
import { LicenseNote } from "../license-note";
import { useSettings } from "../settings-provider";

function chapterIdOf(unitId: string) {
  return unitId.slice(0, unitId.lastIndexOf("."));
}

export function ReaderApp({ book, content }: { book: Book; content: BookContent }) {
  const { settings, fontSize, setFontScale, setVowelled } = useSettings();
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [bookmarks, setBookmarks] = useState<string[] | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [marksOpen, setMarksOpen] = useState(false);
  const [termId, setTermId] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [query, setQuery] = useState("");
  const articleRef = useRef<HTMLElement>(null);
  const scrolled = useRef(false);
  const progressRef = useRef<ReadingProgress | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const total = useMemo(
    () => content.chapters.reduce((sum, chapter) => sum + chapter.units.length, 0),
    [content.chapters],
  );
  const seenCount = progress?.seen.filter((id) => id.includes(".")).length ?? 0;

  useEffect(() => {
    const loaded = loadProgress(book.id);
    progressRef.current = loaded;
    setProgress(loaded);
    setBookmarks(loadBookmarks(book.id));
    setHydrated(true);
  }, [book.id]);

  useEffect(() => {
    if (!progress || scrolled.current) return;
    scrolled.current = true;
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    const id = hash || progress.lastUnitId;
    if (!id) return;
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    }, 50);
  }, [progress]);

  useEffect(() => {
    const root = articleRef.current;
    if (!root || !hydrated) return;
    const nodes = root.querySelectorAll<HTMLElement>("[data-unit]");
    let dwell: { id: string; timer: number } | null = null;
    const clearDwell = () => {
      if (!dwell) return;
      window.clearTimeout(dwell.timer);
      dwell = null;
    };
    const mark = (id: string) => {
      const current = progressRef.current;
      if (!current || (current.lastUnitId === id && current.seen.includes(id))) return;
      const next: ReadingProgress = {
        seen: current.seen.includes(id) ? current.seen : [...current.seen, id],
        lastUnitId: id,
        updatedAt: Date.now(),
      };
      progressRef.current = next;
      saveProgress(book.id, next);
      setProgress(next);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute("data-unit");
          if (!id || entry.intersectionRatio >= 0.65) continue;
          if (dwell?.id === id) clearDwell();
        }
        const visible = entries
          .filter((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.65)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = visible.target.getAttribute("data-unit");
        if (!id || dwell?.id === id) return;
        clearDwell();
        dwell = { id, timer: window.setTimeout(() => mark(id), 700) };
      },
      { threshold: [0, 0.65] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => {
      clearDwell();
      observer.disconnect();
    };
  }, [book.id, hydrated]);

  function toggleBookmark(unitId: string) {
    setBookmarks((current) => {
      const list = current ?? [];
      const next = list.includes(unitId) ? list.filter((id) => id !== unitId) : [...list, unitId];
      saveBookmarks(book.id, next);
      return next;
    });
  }

  const activeChapterId = progress?.lastUnitId ? chapterIdOf(progress.lastUnitId) : content.chapters[0]?.id;
  const results = useMemo(() => {
    const needle = foldArabic(query.trim());
    if (needle.length < 2) return [];
    return content.chapters.flatMap((chapter) =>
      chapter.units
        .filter((unit) => foldArabic(unit.arabic).includes(needle))
        .map((unit) => ({ chapter, unit })),
    );
  }, [content.chapters, query]);

  function jump(id: string) {
    setNavOpen(false);
    setSearchOpen(false);
    setMarksOpen(false);
    window.history.replaceState(null, "", `#${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)] [&>*]:min-w-0">
      <aside className="no-print hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-auto pr-2">
          <ChapterList
            chapters={content.chapters}
            activeChapterId={activeChapterId}
            seen={progress?.seen ?? []}
            onJump={jump}
          />
        </div>
      </aside>

      <div>
        <div className="no-print sticky top-16 z-30 mb-4 border-b border-line bg-paper/90 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Link
              href={`/books/${book.id}`}
              className="inline-flex min-w-0 items-center gap-1 rounded-full px-2 py-1 text-sm text-muted hover:text-ink"
            >
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span className="truncate">{book.title}</span>
            </Link>
            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <ToolbarButton label="Chapters" onClick={() => setNavOpen(true)} className="lg:hidden">
                Chapters
              </ToolbarButton>
              <ToolbarButton label="Search the book" onClick={() => setSearchOpen(true)}>
                <Search className="h-4 w-4" />
              </ToolbarButton>
              <div className="hidden items-center gap-1.5 sm:flex">
                <ReaderTools
                  fontScale={settings.fontScale}
                  vowelled={settings.vowelled}
                  bookmarkCount={bookmarks?.length ?? 0}
                  onSmaller={() => setFontScale(settings.fontScale - 1)}
                  onLarger={() => setFontScale(settings.fontScale + 1)}
                  onVowels={() => setVowelled(!settings.vowelled)}
                  onBookmarks={() => setMarksOpen(true)}
                />
              </div>
              <div className="relative sm:hidden">
                <ToolbarButton
                  label="More reader tools"
                  pressed={moreOpen}
                  onClick={() => setMoreOpen((open) => !open)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </ToolbarButton>
                {moreOpen ? (
                  <div className="absolute right-0 z-40 mt-2 flex w-56 flex-col gap-1 rounded-2xl border border-line bg-paper p-2 shadow-lift">
                    <ReaderTools
                      fontScale={settings.fontScale}
                      vowelled={settings.vowelled}
                      bookmarkCount={bookmarks?.length ?? 0}
                      onSmaller={() => setFontScale(settings.fontScale - 1)}
                      onLarger={() => setFontScale(settings.fontScale + 1)}
                      onVowels={() => setVowelled(!settings.vowelled)}
                      onBookmarks={() => {
                        setMoreOpen(false);
                        setMarksOpen(true);
                      }}
                    />
                  </div>
                ) : null}
              </div>
              <Link
                href={`/books/${book.id}/practice`}
                className="rounded-full bg-emerald px-3 py-2 text-sm font-medium text-paper"
              >
                Practice
              </Link>
            </div>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-gold"
              style={{ width: `${total ? Math.min(100, (seenCount / total) * 100) : 0}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted">
            {seenCount} of {total} lines opened on this device
          </p>
        </div>

        <article ref={articleRef} className="rounded-3xl border border-line bg-paper-2 px-4 py-6 shadow-lift sm:px-8 sm:py-10">
          <header className="mb-8 border-b border-line pb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">{book.madhhab}</p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{book.title}</h1>
            <p className="mt-3 font-amiri text-3xl text-ink" dir="rtl" lang="ar">
              {book.titleAr}
            </p>
          </header>
          {content.chapters.map((chapter, index) => {
            const previous = content.chapters[index - 1];
            const showPart = !previous || previous.partEn !== chapter.partEn;
            return (
              <section key={chapter.id} className="mt-10">
                {showPart ? (
                  <p className="mb-4 text-xs uppercase tracking-[0.22em] text-gold">
                    {chapter.partEn}
                    <span className="ms-2 font-amiri text-base normal-case tracking-normal" dir="rtl" lang="ar">
                      {chapter.partAr}
                    </span>
                  </p>
                ) : null}
                <div id={chapter.id} className="chapter-anchor">
                  <h2 className="font-display text-2xl text-ink">{chapter.headingEn}</h2>
                  <p className="mt-1 font-amiri text-2xl text-ink" dir="rtl" lang="ar">
                    {chapter.headingAr}
                  </p>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{chapter.summaryEn}</p>
                </div>
                {chapter.units.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">The chapters after this title are the prayer.</p>
                ) : (
                  <ol className="mt-6 space-y-6">
                    {chapter.units.map((unit) => {
                      const arabic =
                        settings.vowelled && unit.arabicVowelled ? unit.arabicVowelled : unit.arabic;
                      const marked = bookmarks?.includes(unit.id) ?? false;
                      return (
                        <li
                          key={unit.id}
                          id={unit.id}
                          data-unit={unit.id}
                          className="unit-anchor border-t border-line/80 pt-4"
                        >
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="font-amiri text-lg text-gold" dir="rtl" lang="ar">
                              {toArabicDigits(unit.number)}
                            </span>
                            <button
                              type="button"
                              aria-pressed={marked}
                              aria-label={marked ? "Remove bookmark" : "Bookmark this line"}
                              onClick={() => toggleBookmark(unit.id)}
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-full border border-line",
                                marked && "bg-gold text-paper",
                              )}
                            >
                              <Bookmark className={cn("h-4 w-4", marked && "fill-current")} />
                            </button>
                          </div>
                          <p className="arabic-text text-ink" dir="rtl" lang="ar" style={{ fontSize }}>
                            <ArabicLine text={arabic} onTerm={setTermId} />
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>
            );
          })}
          <div className="mt-12 border-t border-line pt-6">
            <LicenseNote />
          </div>
        </article>
      </div>

      {navOpen ? (
        <Drawer title="Chapters" onClose={() => setNavOpen(false)}>
          <ChapterList
            chapters={content.chapters}
            activeChapterId={activeChapterId}
            seen={progress?.seen ?? []}
            onJump={jump}
          />
        </Drawer>
      ) : null}

      {searchOpen ? (
        <Drawer title="Search the Arabic" onClose={() => setSearchOpen(false)}>
          <label className="block text-sm text-muted" htmlFor="book-search">
            Vowels are ignored. Two letters are enough to start.
          </label>
          <input
            id="book-search"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-ink outline-none ring-gold focus:ring-2"
            placeholder="وضوء"
            dir="rtl"
            lang="ar"
          />
          <ul className="mt-4 space-y-2">
            {query.trim().length >= 2 && results.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-muted">
                No line contains that. Try a shorter word, without vowels.
              </li>
            ) : null}
            {results.slice(0, 20).map(({ chapter, unit }) => (
              <li key={unit.id}>
                <button
                  type="button"
                  onClick={() => jump(unit.id)}
                  className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-left hover:border-gold"
                >
                  <span className="text-xs uppercase tracking-wider text-gold">{chapter.headingEn}</span>
                  <span className="mt-1 block font-amiri text-lg leading-relaxed text-ink" dir="rtl" lang="ar">
                    {unit.arabic.slice(0, 140)}
                    {unit.arabic.length > 140 ? "…" : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Drawer>
      ) : null}

      {marksOpen ? (
        <Drawer title="Bookmarks" onClose={() => setMarksOpen(false)}>
          {!bookmarks || bookmarks.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-muted">
              No marks yet. Mark a line to return to it on this device.
            </p>
          ) : (
            <ul className="space-y-2">
              {bookmarks.map((id) => {
                const found = content.chapters
                  .flatMap((chapter) => chapter.units.map((unit) => ({ chapter, unit })))
                  .find((item) => item.unit.id === id);
                if (!found) return null;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => jump(id)}
                      className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-left"
                    >
                      <span className="text-xs uppercase tracking-wider text-gold">{found.chapter.headingEn}</span>
                      <span className="mt-1 block font-amiri text-lg text-ink" dir="rtl" lang="ar">
                        {found.unit.arabic.slice(0, 120)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Drawer>
      ) : null}

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
          <button key={`${segment.termId}-${index}`} type="button" className="term" onClick={() => onTerm(segment.termId!)}>
            {segment.text}
          </button>
        ) : (
          <span key={`t-${index}`}>{segment.text}</span>
        ),
      )}
    </>
  );
}

function ChapterList({
  chapters,
  activeChapterId,
  seen,
  onJump,
}: {
  chapters: Chapter[];
  activeChapterId?: string;
  seen: string[];
  onJump: (id: string) => void;
}) {
  return (
    <nav aria-label="Chapters">
      <ol className="space-y-1">
        {chapters.map((chapter, index) => {
          const previous = chapters[index - 1];
          const showPart = !previous || previous.partEn !== chapter.partEn;
          const done = chapter.units.length > 0 && chapter.units.every((unit) => seen.includes(unit.id));
          return (
            <li key={chapter.id}>
              {showPart ? (
                <p className="mb-1 mt-4 text-[0.68rem] uppercase tracking-[0.18em] text-gold">{chapter.partEn}</p>
              ) : null}
              <button
                type="button"
                onClick={() => onJump(chapter.id)}
                aria-current={chapter.id === activeChapterId ? "true" : undefined}
                className={cn(
                  "flex w-full items-start justify-between gap-2 rounded-xl px-2 py-2 text-left text-sm",
                  chapter.id === activeChapterId ? "bg-gold-soft text-ink" : "hover:bg-gold-soft/60",
                )}
              >
                <span>
                  <span className="block font-medium">{chapter.headingEn}</span>
                  <span className="mt-0.5 block font-amiri text-base text-muted" dir="rtl" lang="ar">
                    {chapter.headingAr}
                  </span>
                </span>
                <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", done ? "bg-emerald" : "bg-line")} />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function ReaderTools({
  fontScale,
  vowelled,
  bookmarkCount,
  onSmaller,
  onLarger,
  onVowels,
  onBookmarks,
}: {
  fontScale: number;
  vowelled: boolean;
  bookmarkCount: number;
  onSmaller: () => void;
  onLarger: () => void;
  onVowels: () => void;
  onBookmarks: () => void;
}) {
  return (
    <>
      <ToolbarButton label="Smaller Arabic" onClick={onSmaller} disabled={fontScale === 0}>
        <Minus className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Larger Arabic" onClick={onLarger} disabled={fontScale === 4}>
        <Plus className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label={vowelled ? "Hide vowels" : "Show vowels"} onClick={onVowels} pressed={vowelled}>
        {vowelled ? "Vowels" : "Plain"}
      </ToolbarButton>
      <ToolbarButton label="Bookmarks" onClick={onBookmarks}>
        <Bookmark className="h-4 w-4" />
        <span className="sr-only">Bookmarks</span>
        {bookmarkCount > 0 ? <span className="text-xs">{bookmarkCount}</span> : null}
      </ToolbarButton>
    </>
  );
}

function ToolbarButton({
  children,
  label,
  onClick,
  disabled,
  pressed,
  className,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-1 rounded-full border border-line bg-paper-2 px-3 text-sm text-ink disabled:opacity-40",
        pressed && "border-gold bg-gold-soft",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Drawer({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="no-print fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-line bg-paper-2 p-5 shadow-lift">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
