import type { Book } from "@/content/types";
import { cn } from "@/lib/cn";
import { Rosette } from "./geometric";

/**
 * A typographic cover generated from catalogue data, in book proportions (2:3).
 * It is the library's own cover, not an image of any published edition.
 */
export function BookCover({
  book,
  authorAr,
  authorName,
  className,
}: {
  book: Book;
  authorAr?: string;
  /** Shown on the cover of an English book, in place of the Arabic title and name. */
  authorName?: string;
  className?: string;
}) {
  const forthcoming = book.status !== "readable";
  return (
    <div
      role="img"
      aria-label={`Cover of ${book.title}${forthcoming ? ", forthcoming" : ""}`}
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-[3px] text-[#f4ecd8] shadow-cover",
        forthcoming && "opacity-80 saturate-[0.55]",
        className,
      )}
      // Lettering is sized in container units (cqw) so a cover looks the same at any size and any text setting.
      style={{ background: book.coverGradient, containerType: "inline-size" }}
    >
      {/* spine shadow and a single fine gold frame */}
      <div className="absolute inset-y-0 left-0 w-[6%] bg-gradient-to-r from-black/25 to-transparent" />
      <div className="absolute inset-[6%] rounded-[2px] border border-[#c9a96a]/45" />
      <div className="relative flex h-full flex-col items-center justify-between px-[13%] py-[14%] text-center">
        <Rosette className="h-[13cqw] w-[13cqw] text-[#c9a96a]/80" />
        {book.edition ? (
          <div lang="en">
            <p className="font-display text-[9.5cqw] leading-[1.18] [overflow-wrap:anywhere]">{book.title}</p>
            <p className="mt-[5cqw] font-display text-[6cqw] italic text-[#e6d6b0]/85">{authorName}</p>
          </div>
        ) : (
          <div dir="rtl" lang="ar">
            <p className="font-amiri text-[15cqw] leading-[1.35]">
              {book.titleAr}
            </p>
            <p className="mt-[4cqw] font-amiri text-[7.5cqw] text-[#e6d6b0]/85">
              {authorAr}
            </p>
          </div>
        )}
        <p className={cn("text-[4.2cqw] uppercase tracking-[0.22em] text-[#e6d6b0]/75", forthcoming && "invisible")}>
          {book.edition ? book.edition.languageLabel : book.madhhab}
        </p>
      </div>
      {forthcoming ? (
        <p className="absolute inset-x-0 bottom-0 bg-black/45 py-[2.5cqw] text-center text-[4.5cqw] font-medium uppercase tracking-[0.2em] text-[#f4ecd8]">
          Forthcoming
        </p>
      ) : null}
    </div>
  );
}
