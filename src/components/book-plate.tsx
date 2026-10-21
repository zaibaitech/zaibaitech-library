import type { Book } from "@/content/types";
import { GeometricBackdrop } from "./geometric";

export function BookPlate({
  book,
  className = "",
  compact = false,
}: {
  book: Book;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl text-white shadow-lift ${className}`}
      style={{ background: book.coverGradient }}
    >
      <GeometricBackdrop className="absolute inset-0 h-full w-full text-white/25" />
      <div className="absolute inset-3 rounded-2xl border border-white/25" />
      <div className="absolute inset-5 rounded-xl border border-[#e4c78a]/40" />
      <div className={`relative flex h-full flex-col justify-between ${compact ? "min-h-52 p-6" : "min-h-72 p-7"}`}>
        <div className="flex items-center justify-between gap-3 text-[0.68rem] uppercase tracking-[0.22em] text-[#f3e6c4]">
          <span>{book.madhhab}</span>
          <span>{book.status === "readable" ? book.level : "Coming soon"}</span>
        </div>
        <div dir="rtl" lang="ar" className="text-right">
          <p className={`font-amiri leading-tight ${compact ? "text-3xl" : "text-4xl sm:text-5xl"}`}>
            {book.titleAr}
          </p>
          <p className="mt-3 font-amiri text-lg text-white/80">{book.authorAr}</p>
        </div>
        <p className="max-w-[16rem] text-sm text-white/75">{book.subtitle}</p>
      </div>
    </div>
  );
}
