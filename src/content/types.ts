/**
 * Library content model.
 * Arabic books: text lives in Arabic text units, and a licensed translation can be attached without changing the
 * reader (add an entry to `translations` and look it up by `translationId`).
 * English books: text lives in prose units (`ProseBookContent`), with no Arabic layer and no translations.
 */

export type BookStatus = "readable" | "coming-soon";

export type SubjectId = "foundations" | "purification" | "prayer" | "creed" | "manners" | "fiqh" | "self";

export type Subject = {
  id: SubjectId;
  label: string;
  labelAr: string;
  blurb: string;
};

/** Who wrote a work. Biographical notes are added only when a source can be cited. */
export type Author = {
  id: string;
  name: string;
  /** The author's name in Arabic, where the library has it from a source. */
  nameAr?: string;
  /** A short form of a long name, for covers and cards, as the books themselves give it. */
  shortName?: string;
  /** Death year, as the source record gives it (AH). */
  diedAH?: number;
  /** Where `diedAH` comes from. */
  datingSource?: string;
  bio?: string;
};

/**
 * Review state of a translation. Only `verified` translations with complete
 * licence and review records are ever shown to readers (see `isPublishable`).
 */
export type ReviewStatus = "unreviewed" | "in-review" | "verified";

/** Who checked a translation against the Arabic, and when. */
export type TranslationReview = {
  reviewer: string;
  /** ISO date, YYYY-MM-DD. */
  reviewedOn: string;
  /** "full" only when every passage was checked against its Arabic. */
  scope: "full" | "partial";
  notes?: string;
};

/**
 * Metadata about one translation of a book. The words live in a separate
 * translation file (`src/content/translations/`), keyed by passage id, so
 * metadata, translation text and the generated Arabic stay apart.
 */
export type TranslationInfo = {
  translationId: string;
  /** BCP 47 language tag, e.g. "en", "fr". */
  language: string;
  /** Reader-facing language name, e.g. "English". */
  languageLabel: string;
  translator: string;
  /** Where the translation comes from (edition, publisher, URL). */
  source: string;
  /** The licence that actually covers the translation, never assumed from the Arabic. */
  license: string;
  licenseUrl?: string;
  /** Where permission is documented: a licence notice, contract reference, or written grant. */
  licenseEvidence: string;
  reviewStatus: ReviewStatus;
  /** Required before `reviewStatus` may be "verified". */
  review?: TranslationReview;
};

/** Translation text for one book, kept apart from the generated Arabic. */
export type TranslationFile = {
  bookId: string;
  translationId: string;
  language: string;
  /** Passage id (`TextUnit.id`) to translated text. Missing ids are untranslated passages. */
  passages: Record<string, string>;
  /** Translator's notes, by passage id. Shown beneath the passage's translation. */
  notes?: Record<string, string[]>;
  /** The translator's rendering of each chapter heading, by chapter id. */
  headings?: Record<string, string>;
};

/**
 * Bibliographic record of a book the library holds in English (an English edition, not an Arabic text).
 * Every field is copied from the edition's own title and copyright pages.
 */
export type BookEdition = {
  /** BCP 47 language tag of the text in the library. */
  language: "en";
  languageLabel: string;
  /** The book's full title as printed, including any subtitle. */
  fullTitle: string;
  author: string;
  translator: string;
  editor: string;
  copyright: string;
  isbn: string;
  edition: string;
  printer: string;
  /** The rights notice as printed. */
  rightsNotice: string;
  /** What the rights holder allows the library to do, who confirmed it, and when (YYYY-MM-DD). */
  permission: { scope: string; confirmedBy: string; confirmedOn: string };
};

export type Book = {
  id: string;
  title: string;
  /** The title in Arabic, for Arabic books. */
  titleAr?: string;
  subtitle: string;
  authorId: string;
  /** One or two sentences for cards and the shelf. */
  summary: string;
  /** Full description for the book page. */
  description: string;
  status: BookStatus;
  coverGradient: string;
  /** The school of law the book follows, where it follows one. */
  madhhab?: string;
  /** Language of the text the library holds: the original, for Arabic books. */
  originalLanguage: string;
  level: string;
  subjects: SubjectId[];
  /** Translation metadata. Empty until a licensed translation is added. */
  translations: TranslationInfo[];
  /** A short Arabic line for the shelf. Not a translation. */
  excerptAr?: string;
  /** Present for a book the library holds as an English edition. Its text is a `ProseBookContent`. */
  edition?: BookEdition;
};

/** Translation text attached to a unit at load time from a TranslationFile. */
export type Translation = {
  translationId: string;
  language: string;
  text: string;
  notes?: string[];
};

/** A chapter heading as rendered by one translation. */
export type HeadingTranslation = {
  translationId: string;
  language: string;
  text: string;
};

export type TextUnit = {
  id: string;
  number: number;
  arabic: string;
  arabicVowelled?: string;
  translations?: Translation[];
};

