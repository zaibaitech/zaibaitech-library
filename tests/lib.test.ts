import test from "node:test";
import assert from "node:assert/strict";
import { books } from "../src/content/books";
import { authors } from "../src/content/authors";
import { getBookContent } from "../src/content/library";
import raw from "../src/content/books/akhdari.json";
import { bookMatches, bookTopics, readableLanguages } from "../src/lib/catalogue";
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
import { foldArabic, segmentTerms } from "../src/lib/arabic";
import { glossary } from "../src/content/glossary";
import type { Book, BookContent, TranslationFile, TranslationInfo } from "../src/content/types";
import { attachTranslations, isPublishable, publicContent, publishBlockers } from "../src/lib/translations";
import { validateTranslation } from "../src/lib/translation-validation";

const akhdari = books.find((b) => b.id === "akhdari")!;
// The generated Arabic alone: fixtures attach their own translations to it.
const content = raw as BookContent;
// What the app actually loads, with registered translation files attached.
const shipped = getBookContent("akhdari")!;

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
    fill ? [sampleFile({ "basmala_hamdala.p01": "Sample line one." })] : [],
  );
  return { book, copy };
}

test("the reviewed English translation is published with its notes and headings", () => {
  const id = "en-zaibaitech-2026";
  const info = akhdari.translations.find((t) => t.translationId === id);
  assert.ok(info, "declared");
  assert.equal(isPublishable(info!), true, publishBlockers(info!).join("; "));
  assert.deepEqual(availableTranslations(akhdari, shipped).map((t) => t.translationId), [id]);
  assert.deepEqual(readableLanguages(akhdari, shipped), ["Arabic", "English"]);
  const shown = publicContent(akhdari, shipped);
  const units = shown.chapters.flatMap((c) => c.units);
  assert.ok(units.every((u) => u.translations?.some((t) => t.translationId === id)), "every passage has its English");
  assert.equal(units.filter((u) => u.translations?.some((t) => t.notes?.length)).length, 6);
  assert.equal(shown.chapters.filter((c) => c.headingTranslations?.length).length, shown.chapters.length);
  // withdrawing the review hides all three again
  const withdrawn: Book = { ...akhdari, translations: [{ ...info!, reviewStatus: "in-review" }] };
  assert.equal(JSON.stringify(publicContent(withdrawn, shipped)).includes(id), false);
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
  assert.equal(resolveTarget(content, "tayammum")?.unit.id, "tayammum.p01");
  assert.equal(resolveTarget(content, "tayammum.p03")?.unit.id, "tayammum.p03");
  // an id from the earlier split resolves to the passage that now holds its words
  assert.equal(resolveTarget(content, "tayammum.3")?.unit.id, "tayammum.p04");
  assert.equal(resolveTarget(content, "sahw_forgetfulness.7")?.unit.id, "sahw_forgetfulness.p11");
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
  const copy = attachTranslations(content, [sampleFile({ "basmala_hamdala.p01": "Sample." })]);
  assert.deepEqual(availableTranslations(book, copy), []);
});

test("attachTranslations ignores unknown ids and blank text, and leaves the Arabic alone", () => {
  const copy = attachTranslations(content, [sampleFile({ "nope.1": "x", "basmala_hamdala.p02": "  " })]);
  assert.equal(copy.chapters[0].units[1].translations, undefined);
  assert.equal(JSON.stringify(copy).includes('"nope.1"'), false);
  const filled = attachTranslations(content, [sampleFile({ "basmala_hamdala.p02": "Two." })]);
  assert.equal(filled.chapters[0].units[1].arabic, content.chapters[0].units[1].arabic);
  assert.equal(content.chapters[0].units[1].translations, undefined, "input not mutated");
});

test("validator catches misalignment and bad text", () => {
  const book: Book = { ...akhdari, translations: [sampleInfo("in-review")] };
  const report = validateTranslation(book, content, sampleFile({
    "basmala_hamdala.p02": "Second.",
    "basmala_hamdala.p01": "First.",
    "ghost.9": "Nowhere.",
    "tayammum.p01": "",
    "tayammum.p02": "TODO translate",
    "tayammum.p03": content.chapters.find((c) => c.id === "tayammum")!.units[2].arabic,
  }));
  const all = report.errors.join("\n");
  assert.match(all, /ghost\.9" does not exist/);
  assert.match(all, /tayammum\.p01" is empty/);
  assert.match(all, /tayammum\.p02" contains placeholder/);
  assert.match(all, /tayammum\.p03" is mostly Arabic/);
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
  assert.match(validateTranslation(fullClaim, content, sampleFile({ "basmala_hamdala.p01": "One." })).errors.join(), /scope is "full"/);
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
  const file = sampleFile({ "basmala_hamdala.p01": "Unreviewed words." });
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

test("validator checks notes and headings", () => {
  const book: Book = { ...akhdari, translations: [sampleInfo("in-review")] };
  const report = validateTranslation(book, content, {
    ...sampleFile({ "basmala_hamdala.p01": "One." }),
    notes: { "basmala_hamdala.p01": ["A note."], "basmala_hamdala.p02": ["Orphan note."], "ghost.p01": [" "] },
    headings: { basmala_hamdala: "Opening", nowhere: "X", tayammum: " " },
  });
  const all = report.errors.join("\n");
  assert.match(all, /notes for "basmala_hamdala\.p02": the passage has no translation/);
  assert.match(all, /notes for "ghost\.p01": no such passage/);
  assert.match(all, /every note must be non-empty/);
  assert.match(all, /heading for "nowhere": no such chapter/);
  assert.match(all, /heading for "tayammum" is empty/);
  assert.doesNotMatch(all, /basmala_hamdala\.p01/);
});

test("glossary links ghusl only where the word is vowelled as ghusl", () => {
  const linked = (text: string) => segmentTerms(text, glossary).filter((s) => s.termId === "ghusl").map((s) => s.text);
  assert.deepEqual(linked("وَيَجِبُ الْغُسْلِ"), ["الْغُسْلِ"]);
  // washing a limb, the passive verb, and an unvowelled form are not the full wash
  assert.deepEqual(linked("وَغَسْلُ الْوَجْهِ"), []);
  assert.deepEqual(linked("غُسِلَ"), []);
  assert.deepEqual(linked("غسل"), []);
  // other terms are unaffected
  assert.ok(segmentTerms("الدَّلْكُ", glossary).some((s) => s.termId === "dalk"));
});

test("library search finds a book by the topics of its chapters", () => {
  const book = books.find((b) => b.id === "akhdari")!;
  const name = authors.find((a) => a.id === book.authorId)!.name;
  const topics = bookTopics(getBookContent("akhdari"));
  assert.equal(bookMatches(book, name, { query: "wudu" }), false);
  assert.equal(bookMatches(book, name, { query: "wudu" }, topics), true);
  assert.equal(bookMatches(book, name, { query: "tayammum" }, topics), true);
  assert.equal(bookMatches(book, name, { query: "zzzz" }, topics), false);
});
