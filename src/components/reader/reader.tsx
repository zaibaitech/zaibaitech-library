"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bookmark, ChevronLeft, ChevronRight, List, Search } from "lucide-react";
import type { Book, ReadableContent, TranslationInfo } from "@/content/types";
import { isProse } from "@/content/types";
import { glossary } from "@/content/glossary";
import { segmentTerms, toArabicDigits } from "@/lib/arabic";
import { cn } from "@/lib/cn";
import { longDate } from "@/lib/dates";
import { glossaryEnabled } from "@/lib/flags";
import { currentPassageId, flattenUnits, positionFraction, resolveTarget } from "@/lib/reading";
import {
  FONT_SCALES,
  TRANSLATION_SCALES,
  loadBookmarks,
  loadProgress,
  saveBookmarks,
  saveProgress,
} from "@/lib/storage";
import {
  headingTranslation,
  modeKey,
  modeOptions,
  parseModeKey,
  resolveMode,
  translationNotes,
  translationText,
} from "@/lib/translations";
import { GlossarySheet } from "../glossary-sheet";
import { useSettings } from "../settings-provider";
import { Rosette } from "../geometric";
import { ChapterHeading } from "./chapter-banner";
import { DisplayPanel, PanelRow, Segmented, Stepper, Switch } from "./display-panel";
import { ReaderSheet, type SheetTab } from "./reader-sheet";
import { ProseHeading, ProsePassage } from "./prose";

