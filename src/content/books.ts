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
      "A short manual of worship according to Imam Malik. It opens with what an accountable person owes, then purification — wudu, ghusl, tayammum, menstruation, and postnatal bleeding — then the prayer: its times, its conditions, what it requires, and forgetfulness inside it. The Arabic is the OpenITI text, and the English is the library's own translation, reviewed before publication.",
    status: "readable",
    coverGradient:
      "linear-gradient(170deg, #1b4638 0%, #143629 100%)",
    madhhab: "Maliki",
    originalLanguage: "Arabic",
    level: "First text",
    subjects: ["foundations", "purification", "prayer"],
    translations: [
      {
        translationId: "en-zaibaitech-2026",
        language: "en",
        languageLabel: "English",
        translator: "Zaibaitech Library",
        source:
          "Zaibaitech Library bilingual edition (draft, October 2026): original English translation, language-reviewed. Paragraphing follows that edition.",
        license: "CC BY-NC-SA 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
        licenseEvidence:
          "The edition's title page: original translation by Zaibaitech Library, shared under CC BY-NC-SA 4.0 with the Arabic, non-commercial use only.",
        reviewStatus: "verified",
        review: {
          reviewer: "Zaibaitech Library language reviewer",
          reviewedOn: "2026-10-22",
          scope: "full",
          notes: "Approved for publication by the library's reviewer.",
        },
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
      "linear-gradient(170deg, #262f45 0%, #1c2335 100%)",
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
      "The compact reference later Maliki study turns on. Dense, and best read after the shorter primers. Planned for the library; its text is not here yet.",
    status: "coming-soon",
    coverGradient:
      "linear-gradient(170deg, #4a2a2e 0%, #381f22 100%)",
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
