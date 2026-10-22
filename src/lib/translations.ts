import type { Book, BookContent, TextUnit, TranslationFile, TranslationInfo } from "../content/types";

/**
 * Translation rules, kept free of UI so they can be tested.
 *
 * A translation is shown to readers only when its metadata is publishable
 * (verified, with licence evidence and a review record) and at least one
 * text unit carries text under its `translationId`.
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

const filled = (value: string | undefined) => typeof value === "string" && value.trim().length > 0;

/** Every reason this translation may not be shown. Empty means publishable. */
export function publishBlockers(info: TranslationInfo): string[] {
  const reasons: string[] = [];
  if (info.reviewStatus !== "verified") reasons.push(`review status is "${info.reviewStatus}"`);
  for (const key of ["translator", "source", "license", "licenseEvidence", "language", "languageLabel"] as const) {
    if (!filled(info[key])) reasons.push(`${key} is missing`);
  }
  if (!info.review) reasons.push("no review record");
  else {
    if (!filled(info.review.reviewer)) reasons.push("review has no reviewer");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(info.review.reviewedOn ?? "")) reasons.push("review date is not YYYY-MM-DD");
  }
  return reasons;
}

export function isPublishable(info: TranslationInfo) {
  return publishBlockers(info).length === 0;
}

/**
 * Attach translation files to generated content. Only files whose passage ids
 * exist are attached; unknown ids are reported by the validator, never shown.
 */
export function attachTranslations(content: BookContent, files: TranslationFile[]): BookContent {
  if (files.length === 0) return content;
  return {
    ...content,
    chapters: content.chapters.map((chapter) => ({
      ...chapter,
      units: chapter.units.map((unit) => {
        const translations = files
          .filter((file) => filled(file.passages[unit.id]))
          .map((file) => ({
            translationId: file.translationId,
            language: file.language,
            text: file.passages[unit.id].trim(),
          }));
        return translations.length > 0 ? { ...unit, translations } : unit;
      }),
    })),
  };
}

export function availableTranslations(book: Book, content: BookContent): TranslationInfo[] {
  return book.translations.filter(
    (info) =>
      isPublishable(info) &&
      content.chapters.some((chapter) =>
        chapter.units.some((unit) => translationText(unit, info.translationId) !== null),
      ),
  );
}

/**
 * The content a reader page may send to the browser: Arabic plus only the
 * publishable translations. Anything passed to a client component ends up in
 * the page payload, so unreviewed text must be removed here, not just hidden.
 */
export function publicContent(book: Book, content: BookContent): BookContent {
  const allowed = new Set(availableTranslations(book, content).map((info) => info.translationId));
  return {
    ...content,
    chapters: content.chapters.map((chapter) => ({
      ...chapter,
      units: chapter.units.map((unit) => {
        if (!unit.translations) return unit;
        const kept = unit.translations.filter((t) => allowed.has(t.translationId));
        const rest = { ...unit };
        delete rest.translations;
        return kept.length > 0 ? { ...rest, translations: kept } : rest;
      }),
    })),
  };
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
