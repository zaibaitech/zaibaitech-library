import type { Book, BookContent, TextUnit, TranslationInfo } from "../content/types";

/**
 * Translation rules, kept free of UI so they can be tested.
 *
 * A translation is shown to readers only when its metadata says `verified`
 * and at least one text unit carries text under its `translationId`.
 */

export type ReadingMode =
  | { kind: "arabic" }
  | { kind: "both"; translationId: string }
  | { kind: "translation"; translationId: string };

export const ARABIC_ONLY: ReadingMode = { kind: "arabic" };

export function translationText(unit: TextUnit, translationId: string) {
  const found = unit.translations?.find((item) => item.translationId === translationId);
  const text = found?.text.trim();
  return text ? text : null;
}

export function availableTranslations(book: Book, content: BookContent): TranslationInfo[] {
  return book.translations.filter(
    (info) =>
      info.reviewStatus === "verified" &&
      content.chapters.some((chapter) =>
        chapter.units.some((unit) => translationText(unit, info.translationId) !== null),
      ),
  );
}

/** Translations that are declared but not shown, and why. */
export function pendingTranslations(book: Book, content: BookContent) {
  const shown = new Set(availableTranslations(book, content).map((info) => info.translationId));
  return book.translations.filter((info) => !shown.has(info.translationId));
}

export function modeKey(mode: ReadingMode) {
  return mode.kind === "arabic" ? "arabic" : `${mode.kind}:${mode.translationId}`;
}

export function parseModeKey(key: string | undefined): ReadingMode {
  if (!key || key === "arabic") return ARABIC_ONLY;
  const [kind, translationId] = key.split(":");
  if ((kind === "both" || kind === "translation") && translationId) {
    return { kind, translationId };
  }
  return ARABIC_ONLY;
}

/** Fall back to Arabic when a saved mode points at a translation that is not available. */
export function resolveMode(mode: ReadingMode, available: TranslationInfo[]): ReadingMode {
  if (mode.kind === "arabic") return mode;
  return available.some((info) => info.translationId === mode.translationId) ? mode : ARABIC_ONLY;
}

export function modeOptions(available: TranslationInfo[]) {
  const options = [{ key: "arabic", label: "Arabic only" }];
  for (const info of available) {
    options.push({
      key: `both:${info.translationId}`,
      label: `Arabic + ${info.languageLabel}`,
    });
    options.push({
      key: `translation:${info.translationId}`,
      label: `${info.languageLabel} only`,
    });
  }
  return options;
}
