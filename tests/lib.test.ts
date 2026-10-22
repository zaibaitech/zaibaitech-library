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
import type { Book, BookContent, TranslationFile, TranslationInfo } from "../src/content/types";
import { attachTranslations, isPublishable, publicContent, publishBlockers } from "../src/lib/translations";
import { validateTranslation } from "../src/lib/translation-validation";

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
  licenseEvidence: "test fixture, no real permission",
  reviewStatus,
  review: { reviewer: "Test reviewer", reviewedOn: "2026-01-01", scope: "partial" },
});
const sampleFile = (passages: Record<string, string>): TranslationFile => ({
  bookId: "akhdari",
  translationId: "en-sample",
  language: "en",
  passages,
});
function withSample(reviewStatus: TranslationInfo["reviewStatus"], fill = true) {
  const book: Book = { ...akhdari, translations: [sampleInfo(reviewStatus)] };
  const copy: BookContent = attachTranslations(
    content,
    fill ? [sampleFile({ "basmala_hamdala.1": "Sample line one." })] : [],
  );
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

test("verified status alone is not enough to publish", () => {
  const base = sampleInfo("verified");
  assert.equal(isPublishable(base), true);
  assert.equal(isPublishable({ ...base, review: undefined }), false);
  assert.equal(isPublishable({ ...base, licenseEvidence: " " }), false);
  assert.equal(isPublishable({ ...base, license: "" }), false);
  assert.equal(isPublishable({ ...base, review: { ...base.review!, reviewedOn: "soon" } }), false);
  assert.match(publishBlockers(sampleInfo("in-review")).join(), /in-review/);
  const book: Book = { ...akhdari, translations: [{ ...base, review: undefined }] };
  const copy = attachTranslations(content, [sampleFile({ "basmala_hamdala.1": "Sample." })]);
  assert.deepEqual(availableTranslations(book, copy), []);
});

test("attachTranslations ignores unknown ids and blank text, and leaves the Arabic alone", () => {
  const copy = attachTranslations(content, [sampleFile({ "nope.1": "x", "basmala_hamdala.2": "  " })]);
  assert.equal(copy.chapters[0].units[1].translations, undefined);
  assert.equal(JSON.stringify(copy).includes('"nope.1"'), false);
  const filled = attachTranslations(content, [sampleFile({ "basmala_hamdala.2": "Two." })]);
  assert.equal(filled.chapters[0].units[1].arabic, content.chapters[0].units[1].arabic);
  assert.equal(content.chapters[0].units[1].translations, undefined, "input not mutated");
});

test("validator catches misalignment and bad text", () => {
  const book: Book = { ...akhdari, translations: [sampleInfo("in-review")] };
  const report = validateTranslation(book, content, sampleFile({
    "basmala_hamdala.2": "Second.",
    "basmala_hamdala.1": "First.",
    "ghost.9": "Nowhere.",
    "tayammum.1": "",
    "tayammum.2": "TODO translate",
    "tayammum.3": content.chapters.find((c) => c.id === "tayammum")!.units[2].arabic,
  }));
  const all = report.errors.join("\n");
  assert.match(all, /ghost\.9" does not exist/);
  assert.match(all, /tayammum\.1" is empty/);
  assert.match(all, /tayammum\.2" contains placeholder/);
  assert.match(all, /tayammum\.3" is mostly Arabic/);
  assert.match(report.warnings.join(), /out of book order/);
  assert.match(report.warnings.join(), /untranslated/);
  assert.match(report.publishBlockers.join(), /in-review/);

  const wrong = validateTranslation(book, content, { ...sampleFile({}), translationId: "en-other", language: "fr" });
  assert.match(wrong.errors.join(), /not declared/);
  const lang = validateTranslation(book, content, { ...sampleFile({}), language: "fr" });
  assert.match(lang.errors.join(), /does not match metadata language/);

  const fullClaim: Book = {
    ...akhdari,
    translations: [{ ...sampleInfo("verified"), review: { reviewer: "R", reviewedOn: "2026-01-01", scope: "full" } }],
  };
  assert.match(validateTranslation(fullClaim, content, sampleFile({ "basmala_hamdala.1": "One." })).errors.join(), /scope is "full"/);
});

test("validator flags a passage whose length does not fit its Arabic", () => {
  const book: Book = { ...akhdari, translations: [sampleInfo("in-review")] };
  const units = content.chapters.flatMap((c) => c.units).slice(0, 8);
  const passages: Record<string, string> = {};
  for (const unit of units) passages[unit.id] = "w".repeat(unit.arabic.length);
  passages[units[3].id] = "Too short.";
  const report = validateTranslation(book, content, sampleFile(passages));
  assert.equal(report.errors.length, 0);
  assert.match(report.warnings.join(), new RegExp(`${units[3].id.replace(".", "\\.")}" is unusually short`));
});

test("unpublishable translation text never reaches the reader payload", () => {
  const file = sampleFile({ "basmala_hamdala.1": "Unreviewed words." });
  const copy = attachTranslations(content, [file]);
  for (const info of [sampleInfo("in-review"), sampleInfo("unreviewed"), { ...sampleInfo("verified"), review: undefined }]) {
    const book: Book = { ...akhdari, translations: [info] };
    assert.equal(JSON.stringify(publicContent(book, copy)).includes("Unreviewed words."), false, info.reviewStatus);
  }
  const ok: Book = { ...akhdari, translations: [sampleInfo("verified")] };
  assert.equal(JSON.stringify(publicContent(ok, copy)).includes("Unreviewed words."), true);
  // undeclared translation ids are dropped too
  const stray = attachTranslations(content, [{ ...file, translationId: "en-stray" }]);
  assert.equal(JSON.stringify(publicContent(ok, stray)).includes("Unreviewed words."), false);
});
