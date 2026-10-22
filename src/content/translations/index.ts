import type { TranslationFile } from "../types";

/**
 * Registered translation files. Empty: no licensed translation is in the
 * library yet. See docs/TRANSLATIONS.md before adding one.
 *
 * Registering a file does not publish it. A translation is shown only when its
 * TranslationInfo in books.ts passes `isPublishable`.
 */
export const translationFiles: TranslationFile[] = [];
