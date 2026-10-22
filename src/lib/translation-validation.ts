import type { Book, BookContent, TranslationFile } from "../content/types";
import { publishBlockers } from "./translations";

/**
 * Checks a translation file against the Arabic it claims to translate.
 * Errors block registration; warnings are for a human reviewer to look at.
 */
export type ValidationReport = {
  translationId: string;
  errors: string[];
  warnings: string[];
  coverage: { translated: number; total: number; missing: string[] };
  /** Reasons the metadata is not yet publishable. Informational until review is done. */
  publishBlockers: string[];
};

const PLACEHOLDER = /\b(?:todo|tbd|fixme|lorem ipsum|xxx)\b|\[\s*(?:\.\.\.|…|translation|missing)\s*\]/i;
const ARABIC_LETTER = /[ء-ي]/g;
const LATIN_LETTER = /[A-Za-zÀ-ɏ]/g;

function count(text: string, pattern: RegExp) {
  return (text.match(pattern) ?? []).length;
}

export function validateTranslation(book: Book, content: BookContent, file: TranslationFile): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const units = content.chapters.flatMap((chapter) => chapter.units);
  const order = new Map(units.map((unit, index) => [unit.id, index]));
  const info = book.translations.find((item) => item.translationId === file.translationId);

  if (file.bookId !== book.id) errors.push(`file is for book "${file.bookId}", not "${book.id}"`);
  if (!info) errors.push(`translationId "${file.translationId}" is not declared in books.ts`);
  else if (info.language !== file.language) {
    errors.push(`file language "${file.language}" does not match metadata language "${info.language}"`);
  }

  const ids = Object.keys(file.passages);
  let lastIndex = -1;
  let outOfOrder = 0;
  for (const id of ids) {
    const index = order.get(id);
    const text = file.passages[id];
    if (index === undefined) {
      errors.push(`passage "${id}" does not exist in the Arabic`);
      continue;
    }
    if (index < lastIndex) outOfOrder += 1;
    lastIndex = Math.max(lastIndex, index);
    if (typeof text !== "string" || text.trim() === "") {
      errors.push(`passage "${id}" is empty; leave untranslated passages out instead`);
      continue;
    }
    if (PLACEHOLDER.test(text)) errors.push(`passage "${id}" contains placeholder text`);
    if (file.language !== "ar" && count(text, ARABIC_LETTER) > count(text, LATIN_LETTER)) {
      errors.push(`passage "${id}" is mostly Arabic script; the source may have been pasted instead of a translation`);
    }
  }
  if (outOfOrder > 0) {
    warnings.push(`${outOfOrder} passage(s) appear out of book order in the file; check alignment`);
  }

  // Length-ratio outliers often mean a translation sits on the wrong passage.
  const ratios = ids
    .filter((id) => order.has(id) && file.passages[id]?.trim())
    .map((id) => {
      const arabic = units[order.get(id)!].arabic;
      return { id, ratio: file.passages[id].trim().length / Math.max(1, arabic.length) };
    });
  if (ratios.length >= 5) {
    const sorted = ratios.map((r) => r.ratio).sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    for (const { id, ratio } of ratios) {
      if (ratio > median * 3 || ratio < median / 3) {
        warnings.push(`passage "${id}" is unusually ${ratio > median ? "long" : "short"} for its Arabic; check it is on the right passage`);
      }
    }
  }

  const translated = units.filter((unit) => file.passages[unit.id]?.trim()).map((unit) => unit.id);
  const missing = units.filter((unit) => !file.passages[unit.id]?.trim()).map((unit) => unit.id);
  if (missing.length > 0) warnings.push(`${missing.length} of ${units.length} passages are untranslated`);
  if (info?.review?.scope === "full" && missing.length > 0) {
    errors.push('review scope is "full" but some passages are untranslated');
  }

  return {
    translationId: file.translationId,
    errors,
    warnings,
    coverage: { translated: translated.length, total: units.length, missing },
    publishBlockers: info ? publishBlockers(info) : ["no metadata"],
  };
}
