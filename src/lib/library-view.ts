import { authors, getAuthor } from "@/content/authors";
import { books } from "@/content/books";
import { getReadableContent } from "@/content/library";
import { getSubject } from "@/content/subjects";
import type { Book } from "@/content/types";
import { bookTopics, readableLanguages } from "@/lib/catalogue";
import { flattenUnits } from "@/lib/reading";

/** Plain, serialisable data for a catalogue card. Built on the server. */
export type CatalogueEntry = {
  id: string;
  title: string;
  titleAr?: string;
  subtitle: string;
  summary: string;
  level: string;
  madhhab?: string;
  readable: boolean;
  authorName: string;
  authorAr?: string;
  /** The short form of the author's name, for covers. */
  authorShort: string;
  subjects: { id: string; label: string }[];
  languages: string[];
  /** Chapter headings and summaries, searched by the library page. */
  topics: string;
  coverGradient: string;
  /** Book fields the cover needs, kept whole so BookPlate stays a pure component. */
  book: Book;
};

export function authorOf(book: Book) {
  return getAuthor(book.authorId) ?? authors[0];
}

export function catalogueEntries(): CatalogueEntry[] {
  return books.map((book) => {
    const author = authorOf(book);
    const content = book.status === "readable" ? getReadableContent(book.id) : null;
    return {
      id: book.id,
      title: book.title,
      titleAr: book.titleAr,
      subtitle: book.subtitle,
      summary: book.summary,
      level: book.level,
      madhhab: book.madhhab,
      readable: book.status === "readable" && content !== null,
      authorName: author.name,
      authorAr: author.nameAr,
      authorShort: author.shortName ?? author.name,
      subjects: book.subjects.map((id) => ({ id, label: getSubject(id).label })),
      languages: readableLanguages(book, content),
      topics: bookTopics(content),
      coverGradient: book.coverGradient,
      book,
    };
  });
}

/** What the "Continue reading" card needs to name a saved position. */
export type ResumeIndex = Record<
  string,
  {
    title: string;
    total: number;
    /** Keyed by current and earlier passage ids; `id` is always the current one. */
    units: Record<string, { id: string; index: number; chapterEn: string; chapterAr?: string }>;
  }
>;

export function resumeIndex(): ResumeIndex {
  const result: ResumeIndex = {};
  for (const book of books) {
    const content = book.status === "readable" ? getReadableContent(book.id) : null;
    if (!content) continue;
    const flat = flattenUnits(content);
    const units: ResumeIndex[string]["units"] = Object.fromEntries(
      flat.map((item) => [
        item.unit.id,
        {
          id: item.unit.id,
          index: item.index,
          chapterEn: item.chapter.headingEn,
          chapterAr: "headingAr" in item.chapter ? item.chapter.headingAr : undefined,
        },
      ]),
    );
    for (const [legacy, current] of Object.entries(content.legacyIds ?? {})) {
      if (units[current]) units[legacy] = units[current];
    }
    result[book.id] = { title: book.title, total: flat.length, units };
  }
  return result;
}
