import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import type { CatalogueEntry } from "@/lib/library-view";
import { BookCover } from "../book-plate";

/** One title in the collection: the cover, the title and author, and a status that does not rely on colour. */
export function BookTile({ entry }: { entry: CatalogueEntry }) {
  return (
    <Link href={`/books/${entry.id}`} className="group block rounded-sm focus-visible:outline-offset-4">
      <BookCover book={entry.book} authorAr={entry.authorAr} className="transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0" />
      <h3 className="mt-4 font-display text-lg leading-snug text-ink group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4">
        {entry.title}
      </h3>
      <p className="mt-0.5 text-sm text-muted">{entry.authorName}</p>
      {entry.readable ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-2">
          <BookOpen className="h-3.5 w-3.5 text-emerald" aria-hidden />
          <span>
            Available <span className="text-faint">· {entry.languages.join(" & ")}</span>
          </span>
        </p>
      ) : (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          Forthcoming · not yet readable
        </p>
      )}
    </Link>
  );
}
