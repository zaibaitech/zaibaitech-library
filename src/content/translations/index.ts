import type { TranslationFile } from "../types";
import akhdariEnDraft from "./akhdari/en-zaibaitech-draft.json";

/**
 * Registered translation files. See docs/TRANSLATIONS.md before adding one.
 *
 * Registering a file does not publish it. A translation is shown only when its
 * TranslationInfo in books.ts passes `isPublishable`.
 */
export const translationFiles: TranslationFile[] = [akhdariEnDraft as TranslationFile];