export type Chapter = {
  id: string;
  order: number;
  headingAr: string;
  headingEn: string;
  summaryEn: string;
  partEn: string;
  partAr: string;
  units: TextUnit[];
  headingTranslations?: HeadingTranslation[];
};

export type BookSource = {
  work: string;
  author: string;
  openiti: string;
  license: string;
  licenseUrl: string;
  note: string;
};

export type BookContent = {
  id: string;
  source: BookSource;
  chapters: Chapter[];
  /** Earlier passage ids mapped to the passage that now holds their words. */
  legacyIds?: Record<string, string>;
};

/**
 * One passage of an English book: a paragraph, a numbered item, a table, or a signature, as the print sets it.
 * `text` keeps the print's emphasis as inline marks: **bold**, *italic*, ***both***.
 */
export type ProseUnit = {
  id: string;
  number: number;
  text: string;
  /** A sub-heading the print sets above this passage. */
  heading?: string;
  kind?: "item" | "table" | "signature";
  /** Table cells, row by row; the first row is the header. */
  rows?: string[][];
  /** The printed page the passage starts on. */
  page: string;
};

/** A section of an English book: a part's opening, a chapter, an introduction, a summary or a conclusion. */
export type ProseChapter = {
  id: string;
  order: number;
  headingEn: string;
  /** The part this section belongs to, as printed. Empty outside the parts. */
  partEn: string;
  /** The printed page the section starts on. */
  page: string;
  units: ProseUnit[];
};

export type ProseSource = {
  work: string;
  title: string;
  author: string;
  translator: string;
  editor: string;
  copyright: string;
  isbn: string;
  edition: string;
  printer: string;
  rights: string;
  /** The pages of the source PDF this book occupies. */
  pdfPages: string;
};

export type ProseBookContent = {
  id: string;
  language: "en";
  source: ProseSource;
  chapters: ProseChapter[];
  legacyIds?: Record<string, string>;
};

/** Content of any readable book. */
export type ReadableContent = BookContent | ProseBookContent;

export function isProse(content: ReadableContent): content is ProseBookContent {
  return "language" in content && content.language === "en";
}

export function translationFor(unit: TextUnit, translationId: string) {
  return unit.translations?.find((item) => item.translationId === translationId) ?? null;
}

export type Classification = "fard" | "sunnah" | "fadila" | "condition" | "wajib" | "recommended";

export type GuideKind = "wudu" | "ghusl" | "tayammum" | "salah" | "posture";

export type GuideHighlight =
  | "tasmiya"
  | "siwak"
  | "niyyah"
  | "hands"
  | "mouth"
  | "nose"
  | "face"
  | "arms"
  | "head"
  | "ears"
  | "feet"
  | "fawr"
  | "dalk"
  | "najasa"
  | "private"
  | "upper"
  | "right-side"
  | "cover"
  | "body"
  | "earth"
  | "wipe-face"
  | "wipe-hands"
  | "elbows"
  | "takbir"
  | "standing"
  | "ruku"
  | "rise"
  | "sujud"
  | "sitting"
  | "qibla"
  | "awra"
  | "lean-stand"
  | "sit-free"
  | "sit-lean"
  | "lie-right"
  | "lie-left"
  | "lie-back";

export type GuideStep = {
  id: string;
  title: string;
  titleAr: string;
  classification: Classification;
  note: string;
  sourceUnitId: string;
  highlight: GuideHighlight;
};

export type Guide = {
  id: string;
  title: string;
  intro: string;
  kind: GuideKind;
  steps: GuideStep[];
};

export type DecisionChoice = {
  label: string;
  next: string;
};

export type DecisionNode = {
  id: string;
  prompt: string;
  sourceUnitId: string;
  /** What this node concludes. Present on a leaf. */
  result?: string;
  choices?: DecisionChoice[];
};

export type DecisionGuide = {
  id: string;
  title: string;
  intro: string;
  start: string;
  nodes: DecisionNode[];
};

export type WalkEntry = {
  label: string;
  unitId: string;
};

export type WalkStep = {
  unitId: string;
  pointer: string;
};

export type LineWalk = {
  id: string;
  title: string;
  intro: string;
  entries: WalkEntry[];
  steps: WalkStep[];
};

export type CheckItem = {
  id: string;
  label: string;
};

export type CheckCard = {
  id: string;
  title: string;
  intro: string;
  sourceUnitId: string;
  items: CheckItem[];
  closing: string;
};

export type DrillStep = {
  id: string;
  title: string;
  titleAr: string;
  classification: Classification;
  sourceUnitId: string;
};

export type Drill = {
  id: string;
  title: string;
  intro: string;
  steps: DrillStep[];
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
  sourceUnitId: string;
};

export type Quiz = {
  id: string;
  title: string;
  chapterId: string;
  questions: QuizQuestion[];
};

export type BookPractice = {
  bookId: string;
  intro: string;
  guides: Guide[];
  drills: Drill[];
  quizzes: Quiz[];
  decisions: DecisionGuide[];
  walks: LineWalk[];
  checks: CheckCard[];
};
