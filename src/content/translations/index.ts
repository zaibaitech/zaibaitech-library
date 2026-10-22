import type { TranslationFile } from "../types";
import akhdariEn from "./akhdari/en-zaibaitech-2026.json";

/**
 * Registered translation files. See docs/TRANSLATIONS.md before adding one.
 *
 * Registering a file does not publish it. A translation is shown only when its
 * TranslationInfo in books.ts passes `isPublishable`.
 */
export const translationFiles: TranslationFile[] = [akhdariEn as TranslationFile];
