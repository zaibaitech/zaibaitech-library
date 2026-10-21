/**
 * Library content model.
 * Book text lives in Arabic text units. A licensed translation can be attached
 * later without changing the reader: add an entry to `translations` and look it
 * up by `translationId`. None are shipped with this MVP.
 */

export type BookStatus = "readable" | "coming-soon";

export type Book = {
  id: string;
  title: string;
  titleAr: string;
  subtitle: string;
  author: string;
  authorAr: string;
  description: string;
  status: BookStatus;
  coverGradient: string;
  chapterCount: number;
  madhhab: string;
  languages: string[];
  level: string;
  /** A short Arabic line for the shelf. Not a translation. */
  excerptAr?: string;
};

export type Translation = {
  translationId: string;
  language: string;
  text: string;
  translator?: string;
  license?: string;
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
};

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
