import type { MetadataRoute } from "next";
import { books } from "@/content/books";
import { getReadableContent } from "@/content/library";
import { SITE_URL } from "@/lib/site";

/** Every public page: the library pages, each book's page, and the reader of each book that can be read. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/library", "/glossary", "/about"].map((path) => ({ url: `${SITE_URL}${path}` }));
  for (const book of books) {
    pages.push({ url: `${SITE_URL}/books/${book.id}` });
    if (book.status === "readable" && getReadableContent(book.id)) pages.push({ url: `${SITE_URL}/books/${book.id}/read` });
  }
  return pages;
}
