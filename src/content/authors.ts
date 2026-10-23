import type { Author } from "./types";

/**
 * Authors are kept apart from books so one author can have many books.
 * Add a `bio` only with a source that can be cited.
 */
export const authors: Author[] = [
  {
    id: "akhdari",
    name: "Abd al-Rahman al-Akhdari",
    nameAr: "عبد الرحمن الأخضري",
    diedAH: 983,
    datingSource: "Date tag in the OpenITI record (0983)",
  },
  {
    id: "ibn-abi-zayd",
    name: "Ibn Abi Zayd al-Qayrawani",
    nameAr: "ابن أبي زيد القيرواني",
  },
  {
    id: "khalil",
    name: "Khalil ibn Ishaq al-Jundi",
    nameAr: "خليل بن إسحاق الجندي",
  },
  {
    id: "omar-ceesay",
    // As printed on the title pages of his books.
    name: "Abu Abdur-Rahman Omar Ibn Alhagie Abdullah Ceesay Ibn Alhagie Jibel Fana Sow Ceesay",
    // The copyright line's form: "© Omar Ceesay".
    shortName: "Omar Ceesay",
  },
];

export function getAuthor(id: string) {
  return authors.find((author) => author.id === id) ?? null;
}
