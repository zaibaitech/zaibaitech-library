import type { Book } from "./types";

/** Visible credit required on every surface that shows the Arabic text. */
export const TEXT_CREDIT = {
  label: "Arabic text from OpenITI, CC BY-NC-SA 4.0",
  href: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  openiti: "0983IbnMuhammadSahgirAkhdari.MukhtasarFiCibadat.JK009285-ara1",
};

/**
 * Catalogue of the library: metadata only. Readable books have a matching
 * file in `src/content/books/<id>.json` registered in `library.ts`.
 * Coming-soon entries are shelf space only and have no text.
 */
export const books: Book[] = [
  {
    id: "akhdari",
    title: "Mukhtasar al-Akhdari",
    titleAr: "مختصر الأخضري",
    subtitle: "Worship, on the school of Imam Malik",
    authorId: "akhdari",
    summary:
      "A short Maliki manual of worship: what a person owes, then purification, then the prayer.",
    description:
      "A short manual of worship according to Imam Malik. It opens with what an accountable person owes, then purification — wudu, ghusl, tayammum, menstruation, and postnatal bleeding — then the prayer: its times, its conditions, what it requires, and forgetfulness inside it. The Arabic is the OpenITI text. A licensed English translation of the book is not included.",
    status: "readable",
    coverGradient:
      "linear-gradient(155deg, #071910 0%, #0c3b2e 42%, #146b4e 78%, #b08948 150%)",
    madhhab: "Maliki",
    originalLanguage: "Arabic",
    level: "First text",
    subjects: ["foundations", "purification", "prayer"],
    translations: [
      {
        translationId: "en-zaibaitech-draft",
        language: "en",
        languageLabel: "English",
        translator: "Zaibaitech Library (AI-assisted draft)",
        source:
          "Translated directly from the OpenITI Arabic in this library (JK009285-ara1). Not based on any published English translation. Reviewer notes: docs/translation-notes/akhdari-en.md",
        license: "CC BY-NC-SA 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
        licenseEvidence:
          "An adaptation of the CC BY-NC-SA 4.0 OpenITI Arabic, so ShareAlike applies; written for this library, so no third-party translation rights are involved.",
        // Not shown to readers until a qualified Maliki teacher has checked it against the Arabic.
        reviewStatus: "unreviewed",
      },
    ],
    excerptAr: "بسم الله الرحمن الرحيم وصلى الله على سيدنا محمد وآله وصحبه وسلم.",
  },
  {
    id: "risala",
    title: "Al-Risala",
    titleAr: "الرسالة",
    subtitle: "The Qayrawani primer",
    authorId: "ibn-abi-zayd",
    summary: "The Qayrawani primer: creed, fiqh, and manners in one matn.",
    description:
      "The classical Maliki primer students often open after a first manual of worship. Creed, fiqh, and manners in one matn. The text is not on this shelf yet.",
    status: "coming-soon",
    coverGradient:
      "linear-gradient(160deg, #14182a 0%, #24315c 55%, #8d7340 150%)",
    madhhab: "Maliki",
    originalLanguage: "Arabic",
    level: "Primer",
    subjects: ["creed", "manners", "fiqh"],
    translations: [],
  },
  {
    id: "khalil",
    title: "Mukhtasar Khalil",
    titleAr: "مختصر خليل",
    subtitle: "The central Maliki reference",
    authorId: "khalil",
    summary: "The compact reference later Maliki study turns on.",
    description:
      "The compact reference later Maliki study turns on. Dense, and not a starting point. Reserved here so the shelf has somewhere for it to land.",
    status: "coming-soon",
    coverGradient:
      "linear-gradient(165deg, #1a1014 0%, #4a2430 50%, #a68448 145%)",
    madhhab: "Maliki",
    originalLanguage: "Arabic",
    level: "Reference",
    subjects: ["fiqh"],
    translations: [],
  },
];

export function getBook(id: string) {
  return books.find((book) => book.id === id) ?? null;
}