type Props = {
  book: Book;
  /** Arabic text units, or the passages of an English book (`isProse`), which has no Arabic layer. */
  content: ReadableContent;
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
    ready,
    fontSize,
    translationFontSize,
    setFontScale,
    setTranslationScale,
    setVowelled,
    setMode,
    setTheme,
  } = useSettings();

  const prose = isProse(content);
  const flat = useMemo(() => flattenUnits(content), [content]);
  /** What place-keeping needs from either kind of book. */
  const chapters: { id: string; headingEn: string; partEn: string; units: { id: string }[] }[] = content.chapters;
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
  const [displayOpen, setDisplayOpen] = useState(false);
  const [justify, setJustify] = useState(true);
  /** The chapter whose heading is above the reading line; a section title counts even though it holds no passages. */
  const [headingId, setHeadingId] = useState<string | null>(null);
  const displayButtonRef = useRef<HTMLButtonElement>(null);

  const tracking = useRef(false);
  const commitRef = useRef<(() => void) | null>(null);
  const lastSaved = useRef<string | null>(null);
  const restored = useRef(false);
  /** True while the contents/search/bookmarks sheet or the display panel is open. */
  const panelOpen = useRef(false);
  /** The passage at the top of the screen and its distance from the top, kept up to date while scrolling. */
  const anchor = useRef<{ id: string; top: number } | null>(null);

  const current = flat.find((item) => item.unit.id === currentId) ?? null;
  const activeChapter = chapters.find((c) => c.id === headingId) ?? current?.chapter ?? chapters[0];
  const percent = Math.round(positionFraction(content, currentId) * 100);

  useEffect(() => {
    panelOpen.current = sheet !== null || displayOpen;
  }, [sheet, displayOpen]);

  /* Bookmarks live on this device. */
  useEffect(() => {
    const known = new Set(flat.map((item) => item.unit.id));
    const stored = loadBookmarks(book.id);
    // Earlier passage ids are mapped onto the passages that now hold them, then saved back once.
    const mapped = Array.from(new Set(stored.map((id) => currentPassageId(content, id)))).filter((id) => known.has(id));
    if (mapped.length !== stored.length || mapped.some((id, i) => id !== stored[i])) saveBookmarks(book.id, mapped);
    setBookmarks(mapped);
  }, [book.id, content, flat]);

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

  /* Scroll to a passage or chapter by id, and name it in the toolbar straight away. */
  const scrollToId = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ block: "start", behavior: "instant" });
      // A chapter heading can fill the tracking band with no passage in it, so the observer may not report.
      // A section title may hold no passages of its own: name the first passage after it.
      const at = chapters.findIndex((c) => c.id === id);
      const unitId = at < 0 ? id : chapters.slice(at).find((c) => c.units.length > 0)?.units[0].id;
      if (unitId) setCurrentId(unitId);
      return true;
    },
    [chapters],
  );

  /* Jump from the panel: push a history entry so Back returns to where the reader was. */
  const jump = useCallback(
    (id: string) => {
      setSheet(null);
      panelOpen.current = false;
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
    const progress = loadProgress(book.id);
    const saved = progress.lastUnitId ? (resolveTarget(content, progress.lastUnitId)?.unit.id ?? null) : null;
    if (saved && saved !== progress.lastUnitId) {
      // Saved under an earlier passage id: store the current id from now on.
      const seen = Array.from(new Set(progress.seen.map((id) => currentPassageId(content, id))));
      saveProgress(book.id, { seen, lastUnitId: saved, updatedAt: progress.updatedAt });
    }
    const isChapter = chapters.some((c) => c.id === hash);
    const hashTarget = isChapter ? hash : (resolveTarget(content, hash)?.unit.id ?? null);
    // An unknown or stale hash must not cost the reader their saved place.
    const targetId = hashTarget ?? saved;
    if (hashTarget && hashTarget !== hash) {
      window.history.replaceState(window.history.state, "", `#${hashTarget}`);
    }
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
  }, [ready, book.id, content, chapters, scrollToId]);

  /*
   * Justify the Arabic only while a line holds enough words. Browsers widen word spaces (no kashida), so in a
   * column under about 10.2 font sizes wide, as with large text on a phone, the gaps grow too wide to read well.
   */
  useEffect(() => {
    const measure = () => {
      const el = document.querySelector<HTMLElement>("p.arabic-text");
      if (!el) return;
      setJustify(el.clientWidth / parseFloat(getComputedStyle(el).fontSize) >= 10.2);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [fontSize, mode.kind]);

  /*
   * Remember which passage is at the top of the screen, and which chapter heading is above it. A change of
   * width (turning a phone, resizing a window) reflows every passage: put the remembered one back in place.
   */
  useEffect(() => {
    // The reading line sits just below where jumps land (84px), inside the tracking band.
    const LINE = 100;
    let frame = 0;
    const capture = () => {
      frame = 0;
      let heading: string | null = null;
      for (const section of document.querySelectorAll<HTMLElement>("article > section[id]")) {
        if (section.getBoundingClientRect().top > LINE) break;
        heading = section.id;
      }
      setHeadingId(heading);
      for (const el of document.querySelectorAll<HTMLElement>("[data-unit]")) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom > LINE) {
          anchor.current = { id: el.id, top: rect.top };
          return;
        }
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(capture);
    };
    let width = window.innerWidth;
    const onResize = () => {
      // A height change alone (a phone's toolbar showing or hiding) reflows nothing.
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      const saved = anchor.current;
      const el = saved ? document.getElementById(saved.id) : null;
      if (saved && el) {
        const shift = el.getBoundingClientRect().top - saved.top;
        if (Math.abs(shift) > 1) window.scrollBy({ top: shift, behavior: "instant" });
      }
      capture();
    };
    capture();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  /*
   * Changing what is shown or how large it is reflows every passage above the reader. Put the passage
   * that was at the top back where it was, before the browser paints, so the place is never lost.
   */
  useLayoutEffect(() => {
    const saved = anchor.current;
    if (!tracking.current || !saved) return;
    const el = document.getElementById(saved.id);
    if (!el) return;
    const shift = el.getBoundingClientRect().top - saved.top;
    if (Math.abs(shift) > 1) window.scrollBy({ top: shift, behavior: "instant" });
  }, [mode.kind, fontSize, translationFontSize, settings.vowelled, sheet, displayOpen, justify]);

  /* Track the passage at the top of the page; save it; keep the URL hash in step (replace, not push). */
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-unit]");
    const visible = new Set<string>();
    const order = new Map(flat.map((item, i) => [item.unit.id, i]));
    let timer = 0;
    let top: string | null = null;
    const commit = () => {
      // While a panel is open the reader is not reading: locking the page's scroll can shift which passage looks
      // current (Safari), and that must not overwrite the saved place or the history entry Back returns to.
      if (panelOpen.current) return;
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
      // The band starts just below where a jumped-to passage lands (scroll-margin 5.25rem = 84px), so the
      // previous passage's bottom padding never counts as "on screen", and covers the top 40% of the screen.
      { rootMargin: "-92px 0px -60% 0px", threshold: 0 },
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
   * The browser's own scroll restoration is switched off while the reader is open: Safari applied it after this
   * handler, putting back a stale position (the right chapter, the wrong passage).
   */
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    let settle = 0;
    let userMoved = false;
    const mark = () => {
      userMoved = true;
    };
    const onPop = () => {
      const hash = currentHash();
      if (!hash) return;
      const id = chapters.some((c) => c.id === hash) ? hash : (resolveTarget(content, hash)?.unit.id ?? hash);
      userMoved = false;
      window.requestAnimationFrame(() => scrollToId(id));
      // Safari can move the page again after popstate while the router finishes the history step: place the
      // passage once more when that has settled, unless the reader has started scrolling themselves.
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (!userMoved) scrollToId(id);
      }, 250);
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("wheel", mark, { passive: true });
    window.addEventListener("touchmove", mark, { passive: true });
    window.addEventListener("keydown", mark);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("wheel", mark);
      window.removeEventListener("touchmove", mark);
      window.removeEventListener("keydown", mark);
      window.clearTimeout(settle);
      window.history.scrollRestoration = previous;
    };
  }, [content, chapters, scrollToId]);

  /*
   * Hide the toolbar while reading down; show it on any upward scroll. A jump (to a passage, a
   * bookmark, a restored place) moves far in one step: show the toolbar then, so it names where the reader landed.
   */
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const jumped = Math.abs(y - lastY) > 600;
      if (!jumped && y > lastY + 10 && y > 160) setHeaderHidden(true);
      else if (jumped || y < lastY - 10 || y < 160) setHeaderHidden(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeSheet = useCallback(() => setSheet(null), []);
  const closeDisplay = useCallback(() => setDisplayOpen(false), []);
  const wide = mode.kind === "both";
  const modeChoices = options.map((option) => ({ key: option.key, label: option.label.replace(/ only$/, "") }));
  const themeChoices = [
    { key: "light", label: "Light" },
    { key: "dark", label: "Dark" },
    { key: "system", label: "Auto" },
  ];

  return (
    // The reader keeps its own place on reflow (see the layout effect above); the browser's scroll anchoring would correct twice.
    <div className="[overflow-anchor:none]">
      <header
        className={cn(
          "sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-md transition-transform duration-200 motion-reduce:transition-none supports-[backdrop-filter]:bg-paper/85",
          headerHidden && !displayOpen && "-translate-y-full focus-within:translate-y-0",
        )}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-0.5 px-2 sm:gap-1 sm:px-4">
          <Link href={`/books/${book.id}`} aria-label={`Back to ${book.title}`} className="tool-btn shrink-0 !px-0">
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => setSheet("contents")}
            aria-haspopup="dialog"
            aria-label={`Contents. Now reading: ${activeChapter?.headingEn}`}
            className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md px-2 text-left transition-colors hover:bg-paper-3 motion-reduce:transition-none"
          >
            <List className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-medium text-ink">{activeChapter?.headingEn}</span>
              <span className="block truncate text-[0.7rem] text-muted">
                {current ? `${book.title} · ${percent}%` : book.title}
              </span>
            </span>
          </button>
          <button type="button" className="tool-btn shrink-0 !px-0" aria-label="Search this book" onClick={() => setSheet("search")}>
            <Search className="h-[18px] w-[18px]" aria-hidden />
          </button>
          <button
            type="button"
            className="tool-btn relative shrink-0 !px-0"
            aria-label={`Bookmarks, ${bookmarks.length} saved`}
            onClick={() => setSheet("bookmarks")}
          >
            <Bookmark className="h-[18px] w-[18px]" aria-hidden />
            {bookmarks.length > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[0.6rem] font-medium text-paper">
                {bookmarks.length}
              </span>
            ) : null}
          </button>
          <button
            ref={displayButtonRef}
            type="button"
            className="tool-btn shrink-0 !px-0 font-display text-[1.05rem]"
            aria-label={prose ? "Display settings: text size and theme" : "Display settings: text size, tashkīl, language and theme"}
            aria-expanded={displayOpen}
            aria-controls="display-panel"
            onClick={() => setDisplayOpen((open) => !open)}
          >
            <span aria-hidden>Aa</span>
          </button>
        </div>
        <div
          role="progressbar"
          aria-label="Position in the book"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-px bg-line"
        >
          <div className="h-full bg-gold" style={{ width: `${percent}%` }} />
        </div>

        {displayOpen ? (
          <DisplayPanel id="display-panel" onClose={closeDisplay} anchorRef={displayButtonRef}>
            {prose ? (
              // An English book: no Arabic, so no language choice, Arabic size or tashkīl.
              <PanelRow label="Text size">
                <Stepper
                  label="reading"
                  sample="Aa"
                  sampleClass="font-display text-lg leading-none"
                  level={settings.translationScale}
                  levels={TRANSLATION_SCALES.length}
                  onStep={(delta) => setTranslationScale(settings.translationScale + delta)}
                />
              </PanelRow>
            ) : translations.length > 0 ? (
              <PanelRow label="Show">
                <Segmented label="Show" value={modeKey(mode)} choices={modeChoices} onChange={setMode} />
              </PanelRow>
            ) : (
              <PanelRow label="Show" note="No translation of this book has been published yet.">
                <p className="text-sm text-ink">Arabic</p>
              </PanelRow>
            )}
            {showArabic && !prose ? (
              <PanelRow label="Arabic size">
                <Stepper
                  label="Arabic"
                  sample="ع"
                  sampleClass="font-amiri text-2xl leading-none"
                  level={settings.fontScale}
                  levels={FONT_SCALES.length}
                  onStep={(delta) => setFontScale(settings.fontScale + delta)}
                />
              </PanelRow>
            ) : null}
            {showTranslation && info && !prose ? (
              <PanelRow label={`${info.languageLabel} size`}>
                <Stepper
                  label={info.languageLabel}
                  sample="Aa"
                  sampleClass="font-display text-lg leading-none"
                  level={settings.translationScale}
                  levels={TRANSLATION_SCALES.length}
                  onStep={(delta) => setTranslationScale(settings.translationScale + delta)}
                />
              </PanelRow>
            ) : null}
            {prose ? null : (
              <Switch
                label="Tashkīl (vowel marks)"
                hint="Show the Arabic fully vowelled"
                checked={settings.vowelled}
                onChange={setVowelled}
              />
            )}
            <PanelRow label="Theme">
              <Segmented
                label="Theme"
                value={settings.theme}
                choices={themeChoices}
                onChange={(key) => setTheme(key as "light" | "dark" | "system")}
              />
            </PanelRow>
          </DisplayPanel>
        ) : null}
      </header>

      <article className={cn("mx-auto px-4 pb-24 pt-6 sm:px-8 sm:pt-10", wide ? "max-w-2xl lg:max-w-5xl" : "max-w-2xl")}>
        {prose ? (
          <header className="mb-8 text-center sm:mb-10" lang="en">
            <h1 className="mx-auto max-w-xl text-balance font-display text-[1.75rem] leading-tight text-ink sm:text-[2.2rem]">{book.title}</h1>
            <div className="mx-auto mt-3 max-w-md space-y-0.5 text-xs leading-relaxed text-muted">
              <p>{content.source.author}</p>
              <p>
                Translated by {content.source.translator} · Edited by {content.source.editor}
              </p>
              <p>
                {content.source.copyright} · {content.source.edition}. Published here with the rights holder&apos;s permission.
              </p>
            </div>
          </header>
        ) : (
        <header className="mb-8 text-center sm:mb-10">
            <p className="font-amiri text-[2rem] leading-snug text-ink sm:text-[2.4rem]" lang="ar" dir="rtl">
              {book.titleAr}
            </p>
            <h1 className="font-display text-lg text-ink-2">{book.title}</h1>
            <div className="mx-auto mt-3 max-w-md space-y-0.5 text-xs leading-relaxed text-muted">
              <p>
                Arabic text: OpenITI, {content.source.license}.{" "}
                <Link href="/about#corrections" className="underline decoration-line-strong underline-offset-4 hover:text-ink">
                  Corrections
                </Link>
              </p>
              {info ? (
                <p>
                  {info.languageLabel} translation: {info.translator}, {info.license}
                  {info.review ? `. Reviewed for publication ${longDate(info.review.reviewedOn)}` : ""}.
                </p>
              ) : translations.length === 0 ? (
                <p>No translation of this book has been published yet.</p>
              ) : null}
            </div>
          </header>
  
        )}

        {prose
          ? content.chapters.map((chapter, ci) => {
              const previous = content.chapters[ci - 1];
              const next = content.chapters[ci + 1];
              const newPart = chapter.partEn !== "" && (!previous || previous.partEn !== chapter.partEn);
              return (
                <section key={chapter.id} id={chapter.id} aria-labelledby={`${chapter.id}-h`} className="ebook-anchor pb-8 sm:pb-10">
                  <ProseHeading id={`${chapter.id}-h`} heading={chapter.headingEn} part={newPart || chapter.partEn === chapter.headingEn ? chapter.partEn : undefined} />
                  {chapter.units.map((unit) => {
                    const marked = bookmarks.includes(unit.id);
                    return (
                      <div key={unit.id} id={unit.id} data-unit={unit.id} className="ebook-anchor relative pb-5 sm:pb-6">
                        <span className="sr-only">Passage {unit.number}</span>
                        <ProsePassage
                          unit={unit}
                          fontSize={translationFontSize}
                          after={
                            <button
                              type="button"
                              className={cn(
                                "tool-btn !px-0 md:absolute md:-left-16 md:top-1 md:m-0",
                                unit.kind === "table" ? "mt-1" : "-my-3 ms-0.5 align-middle",
                                marked ? "!text-gold" : "!text-faint hover:!text-ink",
                              )}
                              style={{ textIndent: 0 }}
                              aria-pressed={marked}
                              aria-label={`Bookmark ${chapter.headingEn}, passage ${unit.number}`}
                              onClick={() => toggleBookmark(unit.id)}
                            >
                              <Bookmark className={cn("h-4 w-4", marked && "fill-current")} aria-hidden />
                            </button>
                          }
                        />
                      </div>
                    );
                  })}
                  <ChapterNav chapterId={chapter.id} headingEn={chapter.headingEn} previous={previous} next={next} />
                </section>
              );
            })
          : content.chapters.map((chapter, ci) => {
          const previous = content.chapters[ci - 1];
          const next = content.chapters[ci + 1];
          const showPart = !previous || previous.partEn !== chapter.partEn;
          const newPart = showPart && chapter.partAr !== chapter.headingAr;
          return (
            <section key={chapter.id} id={chapter.id} aria-labelledby={`${chapter.id}-h`} className="ebook-anchor pb-8 sm:pb-10">
              <ChapterHeading
                id={`${chapter.id}-h`}
                index={ci + 1}
                headingAr={chapter.headingAr}
                headingEn={chapter.headingEn}
                partAr={newPart ? chapter.partAr : undefined}
                partEn={newPart ? chapter.partEn : undefined}
                translatedHeading={info ? headingTranslation(chapter, info.translationId) : null}
              />

              {chapter.units.map((unit) => {
                const arabic = settings.vowelled && unit.arabicVowelled ? unit.arabicVowelled : unit.arabic;
                const text = info ? translationText(unit, info.translationId) : null;
                const notes = info && text ? translationNotes(unit, info.translationId) : [];
                const marked = bookmarks.includes(unit.id);
                const arabicShown = showArabic || !text;
                // Sits after the passage number at the end of the last line on phones, so it takes no row of its own; in the left margin from md.
                const bookmarkButton = (floatClass: string) => (
                  <button
                    type="button"
                    className={cn(
                      "tool-btn !px-0 md:absolute md:-left-16 md:top-1 md:m-0",
                      floatClass,
                      marked ? "!text-gold" : "!text-faint hover:!text-ink",
                    )}
                    aria-pressed={marked}
                    aria-label={`Bookmark ${chapter.headingEn}, passage ${unit.number}`}
                    onClick={() => toggleBookmark(unit.id)}
                  >
                    <Bookmark className={cn("h-4 w-4", marked && "fill-current")} aria-hidden />
                  </button>
                );
                return (
                  <div
                    key={unit.id}
                    id={unit.id}
                    data-unit={unit.id}
                    className={cn("ebook-anchor relative pb-7 sm:pb-9", wide && "lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-x-14")}
                  >
                    <span className="sr-only">Passage {unit.number}</span>
                    {arabicShown ? (
                      <p
                        className={cn("arabic-text text-ink", justify && "arabic-justify", wide && "lg:col-start-2 lg:row-start-1")}
                        dir="rtl"
                        lang="ar"
                        style={{ fontSize }}
                      >
                        <ArabicLine text={arabic} onTerm={setTermId} />
                        <span className="passage-mark" aria-hidden>
                          {toArabicDigits(unit.number)}
                        </span>
                        {bookmarkButton("-my-2 ms-0.5 align-middle")}
                      </p>
                    ) : null}
                    {showTranslation ? (
                      <div
                        className={cn(
                          arabicShown && "mt-2",
                          wide && "lg:col-start-1 lg:row-start-1 lg:mt-0 lg:border-r lg:border-line lg:pr-14 lg:pt-2",
                        )}
                      >
                        {arabicShown ? <span aria-hidden className={cn("mb-2.5 block h-px w-8 bg-gold/60", wide && "lg:hidden")} /> : null}
                        {text ? (
                          <>
                            <p className="translation-text max-w-reading text-ink-2" lang={info?.language} style={{ fontSize: translationFontSize }}>
                              {!arabicShown ? <span className="me-2 align-[0.1em] text-xs tabular-nums text-faint">{unit.number}</span> : null}
                              {text}
                              {!arabicShown ? bookmarkButton("-my-3 ms-0.5 align-middle") : null}
                            </p>
                            {notes.length > 0 ? (
                              <aside
                                aria-label={`Translator's notes on passage ${unit.number}`}
                                className="mt-3 max-w-reading border-l-2 border-gold/40 pl-4"
                                lang={info?.language}
                              >
                                <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-gold">
                                  Translator&apos;s {notes.length === 1 ? "note" : "notes"}
                                </p>
                                <ol className={cn("mt-1.5 space-y-2 text-sm leading-relaxed text-muted", notes.length > 1 && "list-decimal pl-4")}>
                                  {notes.map((note, n) => (
                                    <li key={n}>{note}</li>
                                  ))}
                                </ol>
                              </aside>
                            ) : null}
                          </>
                        ) : (
                          <p className="text-sm italic text-muted">
                            {showArabic ? "No translation available for this passage." : "Not yet translated. The Arabic is shown above."}
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}

              <ChapterNav chapterId={chapter.id} headingEn={chapter.headingEn} previous={previous} next={next} />
            </section>
          );
        })}

        <footer className="border-t border-line pt-6 text-center text-sm leading-relaxed text-muted [overflow-wrap:anywhere]">
          <Rosette className="mx-auto mb-4 h-5 w-5 text-gold/80" />
          {prose ? (
            <p lang="en">
              {content.source.copyright}. ISBN {content.source.isbn}. {content.source.edition}. All rights reserved; published in
              this library with the rights holder&apos;s permission. Not for copying or redistribution.
            </p>
          ) : (
            <p>
              Arabic text from OpenITI, {content.source.license} ({content.source.openiti.replace(/^OpenITI /, "")}). Evident copy
              errors are corrected and listed on the{" "}
              <Link href="/about#corrections" className="link font-normal">
                sources page
              </Link>
              .
            </p>
          )}
          <p className="mt-3">
            <Link href={`/books/${book.id}`} className="link font-normal">
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
          // English is searchable whenever a translation is published, even while reading the Arabic alone.
          translationId={info?.translationId ?? translations[0]?.translationId}
          practiceHref={practiceHref}
        />
      ) : null}
      {glossaryEnabled ? <GlossarySheet termId={termId} bookId={book.id} onClose={() => setTermId(null)} /> : null}
    </div>
  );
}

/** Links to the sections before and after, at the foot of each section. */
function ChapterNav({
  chapterId,
  headingEn,
  previous,
  next,
}: {
  chapterId: string;
  headingEn: string;
  previous?: { id: string; headingEn: string };
  next?: { id: string; headingEn: string };
}) {
  return (
    <nav aria-label={`After ${headingEn}`} data-after={chapterId} className="flex items-start justify-between gap-6 border-t border-line pt-2 text-sm">
      {previous ? (
        <a href={`#${previous.id}`} className="group flex min-h-11 max-w-[45%] items-start gap-1.5 text-muted hover:text-ink">
          <ChevronLeft className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            <span className="block text-[0.68rem] uppercase tracking-[0.14em] text-faint">Previous</span>
            {previous.headingEn}
          </span>
        </a>
      ) : (
        <span />
      )}
      {next ? (
        <a href={`#${next.id}`} className="group flex min-h-11 max-w-[45%] items-start justify-end gap-1.5 text-right text-muted hover:text-ink">
          <span>
            <span className="block text-[0.68rem] uppercase tracking-[0.14em] text-faint">Next</span>
            {next.headingEn}
          </span>
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        </a>
      ) : (
        <span />
      )}
    </nav>
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
