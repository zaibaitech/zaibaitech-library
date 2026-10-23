"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, Search, X } from "lucide-react";
import type { ReadableContent } from "@/content/types";
import { isProse } from "@/content/types";
import { flattenUnits, proseText, searchContent, searchProse } from "@/lib/reading";
import { translationText } from "@/lib/translations";
import { cn } from "@/lib/cn";

export type SheetTab = "contents" | "search" | "bookmarks";

type Props = {
  tab: SheetTab;
  onTab: (tab: SheetTab) => void;
  onClose: () => void;
  content: ReadableContent;
  activeChapterId: string | undefined;
  bookmarks: string[];
  onToggleBookmark: (unitId: string) => void;
  /** Jump to a chapter or passage id and close the sheet. */
  onJump: (id: string) => void;
  translationId?: string;
  practiceHref?: string | null;
};

const TABS: { id: SheetTab; label: string }[] = [
  { id: "contents", label: "Contents" },
  { id: "search", label: "Search" },
  { id: "bookmarks", label: "Bookmarks" },
];

function snippet(text: string, max = 90) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/**
 * The English around the first match, with the match marked. Matching ignores case and, for English books,
 * the ’ marks of transliteration; the folded text keeps one character per character, so offsets line up.
 */
function TranslationSnippet({ text, query, folded = false }: { text: string; query: string; folded?: boolean }) {
  const fold = (value: string) => (folded ? foldPreservingLength(value) : value.toLowerCase());
  const needle = fold(query.trim()).replace(/\u0000/g, "");
  const haystack = fold(text);
  const found = folded ? findIgnoringMarks(haystack, needle) : { at: haystack.indexOf(needle), length: needle.length };
  const at = found.at;
  if (at < 0) return <>{snippet(text, 120)}</>;
  const end = at + found.length;
  const start = Math.max(0, text.lastIndexOf(" ", Math.max(0, at - 50)) + 1);
  const stop = Math.min(text.length, end + 70);
  return (
    <>
      {start > 0 ? "…" : ""}
      {text.slice(start, at)}
      <mark className="rounded-sm bg-gold-soft px-0.5 text-ink">{text.slice(at, end)}</mark>
      {text.slice(end, stop).trimEnd()}
      {stop < text.length ? "…" : ""}
    </>
  );
}

