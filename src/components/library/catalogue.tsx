"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { subjects } from "@/content/subjects";
import type { SubjectId } from "@/content/types";
import { bookMatches } from "@/lib/catalogue";
import type { CatalogueEntry } from "@/lib/library-view";
import { BookTile } from "./book-tile";

/** The library page: one search field, subject filters, and the collection on two shelves. */
export function Catalogue({ entries }: { entries: CatalogueEntry[] }) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<SubjectId | null>(null);
  const searching = query.trim() !== "";
  const inputRef = useRef<HTMLInputElement>(null);

  // The header's search button links to /library#search.
  useEffect(() => {
    const focusOnHash = () => {
      if (window.location.hash === "#search") inputRef.current?.focus();
    };
    focusOnHash();
    window.addEventListener("hashchange", focusOnHash);
    return () => window.removeEventListener("hashchange", focusOnHash);
  }, []);

  const shown = useMemo(
    () => entries.filter((entry) => bookMatches(entry.book, entry.authorName, { query, subject }, entry.topics)),
    [entries, query, subject],
  );
  const readable = shown.filter((entry) => entry.readable);
  const forthcoming = shown.filter((entry) => !entry.readable);

  return (
    <>
      <form id="search" role="search" className="mt-8 max-w-xl scroll-mt-6" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="library-search" className="text-sm font-medium text-ink">
          Search the library
        </label>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-faint" aria-hidden />
          <input
            id="library-search"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, author or subject"
            aria-controls="collection-results"
            className="field h-14 pl-12 pr-12 [&::-webkit-search-cancel-button]:hidden"
          />
          {searching ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="tool-btn absolute right-1.5 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </form>

      <section id="collection" aria-labelledby="collection-heading" className="pt-12">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <h2 id="collection-heading" className="font-display text-2xl text-ink">
            {searching ? "Search results" : "The collection"}
          </h2>
          <p id="collection-results" role="status" aria-live="polite" className="text-sm text-muted">
            {shown.length} {shown.length === 1 ? "title" : "titles"}
            {subject ? ` in ${subjects.find((s) => s.id === subject)?.label}` : ""}
          </p>
        </div>

        <div role="group" aria-label="Filter by subject" className="mt-5 flex flex-wrap gap-x-1 gap-y-1 border-b border-line pb-3">
          <FilterButton pressed={subject === null} onClick={() => setSubject(null)}>
            All subjects
          </FilterButton>
          {subjects.map((s) => (
            <FilterButton key={s.id} pressed={subject === s.id} onClick={() => setSubject(subject === s.id ? null : s.id)}>
              {s.label}
            </FilterButton>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display text-xl text-ink">Nothing in the library matches yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
              No title fits {query.trim() ? `“${query.trim()}”` : "that subject"}. More books are planned.
            </p>
            <button
              type="button"
              className="btn btn-quiet mt-6"
              onClick={() => {
                setQuery("");
                setSubject(null);
              }}
            >
              Clear search and filters
            </button>
          </div>
        ) : (
          <>
            {readable.length > 0 ? <Shelf title="Available to read" entries={readable} /> : null}
            {forthcoming.length > 0 ? (
              <Shelf
                title="Forthcoming"
                note="Planned titles. Their text is not in the library yet, so they cannot be opened."
                entries={forthcoming}
              />
            ) : null}
          </>
        )}
      </section>
    </>
  );
}

function FilterButton({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={
        pressed
          ? "min-h-11 rounded-md px-3 text-sm font-medium text-ink underline decoration-emerald decoration-2 underline-offset-[10px]"
          : "min-h-11 rounded-md px-3 text-sm text-muted transition-colors hover:text-ink motion-reduce:transition-none"
      }
    >
      {children}
    </button>
  );
}

function Shelf({ title, note, entries }: { title: string; note?: string; entries: CatalogueEntry[] }) {
  return (
    <div className="mt-10">
      <h3 className="text-sm font-medium text-ink">{title}</h3>
      {note ? <p className="mt-1 text-sm text-muted">{note}</p> : null}
      <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-10">
        {entries.map((entry) => (
          <li key={entry.id} className="max-w-[13rem]">
            <BookTile entry={entry} />
          </li>
        ))}
      </ul>
    </div>
  );
}
