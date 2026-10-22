"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bookmark, ChevronLeft, ChevronRight, List, Minus, Moon, Plus, Search, Sun } from "lucide-react";
import type { Book, BookContent, TranslationInfo } from "@/content/types";
import { glossary } from "@/content/glossary";
import { segmentTerms, toArabicDigits } from "@/lib/arabic";
import { cn } from "@/lib/cn";
import { glossaryEnabled } from "@/lib/flags";
import { flattenUnits, positionFraction, resolveTarget } from "@/lib/reading";
import {
  FONT_SCALES,
  TRANSLATION_SCALES,
  loadBookmarks,
  loadProgress,
  saveBookmarks,
  saveProgress,
} from "@/lib/storage";
import { modeKey, modeOptions, parseModeKey, resolveMode, translationText } from "@/lib/translations";
import { GlossarySheet } from "../glossary-sheet";
import { useSettings } from "../settings-provider";
import { ChapterBanner } from "./chapter-banner";
import { ReaderSheet, type SheetTab } from "./reader-sheet";

type Props = {
  book: Book;
  content: BookContent;
  /** Verified translations that have text. Empty when the book has none to show. */
  translations: TranslationInfo[];
  practiceHref: string | null;
};

/** The passage or chapter id in the URL hash, or "" when absent or malformed. */
function currentHash() {
  try {
    return decodeURIComponent(window.location.hash.replace(/^#/, ""));
  } catch {
    return "";
  }
}

export function Reader({ book, content, translations, practiceHref }: Props) {
  const {
    settings,
    resolved,
    ready,
    fontSize,
    translationFontSize,
    setFontScale,
    setTranslationScale,
    setVowelled,
    setMode,
    setTheme,
  } = useSettings();

  const flat = useMemo(() => flattenUnits(content), [content]);
  const mode = resolveMode(parseModeKey(settings.mode), translations);
  const info = mode.kind === "arabic" ? null : translations.find((t) => t.translationId === mode.translationId) ?? null;
  const showArabic = mode.kind !== "translation";
  const showTranslation = mode.kind !== "arabic";
  const options = modeOptions(translations);

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [sheet, setSheet] = useState<SheetTab | null>(null);
  const [termId, setTermId] = useState<string | null>(null);
  const [headerHidden, setHeaderHidden] = useState(false);

  const tracking = useRef(false);
  const commitRef = useRef<(() => void) | null>(null);
  const lastSaved = useRef<string | null>(null);
  const restored = useRef(false);

  const current = flat.find((item) => item.unit.id === currentId) ?? null;
  const activeChapter = current?.chapter ?? content.chapters[0];
  const percent = Math.round(positionFraction(content, currentId) * 100);

  /* Bookmarks live on this device. */
  useEffect(() => {
    const known = new Set(flat.map((item) => item.unit.id));
    setBookmarks(loadBookmarks(book.id).filter((id) => known.has(id)));
  }, [book.id, flat]);

  const toggleBookmark = useCallback(
    (unitId: string) => {
      setBookmarks((list) => {
        const next = list.includes(unitId) ? list.filter((id) => id !== unitId) : [...list, unitId];
        saveBookmarks(book.id, next);
        return next;
      });
    },
    [book.id],
  );

  /* Scroll to a passage or chapter by id. */
  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ block: "start", behavior: "instant" });
    return true;
  }, []);

  /* Jump from the panel: push a history entry so Back returns to where the reader was. */
  const jump = useCallback(
    (id: string) => {
      setSheet(null);
      window.history.pushState(null, "", `#${id}`);
      // wait for the panel to unlock page scrolling
      window.requestAnimationFrame(() => scrollToId(id));
    },
    [scrollToId],
  );

  /* Restore position once settings (and so font sizes) are applied. A URL hash always wins. */
  useEffect(() => {
    if (!ready || restored.current) return;
    restored.current = true;
    const hash = currentHash();
    const saved = loadProgress(book.id).lastUnitId;
    const hashValid = resolveTarget(content, hash) !== null || content.chapters.some((c) => c.id === hash);
    // An unknown or stale hash must not cost the reader their saved place.
    const targetId = hashValid ? hash : (resolveTarget(content, saved)?.unit.id ?? null);
    lastSaved.current = saved;

    let userMoved = false;
    const mark = () => {
      userMoved = true;
    };
    window.addEventListener("wheel", mark, { passive: true });
    window.addEventListener("touchmove", mark, { passive: true });
    window.addEventListener("keydown", mark);

    const place = () => {
      if (targetId && !userMoved) scrollToId(targetId);
    };
    window.requestAnimationFrame(() => {
      place();
      // fonts and size changes can shift layout, so settle once more
      document.fonts?.ready.then(() => window.requestAnimationFrame(place));
      window.setTimeout(() => {
        tracking.current = true;
        commitRef.current?.(); // record where the reader landed, even if they never scroll
      }, 400);
    });
    return () => {
      window.removeEventListener("wheel", mark);
      window.removeEventListener("touchmove", mark);
      window.removeEventListener("keydown", mark);
    };
  }, [ready, book.id, content, scrollToId]);

  /* Track the passage at the top of the page; save it; keep the URL hash in step (replace, not push). */
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-unit]");
    const visible = new Set<string>();
    const order = new Map(flat.map((item, i) => [item.unit.id, i]));
    let timer = 0;
    let top: string | null = null;
    const commit = () => {
      if (!top || lastSaved.current === top) return;
      lastSaved.current = top;
      const progress = loadProgress(book.id);
      saveProgress(book.id, {
        seen: progress.seen.includes(top) ? progress.seen : [...progress.seen, top],
        lastUnitId: top,
        updatedAt: Date.now(),
      });
      window.history.replaceState(window.history.state, "", `#${top}`);
    };
    commitRef.current = commit;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.unit!;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        if (visible.size === 0) return;
        top = Array.from(visible).sort((a, b) => order.get(a)! - order.get(b)!)[0];
        setCurrentId(top);
        if (!tracking.current) return;
        window.clearTimeout(timer);
        timer = window.setTimeout(commit, 400);
      },
      { rootMargin: "-130px 0px -60% 0px", threshold: 0 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      commitRef.current = null;
    };
  }, [book.id, flat, mode.kind]);

  /*
   * Back and Forward between passages. Next's router owns popstate and the
   * browser does not scroll to the fragment for these entries, so do it here.
   */
  useEffect(() => {
    const onPop = () => {
      const id = currentHash();
      if (!id) return;
      window.requestAnimationFrame(() => scrollToId(id));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [scrollToId]);

  /* Hide the toolbar while reading down; show it on any upward scroll. */
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY + 10 && y > 160) setHeaderHidden(true);
      else if (y < lastY - 10 || y < 160) setHeaderHidden(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const stepArabic = (delta: number) => setFontScale(settings.fontScale + delta);
  const stepTranslation = (delta: number) => setTranslationScale(settings.translationScale + delta);
  const closeSheet = useCallback(() => setSheet(null), []);
  const wide = mode.kind === "both";

  return (
    <div>
      <header
        className={cn(
          "sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-md transition-transform duration-200 motion-reduce:transition-none",
          headerHidden && "-translate-y-full focus-within:translate-y-0",
        )}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-1.5 px-2 pt-1.5 lg:max-w-6xl">
          <Link href={`/books/${book.id}`} aria-label={`Back to ${book.title}`} className="tool-btn shrink-0 !px-0">
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => setSheet("contents")}
            aria-haspopup="dialog"
            aria-label={`Contents. Now reading: ${activeChapter?.headingEn}`}
            className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full px-3 text-left hover:bg-gold-soft/50"
          >
            <List className="h-4 w-4 shrink-0 text-gold" aria-hidden />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-medium text-ink">{activeChapter?.headingEn}</span>
              <span className="block truncate text-[0.7rem] text-muted">{current ? `${percent}% through the book` : book.title}</span>
            </span>
          </button>
          <button type="button" className="tool-btn shrink-0 !px-0" aria-label="Search this book" onClick={() => setSheet("search")}>
            <Search className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className="tool-btn shrink-0 !px-0"
            aria-label={resolved === "dark" ? "Switch to light reading theme" : "Switch to dark reading theme"}
            onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
          >
            {resolved === "dark" ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
          </button>
          <button
            type="button"
            className="tool-btn relative shrink-0 !px-0"
            aria-label={`Bookmarks, ${bookmarks.length} saved`}
            onClick={() => setSheet("bookmarks")}
          >
            <Bookmark className="h-4 w-4" aria-hidden />
            {bookmarks.length > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.65rem] text-paper">
                {bookmarks.length}
              </span>
            ) : null}
          </button>
        </div>

        <div
          role="toolbar"
          aria-label="Reading display"
          className="mx-auto flex max-w-2xl flex-wrap items-center gap-1.5 px-2 pb-1.5 pt-1 lg:max-w-6xl"
        >
          <div role="group" aria-label="Arabic text size" className="flex items-center gap-1">
            <button
              type="button"
              className="tool-btn !px-0"
              aria-label="Smaller Arabic text"
              disabled={settings.fontScale <= 0}
              onClick={() => stepArabic(-1)}
            >
              <Minus className="h-4 w-4" aria-hidden />
              <span className="sr-only">Smaller</span>
            </button>
            <span className="font-amiri text-lg text-ink" aria-hidden title="Arabic text size">
              ع
            </span>
            <button
              type="button"
              className="tool-btn !px-0"
              aria-label="Larger Arabic text"
              disabled={settings.fontScale >= FONT_SCALES.length - 1}
              onClick={() => stepArabic(1)}
            >
              <Plus className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {translations.length > 0 && showTranslation ? (
            <div role="group" aria-label={`${info?.languageLabel ?? "Translation"} text size`} className="flex items-center gap-1">
              <button
                type="button"
                className="tool-btn !px-0"
                aria-label="Smaller translation text"
                disabled={settings.translationScale <= 0}
                onClick={() => stepTranslation(-1)}
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <span className="text-sm font-medium text-ink" aria-hidden title="Translation text size">
                Aa
              </span>
              <button
                type="button"
                className="tool-btn !px-0"
                aria-label="Larger translation text"
                disabled={settings.translationScale >= TRANSLATION_SCALES.length - 1}
                onClick={() => stepTranslation(1)}
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : null}

          <button
            type="button"
            className="tool-btn"
            aria-pressed={settings.vowelled}
            title="Show or hide vowel marks (tashkīl)"
            onClick={() => setVowelled(!settings.vowelled)}
          >
            Tashkīl
          </button>

          <label className="sr-only" htmlFor="reading-mode">
            Reading mode
          </label>
          <select
            id="reading-mode"
            value={modeKey(mode)}
            onChange={(event) => setMode(event.target.value)}
            className="h-11 min-w-0 max-w-[9.5rem] flex-1 rounded-full border border-line bg-paper-2 px-3 text-sm text-ink"
          >
            {options.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
            {translations.length === 0 ? (
              <option value="none" disabled>
                Translation: none yet
              </option>
            ) : null}
          </select>

        </div>
        <div
          role="progressbar"
          aria-label="Position in the book"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-0.5 bg-line"
        >
          <div className="h-full bg-emerald" style={{ width: `${percent}%` }} />
        </div>
      </header>

      <article className={cn("mx-auto px-5 pb-24 pt-8", wide ? "max-w-2xl lg:max-w-6xl" : "max-w-2xl")}>
        <div className="mb-10 text-center">
          <h1 className="font-amiri text-3xl leading-snug text-ink" lang="ar" dir="rtl">
            {book.titleAr}
          </h1>
          <p className="mt-1 text-sm text-muted">{book.title}</p>
        </div>

        {translations.length === 0 ? (
          <p className="card mb-10 px-4 py-3 text-sm leading-relaxed text-muted">
            <span className="font-medium text-ink">Arabic only.</span> No licensed translation of this book is
            available yet, so none is shown. English in the headings names chapters; it is not a translation.{" "}
            <Link href={`/books/${book.id}`} className="font-medium text-ink underline decoration-gold/60 underline-offset-4">
              Languages and sources
            </Link>
          </p>
        ) : info ? (
          <p className="card mb-10 px-4 py-3 text-sm leading-relaxed text-muted">
            {info.languageLabel} translation by {info.translator}. Source: {info.source}. Licence: {info.license}.
          </p>
        ) : null}

        {content.chapters.map((chapter, ci) => {
          const previous = content.chapters[ci - 1];
          const next = content.chapters[ci + 1];
          const showPart = !previous || previous.partEn !== chapter.partEn;
          return (
            <section key={chapter.id} id={chapter.id} aria-labelledby={`${chapter.id}-h`} className="ebook-anchor mb-14">
              <ChapterBanner
                id={`${chapter.id}-h`}
                index={ci + 1}
                headingAr={chapter.headingAr}
                headingEn={chapter.headingEn}
                partAr={showPart && chapter.partAr !== chapter.headingAr ? chapter.partAr : undefined}
              />

              {chapter.units.map((unit) => {
                const arabic = settings.vowelled && unit.arabicVowelled ? unit.arabicVowelled : unit.arabic;
                const text = info ? translationText(unit, info.translationId) : null;
                const marked = bookmarks.includes(unit.id);
                return (
                  <div key={unit.id} id={unit.id} data-unit={unit.id} className="ebook-anchor card mb-4 overflow-hidden">
                    <div className="flex items-center justify-between gap-2 px-3 pt-2 sm:px-4">
                      <a
                        href={`#${unit.id}`}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-gold/40 bg-gold-soft/40 px-2.5 text-xs text-ink hover:border-gold"
                        aria-label={`Link to ${chapter.headingEn}, passage ${unit.number}`}
                      >
                        <span lang="ar" className="font-amiri text-sm leading-none">{toArabicDigits(unit.number)}</span>
                        <span className="text-muted">{unit.number}</span>
                      </a>
                      <button
                        type="button"
                        className={cn("tool-btn !h-11 !w-11 !px-0", !marked && "!border-transparent !bg-transparent")}
                        aria-pressed={marked}
                        aria-label={`Bookmark ${chapter.headingEn}, passage ${unit.number}`}
                        onClick={() => toggleBookmark(unit.id)}
                      >
                        <Bookmark className={cn("h-4 w-4", marked && "fill-current")} aria-hidden />
                      </button>
                    </div>
                    <div className={cn(wide && "lg:flex lg:flex-row-reverse lg:items-stretch")}>
                      {showArabic || !text ? (
                        <p
                          className={cn("arabic-text px-4 pb-3 text-ink sm:px-5", wide && "lg:w-1/2")}
                          dir="rtl"
                          lang="ar"
                          style={{ fontSize }}
                        >
                          <ArabicLine text={arabic} onTerm={setTermId} />
                        </p>
                      ) : null}
                      {showTranslation ? (
                        <>
                          {showArabic ? (
                            <div aria-hidden className={cn("passage-rule mx-4", wide && "lg:mx-0 lg:my-4 lg:h-auto lg:w-0.5 lg:bg-gold/40 lg:bg-none")} />
                          ) : null}
                          <div className={cn("px-4 py-3 sm:px-5", wide && "lg:w-1/2")}>
                            {text ? (
                              <p className="translation-text text-ink" lang={info?.language} style={{ fontSize: translationFontSize }}>
                                {text}
                              </p>
                            ) : (
                              <p className="text-sm italic text-muted">
                                {showArabic
                                  ? "No translation available for this passage."
                                  : "Not yet translated. The Arabic is shown above."}
                              </p>
                            )}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              <nav aria-label={`After ${chapter.headingEn}`} className="mt-6 flex items-center justify-between gap-3 text-sm">
                {previous ? (
                  <a href={`#${previous.id}`} className="btn btn-quiet !px-3">
                    <ChevronLeft className="h-4 w-4" aria-hidden /> {previous.headingEn}
                  </a>
                ) : (
                  <span />
                )}
                {next ? (
                  <a href={`#${next.id}`} className="btn btn-quiet !px-3">
                    {next.headingEn} <ChevronRight className="h-4 w-4" aria-hidden />
                  </a>
                ) : (
                  <span />
                )}
              </nav>
            </section>
          );
        })}

        <footer className="border-t border-line pt-6 text-sm leading-relaxed text-muted [overflow-wrap:anywhere]">
          <p>
            Arabic text from OpenITI, {content.source.license} ({content.source.openiti.replace(/^OpenITI /, "")}). Evident
            copy errors are corrected and listed on the{" "}
            <Link href="/about#corrections" className="font-medium text-ink underline decoration-gold/60 underline-offset-4">
              sources page
            </Link>
            .
          </p>
          <p className="mt-3">
            <Link href={`/books/${book.id}`} className="font-medium text-ink underline decoration-gold/60 underline-offset-4">
              Back to the book page
            </Link>
          </p>
        </footer>
      </article>

      {sheet ? (
        <ReaderSheet
          tab={sheet}
          onTab={setSheet}
          onClose={closeSheet}
          content={content}
          activeChapterId={activeChapter?.id}
          bookmarks={bookmarks}
          onToggleBookmark={toggleBookmark}
          onJump={jump}
          translationId={info?.translationId}
          practiceHref={practiceHref}
        />
      ) : null}
      {glossaryEnabled ? <GlossarySheet termId={termId} bookId={book.id} onClose={() => setTermId(null)} /> : null}
    </div>
  );
}

function ArabicLine({ text, onTerm }: { text: string; onTerm: (termId: string) => void }) {
  const segments = useMemo(() => (glossaryEnabled ? segmentTerms(text, glossary) : [{ text }]), [text]);
  return (
    <>
      {segments.map((segment, index) =>
        "termId" in segment && segment.termId ? (
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
