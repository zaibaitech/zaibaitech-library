import type { BookContent, Chapter, ProseBookContent, ReadableContent, TextUnit } from "./types";
import raw from "./books/akhdari.json";
import revivingReligion from "./books/reviving-religion.json";
import knowingTheSelf from "./books/knowing-the-self.json";
import balanceOfStations from "./books/balance-of-stations.json";
import { translationFiles } from "./translations";
import { attachTranslations } from "../lib/translations";

/**
 * Arabic text is generated (`npm run content`) and never edited by hand.
 * Translation text is attached here from separate files, so regenerating the
 * Arabic cannot erase a translation.
 */
const contents: Record<string, BookContent> = {
  akhdari: attachTranslations(
    raw as BookContent,
    translationFiles.filter((file) => file.bookId === "akhdari"),
  ),
};

/**
 * English books, generated from the printed edition (`node scripts/build-three-books.mjs`) and never edited by hand.
 */
const proseContents: Record<string, ProseBookContent> = {
  "reviving-religion": revivingReligion as ProseBookContent,
  "knowing-the-self": knowingTheSelf as ProseBookContent,
  "balance-of-stations": balanceOfStations as ProseBookContent,
};

/** Arabic content: the text the translation, glossary and practice tools work on. */
export function getBookContent(bookId: string): BookContent | null {
  return contents[bookId] ?? null;
}

/** The content of any readable book, Arabic or English. */
export function getReadableContent(bookId: string): ReadableContent | null {
  return contents[bookId] ?? proseContents[bookId] ?? null;
}

export function readableContentIds() {
  return [...Object.keys(contents), ...Object.keys(proseContents)];
}

export function unitCount(content: ReadableContent) {
  return content.chapters.reduce((sum, chapter) => sum + chapter.units.length, 0);
}

export function findUnit(
  content: BookContent,
  unitId: string,
): { unit: TextUnit; chapter: Chapter } | null {
  for (const chapter of content.chapters) {
    const unit = chapter.units.find((item) => item.id === unitId);
    if (unit) return { unit, chapter };
  }
  return null;
}

export function allUnits(content: BookContent) {
  return content.chapters.flatMap((chapter) =>
    chapter.units.map((unit) => ({ unit, chapter })),
  );
}
