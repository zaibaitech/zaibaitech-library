import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { books, getBook } from "../src/content/books";
import { getAuthor } from "../src/content/authors";
import { getBookContent, getReadableContent, readableContentIds } from "../src/content/library";
import { isProse, type ProseBookContent } from "../src/content/types";
import { readableLanguages } from "../src/lib/catalogue";
import { proseText, resolveTarget, searchProse } from "../src/lib/reading";

/**
 * The three English books of Omar Ceesay, built from the printed edition's text layer
 * (content/sources/three-books/pages.json) by scripts/build-three-books.mjs.
 */

type Snapshot = {
  source: { sha256: string; pages: number };
  pages: {
    pdfPage: number;
    printed: string | null;
    lines: { top: number; x0: number; size: number; runs: [string, string][] }[];
    tables: { top: number; rows: string[][] }[];
  }[];
};
type Config = {
  books: { id: string; title: string; editor: string; firstPdfPage: number; lastPdfPage: number; skipPdfPages: number[] }[];
};

const dir = "content/sources/three-books";
const snapshot: Snapshot = JSON.parse(fs.readFileSync(`${dir}/pages.json`, "utf8"));
const config: Config = JSON.parse(fs.readFileSync(`${dir}/books.json`, "utf8"));
const corrections: {
  id: string;
  was: string;
  now: string;
  status: string;
  reason: string;
  pdfPages: number[];
  pages?: string[];
  evidence?: { pdfCharacter: string; elsewhere: string; context: string[] };
  confirmation?: { status: string; question: string };
}[] =
  JSON.parse(fs.readFileSync(`${dir}/corrections.json`, "utf8")).corrections;

const EXPECTED = [
  { id: "reviving-religion", title: "Reviving Religion in the Self and Life", editor: "Bai Lamin Dondeh", parts: 10 },
  { id: "knowing-the-self", title: "Knowing the Self: The Path to Uprightness", editor: "Dr. Alieu Gibba", parts: 7 },
  { id: "balance-of-stations", title: "The Balance of Spiritual Stations in the Muslim’s Life", editor: "Muhammed MK Kah", parts: 4 },
];

const content = (id: string) => {
  const found = getReadableContent(id);
  assert.ok(found && isProse(found), `${id} is an English book`);
  return found as ProseBookContent;
};

test("the snapshot is the whole printed PDF", () => {
  assert.equal(snapshot.source.pages, 236);
  assert.equal(snapshot.pages.length, 236);
  assert.match(snapshot.source.sha256, /^[0-9a-f]{64}$/);
});

test("the committed books are what the build makes from the snapshot", () => {
  execFileSync("node", ["scripts/build-three-books.mjs", "--check"], { stdio: "pipe" });
});

