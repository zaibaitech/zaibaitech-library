import Link from "next/link";
import type { BookContent } from "@/content/types";
import { useSettings } from "../settings-provider";

function findArabic(content: BookContent, unitId: string, vowelled: boolean) {
  for (const chapter of content.chapters) {
    const unit = chapter.units.find((item) => item.id === unitId);
    if (!unit) continue;
    return vowelled && unit.arabicVowelled ? unit.arabicVowelled : unit.arabic;
  }
  return "";
}

export function SourceLine({
  content,
  bookId,
  unitId,
  compact = false,
}: {
  content: BookContent;
  bookId: string;
  unitId: string;
  compact?: boolean;
}) {
  const { settings } = useSettings();
  const arabic = findArabic(content, unitId, settings.vowelled);
  if (!arabic) return null;
  return (
    <div>
      <blockquote
        className={
          compact
            ? "arabic-text rounded-2xl bg-paper px-3 py-2 text-lg leading-relaxed text-ink"
            : "arabic-text rounded-2xl bg-paper px-3 py-2 text-[1.35rem] leading-loose text-ink"
        }
        dir="rtl"
        lang="ar"
      >
        {arabic}
      </blockquote>
      <Link
        href={`/books/${bookId}/read#${unitId}`}
        className="mt-2 inline-flex text-sm font-medium text-emerald underline decoration-gold underline-offset-4"
      >
        Open this line in the reader
      </Link>
    </div>
  );
}