/** Lower-cases and blanks out transliteration marks (as \u0000) without changing the string's length. */
function foldPreservingLength(value: string) {
  return value.toLowerCase().replace(/[’‘'ʿʾ`]/g, "\u0000");
}

/** Find `needle` in `haystack`, skipping the blanked marks in the haystack. */
function findIgnoringMarks(haystack: string, needle: string) {
  for (let start = 0; start < haystack.length; start++) {
    let i = start;
    let j = 0;
    while (i < haystack.length && j < needle.length) {
      if (haystack[i] === "\u0000" && i !== start) i++;
      else if (haystack[i] === needle[j]) {
        i++;
        j++;
      } else break;
    }
    if (j === needle.length && needle.length > 0) return { at: start, length: i - start };
  }
  return { at: -1, length: 0 };
}

export function ReaderSheet(props: Props) {
  const { tab, onTab, onClose, content, activeChapterId, bookmarks, onToggleBookmark, onJump, translationId } = props;
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  // Focus management: move focus in on open, trap Tab, restore focus on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]):not([tabindex="-1"]), a[href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      opener?.focus?.();
    };
  }, [onClose]);

  // Focus the search box only when the sheet opens on Search; switching tabs keeps focus on the tab.
  const openedOn = useRef(tab);
  useEffect(() => {
    if (openedOn.current === "search") inputRef.current?.focus();
  }, []);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onTabKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex((item) => item.id === tab);
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key as string];
    let next: number | null = step === undefined ? null : (index + step + TABS.length) % TABS.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = TABS.length - 1;
    if (next === null) return;
    event.preventDefault();
    onTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  const prose = isProse(content);
  const flat = useMemo(() => flattenUnits(content), [content]);
  const hits = useMemo(
    () =>
      isProse(content)
        ? searchProse(content, query).map((hit) => ({ ...hit, preview: proseText(hit.unit) }))
        : searchContent(content, query, translationId).map((hit) => ({ ...hit, preview: hit.unit.arabic })),
    [content, query, translationId],
  );
  const marked = useMemo(
    () => flat.filter((item) => bookmarks.includes(item.unit.id)),
    [flat, bookmarks],
  );

  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center sm:items-stretch sm:justify-end">
      <button type="button" aria-label="Close panel" className="absolute inset-0 bg-ink/30" onClick={onClose} tabIndex={-1} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Book navigation"
        tabIndex={-1}
        className="relative flex max-h-[88dvh] w-full flex-col rounded-t-xl border border-line bg-paper-2 shadow-lift outline-none sm:max-h-none sm:max-w-md sm:rounded-none sm:border-y-0 sm:border-r-0"
      >
        <div className="flex items-center gap-2 border-b border-line px-3 py-2">
          {/* Tabs follow the WAI-ARIA pattern: arrow keys move between tabs; only the active tab is in the Tab order. */}
          <div role="tablist" aria-label="Book navigation" onKeyDown={onTabKey} className="flex flex-1 gap-1">
            {TABS.map((item, i) => (
              <button
                key={item.id}
                ref={(node) => {
                  tabRefs.current[i] = node;
                }}
                type="button"
                role="tab"
                id={`sheet-tab-${item.id}`}
                aria-selected={tab === item.id}
                aria-controls="sheet-panel"
                tabIndex={tab === item.id ? 0 : -1}
                onClick={() => onTab(item.id)}
                className={cn(
                  "min-h-11 rounded-md px-3 text-sm transition-colors motion-reduce:transition-none",
                  tab === item.id
                    ? "font-medium text-ink underline decoration-emerald decoration-2 underline-offset-[10px]"
                    : "text-muted hover:text-ink",
                )}
              >
                {item.label}
                {item.id === "bookmarks" && bookmarks.length > 0 ? ` (${bookmarks.length})` : ""}
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="tool-btn">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div id="sheet-panel" role="tabpanel" aria-labelledby={`sheet-tab-${tab}`} className="min-h-0 flex-1 overflow-y-auto p-3">
          {tab === "contents" ? (
            <>
              {prose ? (
                <ol>
                  {content.chapters.map((chapter) => {
                    const opensPart = chapter.partEn !== "" && chapter.partEn === chapter.headingEn;
                    const inPart = chapter.partEn !== "" && !opensPart;
                    return (
                      <li key={chapter.id}>
                        <button
                          type="button"
                          onClick={() => onJump(chapter.id)}
                          aria-current={chapter.id === activeChapterId ? "location" : undefined}
                          className={cn(
                            "flex min-h-11 w-full items-baseline rounded-xl px-3 py-2 text-left hover:bg-paper-3",
                            inPart && "pl-7 text-[0.95rem]",
                            opensPart && "mt-2 font-medium",
                            chapter.id === activeChapterId && "bg-paper-3 font-medium",
                          )}
                        >
                          <span className="min-w-0 flex-1 text-ink">{chapter.headingEn}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              ) : (
              <ol>
                {content.chapters.map((chapter, index) => (
                  <li key={chapter.id}>
                    <button
                      type="button"
                      onClick={() => onJump(chapter.id)}
                      aria-current={chapter.id === activeChapterId ? "location" : undefined}
                      className={cn(
                        "flex min-h-12 w-full items-baseline gap-3 rounded-xl px-3 py-2 text-left hover:bg-paper-3",
                        chapter.id === activeChapterId && "bg-paper-3 font-medium",
                      )}
                    >
                      <span className="w-6 shrink-0 text-sm text-muted">{index + 1}</span>
                      <span className="min-w-0 flex-1 text-ink">{chapter.headingEn}</span>
                      <span className="font-amiri text-lg leading-snug text-ink" dir="rtl" lang="ar">
                        {chapter.headingAr}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              )}
              {props.practiceHref ? (
                <a href={props.practiceHref} className="btn btn-quiet mt-3 w-full">
                  Guided practice
                </a>
              ) : null}
            </>
          ) : null}

          {tab === "search" ? (
            <div>
              <label htmlFor="reader-search" className="sr-only">
                Search this book
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
                <input
                  ref={inputRef}
                  id="reader-search"
                  type="search"
                  dir="auto"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search the text"
                  className="field min-h-12 py-2 pl-10 pr-4"
                />
              </div>
              <p className="mt-2 text-xs text-muted">
                {prose
                  ? "Searches the whole book, headings included. Capitals and the ’ marks in transliterated names are ignored."
                  : translationId
                  ? "Searches the Arabic and the English. In Arabic, vowel marks and alif forms are ignored."
                  : "Searches the Arabic. Vowel marks and alif forms are ignored."}{" "}
                Type at least two letters.
              </p>
              <p role="status" aria-live="polite" className="mt-3 text-sm text-muted">
                {query.trim().length >= 2 ? `${hits.length} ${hits.length === 1 ? "passage" : "passages"} found` : ""}
              </p>
              <ul className="mt-2 divide-y divide-line">
                {hits.slice(0, 50).map((hit) => (
                  <li key={hit.unit.id}>
                    <button
                      type="button"
                      onClick={() => onJump(hit.unit.id)}
                      className="block min-h-12 w-full px-2 py-3 text-left hover:bg-paper-3"
                    >
                      <span className="block text-xs text-muted">
                        {hit.chapter.headingEn} · passage {hit.unit.number}
                      </span>
                      {hit.field === "text" ? (
                        <span className="mt-1 block text-sm leading-relaxed text-ink-2" lang="en">
                          <TranslationSnippet text={hit.preview} query={query} folded />
                        </span>
                      ) : hit.field === "translation" && translationId ? (
                        <span className="mt-1 block text-sm leading-relaxed text-ink-2">
                          <TranslationSnippet text={translationText(hit.unit, translationId) ?? ""} query={query} />
                        </span>
                      ) : (
                        <span className="mt-1 block font-amiri text-xl leading-loose text-ink" dir="rtl" lang="ar">
                          {snippet(hit.preview)}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              {query.trim().length >= 2 && hits.length === 0 ? (
                <p className="mt-4 text-sm text-muted">No passage contains that. Try fewer letters or another spelling.</p>
              ) : null}
            </div>
          ) : null}

          {tab === "bookmarks" ? (
            marked.length === 0 ? (
              <div className="px-2 py-6 text-center">
                <Bookmark className="mx-auto h-6 w-6 text-gold" aria-hidden />
                <p className="mt-3 font-medium text-ink">No bookmarks yet</p>
                <p className="mt-1 text-sm text-muted">
                  Use the bookmark button beside any passage to keep your place. Bookmarks stay on this device.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {marked.map((item) => (
                  <li key={item.unit.id} className="flex items-stretch gap-1">
                    <button
                      type="button"
                      onClick={() => onJump(item.unit.id)}
                      className="min-h-12 min-w-0 flex-1 px-2 py-3 text-left hover:bg-paper-3"
                    >
                      <span className="block text-xs text-muted">
                        {item.chapter.headingEn} · passage {item.unit.number}
                      </span>
                      {"arabic" in item.unit ? (
                        <span className="mt-1 block truncate font-amiri text-xl leading-loose text-ink" dir="rtl" lang="ar">
                          {snippet(item.unit.arabic, 60)}
                        </span>
                      ) : (
                        <span className="mt-1 block truncate text-sm text-ink-2" lang="en">
                          {snippet(proseText(item.unit), 90)}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      className="tool-btn my-auto shrink-0"
                      aria-label={`Remove bookmark: ${item.chapter.headingEn}, passage ${item.unit.number}`}
                      onClick={() => onToggleBookmark(item.unit.id)}
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
