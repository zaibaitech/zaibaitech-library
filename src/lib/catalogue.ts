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

/** `topics` is the book's own chapter headings and summaries, so a search for "wudu" finds the book that teaches it. */
export function bookMatches(book: Book, authorName: string, filter: CatalogueFilter, topics = "") {
  if (filter.subject && !book.subjects.includes(filter.subject)) return false;
  const needle = fold((filter.query ?? "").trim());
  if (!needle) return true;
  const haystack = fold(
    [book.title, book.titleAr, book.subtitle, authorName, book.summary, book.madhhab, book.level, topics].join(" "),
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

/** Chapter headings (Arabic and English) and summaries of a readable book, for catalogue search. */
export function bookTopics(content: BookContent | null): string {
  if (!content) return "";
  return content.chapters.map((c) => [c.headingEn, c.headingAr, c.summaryEn].join(" ")).join(" ");
}
