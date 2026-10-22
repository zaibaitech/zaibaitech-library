import type { BookContent, Chapter, TextUnit } from "../content/types";
import { foldArabic } from "./arabic";
import { translationText } from "./translations";

export type FlatUnit = { unit: TextUnit; chapter: Chapter; index: number };

export function flattenUnits(content: BookContent): FlatUnit[] {
  let index = 0;
  return content.chapters.flatMap((chapter) =>
    chapter.units.map((unit) => ({ unit, chapter, index: index++ })),
  );
}

/** Map an id from an earlier passage split to the passage that now holds its words. */
export function currentPassageId(content: BookContent, id: string) {
  return content.legacyIds?.[id] ?? id;
}

/**
 * Resolve a URL hash or saved id to a passage, accepting a chapter id as its first
 * passage and an earlier passage id as the passage that now contains it.
 */
export function resolveTarget(content: BookContent, rawId: string | null | undefined): FlatUnit | null {
  if (!rawId) return null;
  const id = currentPassageId(content, rawId);
  const units = flattenUnits(content);
  const direct = units.find((item) => item.unit.id === id);
  if (direct) return direct;
  const chapter = content.chapters.find((item) => item.id === id);
  return chapter ? (units.find((item) => item.chapter.id === chapter.id) ?? null) : null;
}

/** Where the reader is, as 0..1. Position-based, not a claim about what was read. */
export function positionFraction(content: BookContent, unitId: string | null) {
  const units = flattenUnits(content);
  const found = units.find((item) => item.unit.id === unitId);
  if (!found || units.length === 0) return 0;
  return (found.index + 1) / units.length;
}

export type SearchHit = { unit: TextUnit; chapter: Chapter; field: "arabic" | "translation" };

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