test("the three books are in the catalogue, readable, with the edition's own details", () => {
  for (const expected of EXPECTED) {
    const book = getBook(expected.id);
    assert.ok(book, expected.id);
    assert.equal(book.title, expected.title);
    assert.equal(book.status, "readable");
    assert.ok(readableContentIds().includes(book.id));
    assert.equal(getBookContent(book.id), null, "not registered as an Arabic text");
    assert.equal(book.titleAr, undefined, "no Arabic title is claimed");
    assert.equal(book.translations.length, 0, "the English is the book itself, not a translation layer");
    assert.deepEqual(readableLanguages(book, content(book.id)), ["English"]);
    const edition = book.edition!;
    assert.ok(edition, `${book.id} edition`);
    assert.equal(edition.author, "Abu Abdur-Rahman Omar Ibn Alhagie Abdullah Ceesay Ibn Alhagie Jibel Fana Sow Ceesay");
    assert.equal(edition.translator, "Sidy Ahmad Gassama");
    assert.equal(edition.editor, expected.editor);
    assert.equal(edition.copyright, "© Omar Ceesay");
    assert.equal(edition.isbn, "978-9983-94-606-2");
    // The one printed ISBN belongs to the complete three-book edition and is labelled so, never as this book's own.
    assert.equal(edition.isbnLabel, "ISBN of the complete edition");
    assert.match(edition.isbnNote ?? "", /complete three-book edition; no separate ISBN is printed for this book/);
    assert.equal(edition.edition, "First Edition 1447H / 2026");
    assert.match(edition.rightsNotice, /^All rights reserved\./);
    assert.match(edition.permission.confirmedOn, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(getAuthor(book.authorId)?.name, edition.author);
    // The same details travel with the text.
    const source = content(book.id).source;
    assert.equal(source.title, expected.title);
    assert.equal(source.editor, expected.editor);
    assert.equal(source.isbn, edition.isbn);
    assert.equal(source.copyright, edition.copyright);
  }
  assert.equal(books.filter((b) => b.edition).length, 3);
});

test("each editor and title is as printed on that book's title page", () => {
  for (const book of config.books) {
    const titlePage = snapshot.pages[book.firstPdfPage - 1];
    const text = titlePage.lines.map((line) => line.runs.map((r) => r[0]).join("")).join(" ");
    assert.ok(text.includes(book.editor), `${book.id}: editor ${book.editor} on PDF page ${book.firstPdfPage}`);
    assert.ok(text.includes("Sidy Ahmad Gassama"), `${book.id}: translator`);
    assert.ok(text.includes("First Edition 1447H / 2026"), `${book.id}: edition`);
    const titleWords = book.title.replace(/[:’]/g, " ").split(/\s+/).filter(Boolean);
    for (const word of titleWords) assert.ok(text.includes(word), `${book.id}: title word "${word}"`);
  }
});

test("the edition prints one ISBN, once, on the volume's copyright page", () => {
  const pageText = (page: Snapshot["pages"][number]) => page.lines.map((line) => line.runs.map((r) => r[0]).join("")).join(" ");
  const withIsbn = snapshot.pages.filter((page) => /ISBN/.test(pageText(page)));
  assert.deepEqual(withIsbn.map((page) => page.pdfPage), [3]);
  assert.deepEqual(pageText(withIsbn[0]).match(/97[89][-\d]{10,}/g), ["978-9983-94-606-2"]);
});

test("each editor is named only on their own book's title page", () => {
  const titlePages = config.books.map((book) => snapshot.pages[book.firstPdfPage - 1]);
  const text = (page: Snapshot["pages"][number]) => page.lines.map((line) => line.runs.map((r) => r[0]).join("")).join(" ");
  config.books.forEach((book, i) => {
    titlePages.forEach((page, j) => {
      assert.equal(text(page).includes(`Edited By: ${book.editor}`), i === j, `${book.editor} on PDF page ${page.pdfPage}`);
    });
  });
});

test("every word of every page survives, in order, in the right book", () => {
  // Letters, digits and punctuation only: line breaks and the joining of lines are the build's to decide.
  const norm = (s: string) => s.replace(/\*+/g, "").replace(/[‪-‮]/g, "").replace(/\s+/g, "");
  const applied = corrections.filter((c) => c.status === "applied");
  for (const book of config.books) {
    let source = "";
    for (const page of snapshot.pages) {
      if (page.pdfPage < book.firstPdfPage || page.pdfPage > book.lastPdfPage || book.skipPdfPages.includes(page.pdfPage)) continue;
      const items = [
        ...page.lines.filter((l) => l.size >= 11.5 || l.size <= 8.5).map((l) => ({ top: l.top, text: l.runs.map((r) => r[0]).join("") })),
        ...page.tables.map((t) => ({ top: t.top, text: t.rows.map((r) => r.join("")).join("") })),
      ].sort((a, b) => a.top - b.top);
      let text = items.map((i) => i.text).join("");
      for (const c of applied) if (c.pdfPages.includes(page.pdfPage)) text = text.split(c.was).join(c.now);
      source += text;
    }
    let built = "";
    for (const chapter of content(book.id).chapters) {
      built += chapter.headingEn;
      for (const unit of chapter.units) built += (unit.heading ?? "") + (unit.rows ? unit.rows.map((r) => r.join("")).join("") : unit.text);
    }
    assert.equal(norm(built).length, norm(source).length, `${book.id}: same length`);
    assert.ok(norm(built) === norm(source), `${book.id}: same text in the same order`);
  }
});

test("the skipped pages are only the title, copyright, contents and blank pages", () => {
  const skipped = config.books.flatMap((b) => b.skipPdfPages);
  assert.deepEqual(skipped, [2, 3, 4, 5, 8, 84, 147]);
  for (const n of skipped) {
    const page = snapshot.pages[n - 1];
    const text = page.lines.map((l) => l.runs.map((r) => r[0]).join("")).join(" ");
    const kind =
      /Translated By:/.test(text) ? "title" : /ISBN/.test(text) ? "copyright" : /Table of Contents|\.{5,}/.test(text) ? "contents" : text.trim() === "" ? "blank" : "other";
    assert.notEqual(kind, "other", `PDF page ${n} holds text that would be lost: ${text.slice(0, 80)}`);
  }
});

test("part titles and their pages agree with the printed table of contents", () => {
  // The contents (PDF pages 4–5) list each book's parts with page numbers.
  const tocLines = [4, 5].flatMap((n) => snapshot.pages[n - 1].lines.map((l) => l.runs.map((r) => r[0]).join("")));
  const toc = tocLines.join(" ").replace(/\s+/g, " ");
  // Dot leaders are not always printed ("…Two Opposing Sides118"), so an entry runs to the next one.
  const entries = toc
    .split(/(?=Part \d+: |Book \d+: |Introduction to the Book|Complete Summary|Comprehensive Summary|Conclusion of the Book|References and Sources)/)
    .map((segment) => /^(Part \d+: .*?)[\s.]*(\d+)\s*$/.exec(segment.trim()))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => ({ title: m[1].trim(), page: m[2] }));
  assert.equal(entries.length, 21, "21 parts across the three books");
  const parts = config.books.flatMap((b) =>
    content(b.id).chapters.filter((c) => c.partEn !== "" && c.partEn === c.headingEn).map((c) => ({ title: c.headingEn, page: c.page })),
  );
  assert.equal(parts.length, entries.length);
  parts.forEach((part, i) => {
    const words = (s: string) => s.replace(/[^A-Za-z0-9 ]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
    assert.equal(words(part.title), words(entries[i].title), `part ${i + 1} title`);
    assert.equal(part.page, entries[i].page, `${part.title}: page`);
  });
  for (const expected of EXPECTED) {
    const count = content(expected.id).chapters.filter((c) => c.partEn !== "" && c.partEn === c.headingEn).length;
    assert.equal(count, expected.parts, `${expected.id} parts`);
  }
});

test("sections and passages have unique, stable, well-formed ids and no empty text", () => {
  for (const { id } of EXPECTED) {
    const book = content(id);
    const chapterIds = new Set<string>();
    const unitIds = new Set<string>();
    book.chapters.forEach((chapter, i) => {
      assert.equal(chapter.order, i + 1);
      assert.match(chapter.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${id}: section id ${chapter.id}`);
      assert.ok(!chapterIds.has(chapter.id), `${id}: duplicate section ${chapter.id}`);
      chapterIds.add(chapter.id);
      assert.ok(chapter.headingEn.trim(), `${chapter.id} heading`);
      assert.ok(chapter.units.length > 0, `${chapter.id} has passages`);
      assert.match(chapter.page, /^([ivx]+|\d+)$/, `${chapter.id} page`);
      chapter.units.forEach((unit, n) => {
        assert.equal(unit.id, `${chapter.id}.p${String(n + 1).padStart(2, "0")}`);
        assert.equal(unit.number, n + 1);
        assert.ok(!unitIds.has(unit.id), `duplicate ${unit.id}`);
        unitIds.add(unit.id);
        assert.ok(proseText(unit).trim().length > 0, `${unit.id} text`);
        if (unit.kind === "table") assert.ok(unit.rows && unit.rows.length > 1 && unit.rows.every((r) => r.length === unit.rows![0].length));
        // Emphasis marks come in pairs and never leak characters the print does not have.
        assert.equal((unit.text.match(/\*/g) ?? []).length % 2, 0, `${unit.id} unbalanced emphasis`);
        assert.ok(!/\(cid:\d+\)|[‪-‮�]/.test(unit.text), `${unit.id} has an unreadable character`);
      });
    });
  }
});

test("section ids people may already link to stay put", () => {
  // Deep links in the wild depend on these; change them only with legacy ids.
  assert.ok(resolveTarget(content("reviving-religion"), "p3-ch5")?.unit.id === "p3-ch5.p01");
  assert.ok(resolveTarget(content("knowing-the-self"), "part-6")?.unit.id === "part-6.p01");
  assert.ok(resolveTarget(content("balance-of-stations"), "references-and-sources"));
  const ids = (id: string) => content(id).chapters.map((c) => c.id);
  assert.deepEqual(ids("reviving-religion").slice(0, 4), ["translators-preface", "introduction-to-the-book", "part-1", "p1-ch1"]);
  assert.ok(ids("knowing-the-self").includes("p6-ch1"), "“Chapter One” keeps the numbered id");
  assert.equal(ids("balance-of-stations").at(-1), "references-and-sources");
});

test("the references table has all 71 works", () => {
  const refs = content("balance-of-stations").chapters.at(-1)!;
  const table = refs.units.find((u) => u.kind === "table")!;
  assert.deepEqual(table.rows![0], ["No.", "Title", "Author"]);
  assert.equal(table.rows!.length, 72);
  assert.deepEqual(table.rows!.at(-1), ["71.", "Zad Al-Ma’ad", "Imam Ibn Al-Qayyim"]);
});

test("every correction is recorded with its reason and is used", () => {
  for (const c of corrections) {
    assert.ok(c.reason.length > 20 && c.pdfPages.length > 0 && c.was && c.now, c.id);
  }
  const all = config.books.map((b) => JSON.stringify(content(b.id))).join("");
  assert.ok(!all.includes("(cid:0)"));
  const restored = (all.match(/the Messenger of Allah ﷺ|the Messenger ﷺ/g) ?? []).length;
  assert.ok(restored > 3);
});

test("c1: ﷺ where the print shows an empty box is recorded with its evidence and awaits the publisher", () => {
  const c1 = corrections.find((c) => c.id === "c1")!;
  assert.equal(c1.was, "(cid:0)");
  assert.equal(c1.now, "ﷺ");
  assert.deepEqual(c1.pdfPages, [50, 151, 222]);
  assert.deepEqual(c1.pages, ["40", "141", "212"]);
  assert.equal(c1.evidence?.context.length, 3);
  assert.match(c1.evidence!.pdfCharacter, /glyph 0 .*Italic/);
  assert.equal(c1.confirmation?.status, "awaiting publisher");
  // The PDF has exactly these three missing glyphs, all in the italic face, and ﷺ is never set in italic there.
  const cids = snapshot.pages.flatMap((page) =>
    page.lines.flatMap((line) => line.runs.filter((r) => r[0].includes("(cid:")).map((r) => ({ page: page.pdfPage, font: r[1] }))),
  );
  assert.deepEqual(cids.map((c) => c.page), [50, 151, 222]);
  // In the library each one is ﷺ inside its italic quotation, and nothing else in that passage changed.
  const restored = [
    { pdfPage: 50, book: "reviving-religion", id: "p6-ch2.p03" },
    { pdfPage: 151, book: "balance-of-stations", id: "introduction-to-the-book.p14" },
    { pdfPage: 222, book: "balance-of-stations", id: "p4-ch3.p16" },
  ];
  for (const { pdfPage, book, id } of restored) {
    const unit = content(book).chapters.flatMap((ch) => ch.units).find((u) => u.id === id);
    assert.ok(unit, id);
    assert.ok(/\*[^*]*ﷺ[^*]*\*/.test(unit.text), `${id} (PDF page ${pdfPage}): ﷺ inside the italic quotation`);
    assert.ok(!unit.text.includes("(cid:"), id);
  }
});

test("English search finds words regardless of case and transliteration marks", () => {
  const stations = content("balance-of-stations");
  assert.ok(searchProse(stations, "Ubudiyyah").length > 0, "’Ubudiyyah without its mark");
  assert.ok(searchProse(stations, "SERVITUDE").length > 20);
  assert.equal(searchProse(stations, "u").length, 0, "a single letter is not a search");
  assert.equal(searchProse(stations, "zzzzq").length, 0);
});
