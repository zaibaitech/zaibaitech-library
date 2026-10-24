import type { Book, BookEdition } from "./types";

/** Visible credit required on every surface that shows the Arabic text. */
export const TEXT_CREDIT = {
  label: "Arabic text from OpenITI, CC BY-NC-SA 4.0",
  href: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  openiti: "0983IbnMuhammadSahgirAkhdari.MukhtasarFiCibadat.JK009285-ara1",
};

/** Shared by the three books of Omar Ceesay, from the edition's title and copyright pages. */
const CEESAY_EDITION: Omit<BookEdition, "fullTitle" | "editor"> = {
  language: "en",
  languageLabel: "English",
  author: "Abu Abdur-Rahman Omar Ibn Alhagie Abdullah Ceesay Ibn Alhagie Jibel Fana Sow Ceesay",
  translator: "Sidy Ahmad Gassama",
  copyright: "© Omar Ceesay",
  // The edition prints this one ISBN, on the copyright page of the three-book volume (PDF page 3). It identifies
  // the complete edition; no separate ISBN is printed for any of the three books.
  isbn: "978-9983-94-606-2",
  isbnLabel: "ISBN of the complete edition",
  isbnNote: "Issued for the complete three-book edition; no separate ISBN is printed for this book.",
  edition: "First Edition 1447H / 2026",
  printer: "DBC Printing Corporation, Banjul, The Gambia",
  rightsNotice:
    "All rights reserved. No part of this publication may be reproduced, stored in a retrieval system, or transmitted, in any form, or by any means, electronic, mechanical, photocopying, recording or otherwise, without the prior permission of the publisher.",
  permission: {
    scope: "Full public display of the complete text in this library",
    confirmedBy: "The library owner, on the rights holder's behalf",
    confirmedOn: "2026-10-23",
  },
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
    id: "reviving-religion",
    title: "Reviving Religion in the Self and Life",
    subtitle: "The Balanced Scale: A Contemporary Reading of Islam, a Renewal of Religion, and Its Effect on Life",
    authorId: "omar-ceesay",
    summary: "Understanding religion in an age of change: monotheism, faith, the acts of worship, and Islam in contemporary life.",
    description:
      "Ten parts on understanding religion in an age of transformation: monotheism as the centre of the whole structure, faith between knowledge and submission, the acts of worship between form and function — prayer, zakat, fasting and Hajj — Islam and the system of contemporary life, and the move from understanding to action. English translation by Sidy Ahmad Gassama.",
    status: "readable",
    coverGradient: "linear-gradient(170deg, #20434f 0%, #17323b 100%)",
    originalLanguage: "English",
    level: "General reader",
    subjects: ["foundations", "self"],
    translations: [],
    edition: {
      ...CEESAY_EDITION,
      fullTitle:
        "Reviving Religion in the Self and Life. The Balanced Scale: A Contemporary Reading of Islam, a Renewal of Religion, and Its Effect on Life",
      editor: "Bai Lamin Dondeh",
    },
  },
  {
    id: "knowing-the-self",
    title: "Knowing the Self: The Path to Uprightness",
    subtitle: "The self, the stages of life, and uprightness",
    authorId: "omar-ceesay",
    summary: "The human being between the pull of the earth and the pull of the heaven, through every stage of life.",
    description:
      "Seven parts on the human being between the pull of the earth and the pull of the heaven: the stages of life and the trials of each, from childhood to advanced old age, the just educational balance between them, and uprightness amid environment and society. English translation by Sidy Ahmad Gassama.",
    status: "readable",
    coverGradient: "linear-gradient(170deg, #3d3350 0%, #2c253b 100%)",
    originalLanguage: "English",
    level: "General reader",
    subjects: ["self"],
    translations: [],
    edition: {
      ...CEESAY_EDITION,
      fullTitle: "Knowing the Self: The Path to Uprightness",
      editor: "Dr. Alieu Gibba",
    },
  },
  {
    id: "balance-of-stations",
    title: "The Balance of Spiritual Stations in the Muslim’s Life",
    subtitle: "Servitude, belonging, emulation, and receiving knowledge from a sheikh",
    authorId: "omar-ceesay",
    summary: "Four stations of a Muslim’s life: servitude, belonging, emulation, and learning from a sheikh.",
    description:
      "Four parts, one for each station: the Muslim as a servant of Allah, Mighty and Sublime; as one who belongs to Islam, as identity and as method; as one who emulates the Messenger ﷺ; and as a seeker of knowledge raised by an educator, the sheikh as a model. With a summary, a conclusion, and the list of references. English translation by Sidy Ahmad Gassama.",
    status: "readable",
    coverGradient: "linear-gradient(170deg, #4a3b22 0%, #382c19 100%)",
    originalLanguage: "English",
    level: "General reader",
    subjects: ["self"],
    translations: [],
    edition: {
      ...CEESAY_EDITION,
      fullTitle:
        "The Balance of Spiritual Stations in the Muslim’s Life. Servitude | Belonging | Emulation | Receiving Knowledge from a Sheikh",
      editor: "Muhammed MK Kah",
    },
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
