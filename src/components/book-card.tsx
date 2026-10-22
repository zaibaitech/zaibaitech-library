import Link from "next/link";
import type { CatalogueEntry } from "@/lib/library-view";
import { BookPlate } from "./book-plate";

export function BookCard({ entry }: { entry: CatalogueEntry }) {
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <Link href={`/books/${entry.id}`} className="block p-3 pb-0" aria-label={`${entry.title}, book page`}>
        <BookPlate book={entry.book} authorAr={entry.authorAr} compact />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p
          className={
            entry.readable
              ? "text-xs font-medium text-emerald"
              : "text-xs font-medium text-gold"
          }
        >
          {entry.readable ? "Available to read" : "Forthcoming · text not yet available"}
        </p>
        <h3 className="mt-1 font-display text-xl leading-snug text-ink">
          <Link href={`/books/${entry.id}`} className="hover:text-emerald">
            {entry.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-muted">{entry.authorName}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink/90">{entry.summary}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Details">
          <li className="chip">{entry.level}</li>
          <li className="chip">{entry.madhhab}</li>
          {entry.subjects.map((subject) => (
            <li key={subject.id} className="chip">
              {subject.label}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">Reading in: {entry.languages.join(", ")}</p>
        <div className="mt-auto pt-4">
          {entry.readable ? (
            <Link href={`/books/${entry.id}/read`} className="btn btn-primary w-full sm:w-auto">
              Read
            </Link>
          ) : (
            <Link href={`/books/${entry.id}`} className="btn btn-quiet w-full sm:w-auto">
              About this title
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
