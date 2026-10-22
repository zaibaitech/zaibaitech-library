import type { Book } from "@/content/types";
import { GeometricBackdrop } from "./geometric";

/**
 * A typographic cover generated from catalogue data. It is the library's own
 * cover, not an image of any published edition.
 */
export function BookPlate({
  book,
  authorAr,
  className = "",
  compact = false,
}: {
  book: Book;
  authorAr: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={`Cover: ${book.title}`}
      className={`relative overflow-hidden rounded-2xl text-white ${className}`}
      style={{ background: book.coverGradient }}
    >
      <GeometricBackdrop className="absolute inset-0 h-full w-full text-white/20" />
      <div className="absolute inset-2.5 rounded-xl border border-[#e4c78a]/45" />
      <div className={`relative flex h-full flex-col justify-between ${compact ? "min-h-48 p-5" : "min-h-72 p-7"}`}>
        <div className="flex items-center justify-between gap-3 text-[0.65rem] uppercase tracking-[0.2em] text-[#f3e6c4]">
          <span>{book.madhhab}</span>
          <span>{book.status === "readable" ? book.level : "Forthcoming"}</span>
        </div>
        <div dir="rtl" lang="ar" className="text-right">
          <p className={`font-amiri leading-snug ${compact ? "text-3xl" : "text-4xl sm:text-5xl"}`}>
            {book.titleAr}
          </p>
          <p className="mt-2 font-amiri text-base text-white/85">{authorAr}</p>
        </div>
        <p className="max-w-[16rem] text-xs text-white/80">{book.subtitle}</p>
      </div>
    </div>
  );
}
