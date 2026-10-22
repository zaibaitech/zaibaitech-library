import test from "node:test";
import assert from "node:assert/strict";
import { books } from "../src/content/books";
import { authors } from "../src/content/authors";
import { subjects } from "../src/content/subjects";
import { glossary } from "../src/content/glossary";
import { getBookContent, readableContentIds } from "../src/content/library";
import { getPractice, practiceBookIds } from "../src/content/practice/index";
import { foldArabic } from "../src/lib/arabic";
import { translationFiles } from "../src/content/translations";
import { validateTranslation } from "../src/lib/translation-validation";

test("catalogue integrity", () => {
  const ids = books.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const book of books) {
    assert.ok(authors.some((a) => a.id === book.authorId), `${book.id} author`);
    for (const s of book.subjects) assert.ok(subjects.some((x) => x.id === s), `${book.id} subject ${s}`);
    const content = getBookContent(book.id);
    if (book.status === "readable") assert.ok(content, `${book.id} readable needs content`);
    else assert.equal(content, null, `${book.id} forthcoming must have no content`);
    for (const info of book.translations) {
      assert.ok(info.license && info.source && info.translator, `${info.translationId} metadata`);
    }
  }
  assert.deepEqual(readableContentIds().sort(), books.filter((b) => b.status === "readable").map((b) => b.id).sort());
});

test("text units have stable, well-formed ids", () => {
  const content = getBookContent("akhdari")!;
  const seen = new Set<string>();
  for (const chapter of content.chapters) {
    // salah_title is a heading-only chapter: a part title with no passages of its own.
    chapter.units.forEach((unit, i) => {
      assert.equal(unit.id, `${chapter.id}.p${String(i + 1).padStart(2, "0")}`);
      assert.equal(unit.number, i + 1);
      assert.ok(!seen.has(unit.id));
      seen.add(unit.id);
      assert.ok(unit.arabic.trim().length > 0);
      for (const t of unit.translations ?? []) {
        const info = books.find((b) => b.id === "akhdari")!.translations.find((i) => i.translationId === t.translationId);
        assert.ok(info, `${unit.id}: translation ${t.translationId} has no metadata`);
      }
    });
  }
});

test("vowelled text is the same text as the unvowelled text", () => {
  const content = getBookContent("akhdari")!;
  for (const chapter of content.chapters) {
    for (const unit of chapter.units) {
      assert.ok(unit.arabicVowelled, unit.id);
      assert.equal(
        unit.arabicVowelled!.split("(").length,
        unit.arabic.split("(").length,
        `${unit.id} opening brackets`,
      );
      assert.equal(foldArabic(unit.arabicVowelled!).replace(/\s+/g, ""), foldArabic(unit.arabic).replace(/\s+/g, ""), unit.id);
    }
  }
});

test("licence and source credit travel with the text", () => {
  const content = getBookContent("akhdari")!;
  assert.equal(content.source.license, "CC BY-NC-SA 4.0");
  assert.match(content.source.openiti, /JK009285/);
});

test("practice and glossary point at real passages and chapters", () => {
  const content = getBookContent("akhdari")!;
  const unitIds = new Set(content.chapters.flatMap((c) => c.units.map((u) => u.id)));
  const chapterIds = new Set(content.chapters.map((c) => c.id));
  for (const term of glossary) if (term.chapterId) assert.ok(chapterIds.has(term.chapterId), term.id);
  for (const id of practiceBookIds()) {
    const json = JSON.stringify(getPractice(id));
    for (const m of Array.from(json.matchAll(/"(?:sourceUnitId|unitId)":"([^"]+)"/g))) {
      assert.ok(unitIds.has(m[1]), `practice cites missing unit ${m[1]}`);
    }
  }
});

test("every registered translation file validates", () => {
  for (const file of translationFiles) {
    const book = books.find((b) => b.id === file.bookId);
    assert.ok(book, `${file.translationId}: unknown book ${file.bookId}`);
    const report = validateTranslation(book!, getBookContent(book!.id)!, file);
    assert.deepEqual(report.errors, [], `${file.translationId} errors`);
  }
});

test("earlier passage ids still lead somewhere", () => {
  const content = getBookContent("akhdari")!;
  const ids = new Set(content.chapters.flatMap((c) => c.units.map((u) => u.id)));
  const legacy = Object.entries(content.legacyIds ?? {});
  assert.equal(legacy.length, 110, "every passage id from the earlier split is mapped");
  for (const [old, current] of legacy) {
    assert.match(old, /^[a-z_]+\.\d+$/);
    assert.ok(ids.has(current), `${old} -> ${current}`);
    assert.equal(old.split(".")[0], current.split(".")[0], "stays in its chapter");
  }
});

test("the published English translation covers every passage and has a dated review", () => {
  const file = translationFiles.find((f) => f.translationId === "en-zaibaitech-2026")!;
  const content = getBookContent("akhdari")!;
  const ids = content.chapters.flatMap((c) => c.units.map((u) => u.id));
  assert.deepEqual(Object.keys(file.passages), ids, "one translation per passage, in book order");
  assert.equal(Object.keys(file.headings ?? {}).length, content.chapters.length);
  for (const id of Object.keys(file.notes ?? {})) assert.ok(ids.includes(id));
  const info = books.find((b) => b.id === "akhdari")!.translations.find((t) => t.translationId === file.translationId)!;
  assert.equal(info.reviewStatus, "verified");
  assert.ok(info.review?.reviewer.trim(), "reviewer recorded");
  assert.match(info.review?.reviewedOn ?? "", /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(info.review?.scope, "full");
});
