import type { BookContent, Chapter, ProseBookContent, ProseChapter, ProseUnit, TextUnit } from "../content/types";
import { foldArabic } from "./arabic";
import { translationText } from "./translations";

/** What place-keeping needs from any book: chapters with ids, holding passages with ids. */
type Navigable = { chapters: { id: string; units: { id: string }[] }[]; legacyIds?: Record<string, string> };
type UnitOf<C extends Navigable> = C["chapters"][number]["units"][number];
type ChapterOf<C extends Navigable> = C["chapters"][number];

export type FlatUnit<C extends Navigable = BookContent> = { unit: UnitOf<C>; chapter: ChapterOf<C>; index: number };

export function flattenUnits<C extends Navigable>(content: C): FlatUnit<C>[] {
  let index = 0;
  return content.chapters.flatMap((chapter) =>
    chapter.units.map((unit) => ({ unit, chapter, index: index++ }) as FlatUnit<C>),
  );
}

/** Map an id from an earlier passage split to the passage that now holds its words. */
export function currentPassageId(content: Navigable, id: string) {
  return content.legacyIds?.[id] ?? id;
}

/**
 * Resolve a URL hash or saved id to a passage, accepting a chapter id as its first
 * passage and an earlier passage id as the passage that now contains it.
 */
export function resolveTarget<C extends Navigable>(content: C, rawId: string | null | undefined): FlatUnit<C> | null {
  if (!rawId) return null;
  const id = currentPassageId(content, rawId);
  const units = flattenUnits(content);
  const direct = units.find((item) => item.unit.id === id);
  if (direct) return direct;
  const chapter = content.chapters.find((item) => item.id === id);
  return chapter ? (units.find((item) => item.chapter.id === chapter.id) ?? null) : null;
}

/** Where the reader is, as 0..1. Position-based, not a claim about what was read. */
export function positionFraction(content: Navigable, unitId: string | null) {
  const units = flattenUnits(content);
  const found = units.find((item) => item.unit.id === unitId);
  if (!found || units.length === 0) return 0;
  return (found.index + 1) / units.length;
}

export type SearchHit = { unit: TextUnit; chapter: Chapter; field: "arabic" | "translation" };
export type ProseHit = { unit: ProseUnit; chapter: ProseChapter; field: "text" };

export function searchContent(
  content: BookContent,
  query: string,
  translationId?: string,
): SearchHit[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const arabicNeedle = foldArabic(trimmed);
  const latinNeedle = trimmed.toLowerCase();
  const hits: SearchHit[] = [];
  for (const chapter of content.chapters) {
    for (const unit of chapter.units) {
      if (foldArabic(unit.arabic).includes(arabicNeedle)) {
        hits.push({ unit, chapter, field: "arabic" });
        continue;
      }
      const text = translationId ? translationText(unit, translationId) : null;
      if (text && text.toLowerCase().includes(latinNeedle)) {
        hits.push({ unit, chapter, field: "translation" });
      }
    }
  }
  return hits;
}

/** The words of an English passage, without emphasis marks, as a reader sees them. */
export function proseText(unit: ProseUnit) {
  return unit.text.replace(/\*+/g, "");
}

/**
 * Fold an English string for matching: case, curly and straight apostrophes and quotes, and the
 * transliteration marks the books use (’ for ʿayn and hamza) do not count, so "Ubudiyyah" finds "’Ubudiyyah".
 */
export function foldEnglish(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’‘'ʿʾ`]/g, "")
    .replace(/[“”]/g, '"');
}

export function searchProse(content: ProseBookContent, query: string): ProseHit[] {
  const needle = foldEnglish(query.trim());
  if (needle.length < 2) return [];
  const hits: ProseHit[] = [];
  for (const chapter of content.chapters) {
    for (const unit of chapter.units) {
      if (foldEnglish(`${unit.heading ?? ""} ${proseText(unit)}`).includes(needle)) hits.push({ unit, chapter, field: "text" });
    }
  }
  return hits;
}
