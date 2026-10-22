import test from "node:test";
import assert from "node:assert/strict";
import { books } from "../src/content/books";
import { authors } from "../src/content/authors";
import { getBookContent } from "../src/content/library";
import { bookMatches, readableLanguages } from "../src/lib/catalogue";
import {
  ARABIC_ONLY,
  availableTranslations,
  modeOptions,
  parseModeKey,
  pendingTranslations,
  resolveMode,
  translationText,
} from "../src/lib/translations";
import { positionFraction, resolveTarget, searchContent } from "../src/lib/reading";
import { foldArabic } from "../src/lib/arabic";
import type { Book, BookContent, TranslationInfo } from "../src/content/types";

const akhdari = books.find((b) => b.id === "akhdari")!;
const content = getBookContent("akhdari")!;

// Synthetic fixture. Not real translation content and never shipped.
const sampleInfo = (reviewStatus: TranslationInfo["reviewStatus"]): TranslationInfo => ({
  translationId: "en-sample",
  language: "en",
  languageLabel: "English",
  translator: "Test fixture",
  source: "tests",
  license: "test only",
  reviewStatus,
});
function withSample(reviewStatus: TranslationInfo["reviewStatus"], fill = true) {
  const book: Book = { ...akhdari, translations: [sampleInfo(reviewStatus)] };
  const copy: BookContent = JSON.parse(JSON.stringify(content));
  if (fill) {
    copy.chapters[0].units[0].translations = [
      { translationId: "en-sample", language: "en", text: "Sample line one." },
    ];
  }
  return { book, copy };
}

test("shipped Akhdari has no translation to show", () => {
  assert.deepEqual(availableTranslations(akhdari, content), []);
  assert.deepEqual(readableLanguages(akhdari, content), ["Arabic"]);
});

test("only verified translations with text are available", () => {
  const verified = withSample("verified");
  assert.equal(availableTranslations(verified.book, verified.copy).length, 1);
  assert.deepEqual(readableLanguages(verified.book, verified.copy), ["Arabic", "English"]);
  for (const status of ["unreviewed", "in-review"] as const) {
    const s = withSample(status);
    assert.equal(availableTranslations(s.book, s.copy).length, 0);
    assert.equal(pendingTranslations(s.book, s.copy).length, 1);
  }
  const empty = withSample("verified", false);
  assert.equal(availableTranslations(empty.book, empty.copy).length, 0);
});

test("translations align to Arabic by stable unit id", () => {
  const { copy } = withSample("verified");
  const first = copy.chapters[0].units[0];
  assert.equal(translationText(first, "en-sample"), "Sample line one.");
  assert.equal(translationText(copy.chapters[0].units[1], "en-sample"), null);
  assert.equal(first.id, content.chapters[0].units[0].id);
});

test("reading mode falls back to Arabic when the translation is gone", () => {
  assert.deepEqual(resolveMode(parseModeKey("both:en-sample"), []), ARABIC_ONLY);
  const { book, copy } = withSample("verified");
  const available = availableTranslations(book, copy);
  assert.deepEqual(resolveMode(parseModeKey("both:en-sample"), available), {
    kind: "both",
    translationId: "en-sample",
  });
  assert.deepEqual(parseModeKey("garbage"), ARABIC_ONLY);
  assert.deepEqual(modeOptions([]).map((o) => o.key), ["arabic"]);
  assert.deepEqual(modeOptions(available).map((o) => o.key), [
    "arabic",
    "both:en-sample",
    "translation:en-sample",
  ]);
});

test("catalogue filter", () => {
  const author = (b: Book) => authors.find((a) => a.id === b.authorId)!.name;
  const pick = (filter: Parameters<typeof bookMatches>[2]) =>
    books.filter((b) => bookMatches(b, author(b), filter)).map((b) => b.id);
  assert.deepEqual(pick({}), ["akhdari", "risala", "khalil"]);
  assert.deepEqual(pick({ query: "akhdari" }), ["akhdari"]);
  assert.deepEqual(pick({ query: "الأخضري" }), ["akhdari"]);
  assert.deepEqual(pick({ query: "اخضري" }), ["akhdari"]);
  assert.deepEqual(pick({ subject: "prayer" }), ["akhdari"]);
  assert.deepEqual(pick({ subject: "creed" }), ["risala"]);
  assert.deepEqual(pick({ subject: "manners", query: "khalil" }), []);
});

test("search ignores vowels and finds known text", () => {
  assert.ok(searchContent(content, "الصلاة").length > 5);
  assert.equal(searchContent(content, "ا").length, 0);
  assert.equal(searchContent(content, "zzzz").length, 0);
  const vowelled = content.chapters[0].units[0].arabicVowelled!;
  assert.equal(foldArabic(vowelled), foldArabic(content.chapters[0].units[0].arabic));
});

test("targets and progress", () => {
  assert.equal(resolveTarget(content, "nope"), null);
  assert.equal(resolveTarget(content, "tayammum")?.unit.id, "tayammum.1");
  assert.equal(resolveTarget(content, "tayammum.3")?.unit.id, "tayammum.3");
  assert.equal(positionFraction(content, null), 0);
  const last = content.chapters.at(-1)!.units.at(-1)!;
  assert.equal(positionFraction(content, last.id), 1);
});
