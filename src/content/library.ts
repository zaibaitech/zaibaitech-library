import type { BookContent, Chapter, TextUnit } from "./types";
import raw from "./books/akhdari.json";

const contents: Record<string, BookContent> = {
  akhdari: raw as BookContent,
};

export function getBookContent(bookId: string): BookContent | null {
  return contents[bookId] ?? null;
}

export function readableContentIds() {
  return Object.keys(contents);
}

export function unitCount(content: BookContent) {
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
