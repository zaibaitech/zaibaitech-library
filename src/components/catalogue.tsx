"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { subjects } from "@/content/subjects";
import type { SubjectId } from "@/content/types";
import { bookMatches } from "@/lib/catalogue";
import type { CatalogueEntry } from "@/lib/library-view";
import { cn } from "@/lib/cn";
import { BookCard } from "./book-card";

export function Catalogue({ entries }: { entries: CatalogueEntry[] }) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<SubjectId | null>(null);

  const shown = useMemo(
    () =>
      entries.filter((entry) =>
        bookMatches(entry.book, entry.authorName, { query, subject }),
      ),
    [entries, query, subject],
  );
  const filtering = query.trim() !== "" || subject !== null;
  const readable = shown.filter((entry) => entry.readable);
  const forthcoming = shown.filter((entry) => !entry.readable);
  const counts = useMemo(
    () =>
      Object.fromEntries(
        subjects.map((s) => [
          s.id,
          entries.filter((e) => e.readable && e.book.subjects.includes(s.id)).length,
        ]),
      ),
    [entries],
  );

  return (
    <section id="catalogue" aria-labelledby="catalogue-heading" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-12">
      <h2 id="catalogue-heading" className="font-display text-3xl text-ink">
        Browse the library
      </h2>

      <form role="search" className="mt-4" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="catalogue-search" className="sr-only">
          Search books by title, author, or subject
        </label>
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="catalogue-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, author, or subject — Arabic or English"
            className="min-h-12 w-full rounded-full border border-line bg-paper-2 py-2 pl-10 pr-4 text-base text-ink placeholder:text-muted/80"
          />
        </div>
      </form>

      <div className="mt-4" role="group" aria-label="Filter by subject">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={subject === null}
            onClick={() => setSubject(null)}
            className="tool-btn"
          >
            All subjects
          </button>
          {subjects.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={subject === s.id}
              onClick={() => setSubject(subject === s.id ? null : s.id)}
              className="tool-btn"
            >
              {s.label}
              <span className={cn("text-xs", subject === s.id ? "text-paper/80" : "text-muted")}>
                {counts[s.id] > 0 ? counts[s.id] : "soon"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {shown.length} {shown.length === 1 ? "title" : "titles"} shown
      </p>

      {shown.length === 0 ? (
        <div className="card mt-8 px-6 py-10 text-center">
          <p className="font-display text-xl text-ink">Nothing matches yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            No title in the library fits{query.trim() ? ` “${query.trim()}”` : " that subject"}. More books are planned;
            until then, you can clear the filters and browse what is here.
          </p>
          <button
            type="button"
            className="btn btn-primary mt-5"
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
          {readable.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-ink">Available to read</h3>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {readable.map((entry) => (
                  <li key={entry.id}>
                    <BookCard entry={entry} />
                  </li>
                ))}
              </ul>
            </div>
          ) : filtering ? (
            <p className="mt-8 text-sm text-muted">No readable book matches. Forthcoming titles that match are listed below.</p>
          ) : null}
          {forthcoming.length > 0 ? (
            <div className="mt-10">
              <h3 className="text-sm font-medium text-ink">Forthcoming</h3>
              <p className="mt-1 text-sm text-muted">
                These titles are planned. Their text is not in the library and cannot be opened yet.
              </p>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {forthcoming.map((entry) => (
                  <li key={entry.id}>
                    <BookCard entry={entry} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
