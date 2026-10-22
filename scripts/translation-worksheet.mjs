/**
 * Export a translator worksheet (TSV) for one book: one row per passage with
 * its stable id and the Arabic. The translation column is left empty.
 *
 *   node scripts/translation-worksheet.mjs akhdari > akhdari-worksheet.tsv
 *
 * Columns: passage_id, chapter, number, arabic_vowelled, translation, translator_note
 */
import { readFileSync } from "node:fs";

const bookId = process.argv[2];
if (!bookId) {
  console.error("usage: node scripts/translation-worksheet.mjs <bookId>");
  process.exit(1);
}
const content = JSON.parse(readFileSync(new URL(`../src/content/books/${bookId}.json`, import.meta.url), "utf8"));
const clean = (value) => String(value ?? "").replace(/[\t\r\n]+/g, " ").trim();

const rows = [["passage_id", "chapter", "number", "arabic_vowelled", "translation", "translator_note"]];
for (const chapter of content.chapters) {
  for (const unit of chapter.units) {
    rows.push([unit.id, chapter.headingEn, String(unit.number), clean(unit.arabicVowelled ?? unit.arabic), "", ""]);
  }
}
process.stdout.write(rows.map((row) => row.join("\t")).join("\n") + "\n");
