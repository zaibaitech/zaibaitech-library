import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import raw from "../src/content/books/akhdari.json";
import type { BookContent } from "../src/content/types";

// Worksheets are written to a temp directory at test time. The text is a labelled
// fixture, not a translation, and nothing here touches src/content.
const dir = mkdtempSync(path.join(tmpdir(), "zaibaitech-import-"));
const worksheet = execFileSync("node", ["scripts/translation-worksheet.mjs", "akhdari"], { encoding: "utf8" });
const rows = worksheet.replace(/\n$/, "").split("\n");

function sheet(name: string, edit: (cells: string[][]) => string[][]) {
  const cells = rows.map((row) => row.split("\t"));
  const file = path.join(dir, `${name}.tsv`);
  writeFileSync(file, edit(cells).map((row) => row.join("\t")).join("\n") + "\n");
  return file;
}
function runImport(file: string) {
  return spawnSync("node", ["scripts/translation-import.mjs", file, "akhdari", "en-fixture", "en"], { encoding: "utf8" });
}

test("worksheet has one row per passage with an empty translation column", () => {
  const passages = (raw as BookContent).chapters.reduce((n, c) => n + c.units.length, 0);
  assert.equal(rows.length, passages + 1, "header plus one row per passage");
  assert.deepEqual(rows[0].split("\t").slice(0, 5), ["passage_id", "chapter", "number", "arabic_vowelled", "translation"]);
  assert.ok(rows.slice(1).every((row) => row.split("\t")[4] === ""));
});

test("import keeps filled rows and leaves blank rows out", () => {
  const result = runImport(sheet("ok", (c) => { c[1][4] = "FIXTURE one"; c[3][4] = "FIXTURE three"; return c; }));
  assert.equal(result.status, 0, result.stderr);
  const file = JSON.parse(result.stdout);
  assert.deepEqual(Object.keys(file.passages), [rows[1].split("\t")[0], rows[3].split("\t")[0]]);
  assert.equal(file.translationId, "en-fixture");
});

test("import rejects unknown ids, duplicate rows, and Arabic that no longer matches", () => {
  const unknown = runImport(sheet("unknown", (c) => { c[1][0] = "no_such.1"; return c; }));
  assert.notEqual(unknown.status, 0);
  assert.match(unknown.stderr, /unknown passage id "no_such\.1"/);

  const blankDup = runImport(sheet("dup", (c) => [...c, [...c[1]]]));
  assert.notEqual(blankDup.status, 0);
  assert.match(blankDup.stderr, /appears twice/);

  const filledDup = runImport(sheet("dup2", (c) => { c[1][4] = "FIXTURE A"; const d = [...c[1]]; d[4] = "FIXTURE B"; return [...c, d]; }));
  assert.notEqual(filledDup.status, 0);
  assert.match(filledDup.stderr, /appears twice/);

  const mismatch = runImport(sheet("mismatch", (c) => { c[2][3] = "نص مختلف"; return c; }));
  assert.notEqual(mismatch.status, 0);
  assert.match(mismatch.stderr, /does not match the book/);
});
