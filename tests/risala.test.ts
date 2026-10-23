import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { books } from "../src/content/books";
import { getBookContent, readableContentIds } from "../src/content/library";
import type { BookContent } from "../src/content/types";
import { flattenUnits, searchContent } from "../src/lib/reading";
import { availableTranslations, modeOptions, parseModeKey, publicContent, resolveMode } from "../src/lib/translations";
import generated from "../src/content/books/risala.json";
import { buildRisala, OUTPUT, publicationBlockers, serialise, validateCorrections } from "../scripts/build-risala.mjs";

const root = path.resolve(__dirname, "..");
const sources = path.join(root, "content/sources/risala");
const json = (file: string) => JSON.parse(fs.readFileSync(path.join(sources, file), "utf8"));
const provenance = json("provenance.json");
const content = generated as BookContent;
const book = books.find((b) => b.id === "risala")!;
const units = content.chapters.flatMap((chapter) => chapter.units);
const letters = (text: string) => text.replace(/[^ء-ي]/g, "");

test("risala: source snapshots are kept exactly as retrieved", () => {
  for (const file of provenance.files) {
    const digest = crypto.createHash("sha256").update(fs.readFileSync(path.join(sources, file.path))).digest("hex");
    assert.equal(digest, file.sha256, `${file.path} differs from the retrieved OpenITI file`);
  }
});

test("risala: the build is deterministic and the committed JSON is current", () => {
  const first = serialise(buildRisala(root));
  assert.equal(serialise(buildRisala(root)), first, "two builds differ");
  assert.equal(fs.readFileSync(path.join(root, OUTPUT), "utf8"), first, "run npm run content:risala");
});

test("risala: every Arabic letter of the source survives, in order, and nothing is added", () => {
  const raw = fs.readFileSync(path.join(sources, provenance.files.find((f: { role: string }) => f.role === "base").path), "utf8");
  const body = raw.split("#META#Header#End#")[1];
  const output = content.chapters
    .map((chapter, i) => (i === 0 ? "" : chapter.headingAr) + chapter.units.map((unit) => unit.arabic).join(""))
    .join("");
  assert.equal(json("corrections.json").corrections.length, 0, "update this test when corrections are applied");
  assert.equal(letters(output), letters(body));
  // Digits too, once page and milestone markers are set aside: the editorial verse numbers are kept.
  const digits = (text: string) => text.replace(/PageV\d+P\d+|ms\d+/g, "").replace(/[^0-9]/g, "");
  assert.equal(digits(output), digits(body));
  assert.ok(!units.some((unit) => /[ً-ْ]/.test(unit.arabic)), "no vowel marks may be introduced");
});

test("risala: passage ids are unique, stable in form, and in book order", () => {
  const map = json("chapters.json").chapters;
  assert.deepEqual(content.chapters.map((chapter) => chapter.id), map.map((entry: { id: string }) => entry.id));
  assert.equal(new Set(units.map((unit) => unit.id)).size, units.length);
  content.chapters.forEach((chapter, order) => {
    assert.equal(chapter.order, order);
    assert.ok(chapter.units.length > 0, `${chapter.id} has no passages`);
    chapter.units.forEach((unit, i) => {
      assert.equal(unit.number, i + 1);
      assert.equal(unit.id, `${chapter.id}.p${String(i + 1).padStart(2, "0")}`);
      assert.ok(unit.arabic.trim().length > 0);
      assert.doesNotMatch(unit.arabic, /[A-Za-z@#~|]/, `${unit.id} still has markup`);
    });
  });
  const pages = units.map((unit) => Number(unit.sourcePage!.slice(4)));
  assert.ok(pages.every((page, i) => i === 0 || page >= pages[i - 1]), "source pages run backwards");
  assert.equal(pages[0], 1);
  assert.ok(pages[pages.length - 1] <= 170);
});

test("risala: correction records are validated", () => {
  assert.deepEqual(validateCorrections(json("corrections.json").corrections), []);
  const problems = validateCorrections([
    { id: "r1", passageId: "wudu.p01", was: "x", now: "x", reason: "", reference: "", status: "done" },
  ]);
  assert.ok(problems.some((p: string) => p.includes("missing reason")));
  assert.ok(problems.some((p: string) => p.includes("missing reference")));
  assert.ok(problems.some((p: string) => p.includes("status")));
  assert.ok(problems.some((p: string) => p.includes("same")));
});

test("risala: review issues name real passages", () => {
  const ids = new Set(units.map((unit) => unit.id));
  for (const issue of json("review-issues.json").issues) {
    for (const id of issue.passages) assert.ok(ids.has(id), `${issue.id} names unknown passage ${id}`);
  }
  // Every passage with digits (editorial verse numbers) is listed for the reviewer.
  const q1 = new Set(json("review-issues.json").issues.find((i: { id: string }) => i.id === "q1").passages);
  for (const unit of units) if (/\d/.test(unit.arabic)) assert.ok(q1.has(unit.id), `${unit.id} has digits but is not in q1`);
});

test("risala: attribution and licence come from the provenance record", () => {
  assert.equal(content.source.license, provenance.licence.name);
  assert.equal(content.source.licenseUrl, provenance.licence.url);
  assert.match(content.source.openiti, /^OpenITI 0386IbnAbiZaydQayrawani\.Risala\.JK000171-ara1$/);
  assert.equal(provenance.openitiWorkUri, "0386IbnAbiZaydQayrawani.Risala");
  assert.ok(["reported-not-verified", "verified"].includes(provenance.licence.status));
});

test("risala: unpublished until every blocker is cleared", () => {
  const blockers = publicationBlockers(root);
  const published = book.status === "readable" || readableContentIds().includes("risala");
  if (published) assert.deepEqual(blockers, [], "Al-Risala is published with open blockers");
  else {
    assert.notEqual(book.status, "readable");
    assert.equal(getBookContent("risala"), null, "draft text must not be registered for reading");
    assert.ok(blockers.length > 0);
  }
  // The registry is the only way into the reader: it must not import the draft text.
  const registry = fs.readFileSync(path.join(root, "src/content/library.ts"), "utf8");
  if (!published) assert.doesNotMatch(registry, /risala\.json/);
});

test("risala: reads as an Arabic-only edition with no translation", () => {
  assert.deepEqual(book.translations, []);
  assert.deepEqual(availableTranslations(book, content), []);
  assert.deepEqual(modeOptions([]).map((option) => option.key), ["arabic"]);
  assert.deepEqual(resolveMode(parseModeKey("both:any"), []), { kind: "arabic" });
  const shown = publicContent(book, content);
  assert.ok(flattenUnits(shown).every(({ unit }) => !unit.translations?.length));
  assert.equal(flattenUnits(shown).length, units.length);
  assert.ok(searchContent(shown, "التيمم").length > 0);
});
