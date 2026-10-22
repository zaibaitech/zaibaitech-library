import type { Book, BookContent, SubjectId } from "../content/types";
import { foldArabic } from "./arabic";
import { availableTranslations } from "./translations";

export type CatalogueFilter = {
  query?: string;
  subject?: SubjectId | null;
};

function fold(value: string) {
  return foldArabic(value).toLowerCase();
}

export function bookMatches(book: Book, authorName: string, filter: CatalogueFilter) {
  if (filter.subject && !book.subjects.includes(filter.subject)) return false;
  const needle = fold((filter.query ?? "").trim());
  if (!needle) return true;
  const haystack = fold(
    [book.title, book.titleAr, book.subtitle, authorName, book.summary, book.madhhab, book.level].join(" "),
  );
  return needle.split(/\s+/).every((word) => haystack.includes(word));
}

/** Languages a reader can actually read this book in today. */
export function readableLanguages(book: Book, content: BookContent | null): string[] {
  const languages = [book.originalLanguage];
  if (content) {
    for (const info of availableTranslations(book, content)) languages.push(info.languageLabel);
  }
  return languages;
}
