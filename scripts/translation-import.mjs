/**
 * Turn a filled worksheet (TSV from translation-worksheet.mjs) into a
 * TranslationFile JSON. Rows with an empty translation are left out: they are
 * untranslated passages, not empty strings. Nothing is translated here.
 *
 *   node scripts/translation-import.mjs <worksheet.tsv> <bookId> <translationId> <language> \
 *     > src/content/translations/<bookId>/<translationId>.json
 *
 * The import refuses rows whose passage id is unknown, and rows whose Arabic
 * no longer matches the book (a sign the worksheet was edited or reordered).
 */
import { readFileSync } from "node:fs";

const [file, bookId, translationId, language] = process.argv.slice(2);
if (!file || !bookId || !translationId || !language) {
  console.error("usage: node scripts/translation-import.mjs <worksheet.tsv> <bookId> <translationId> <language>");
  process.exit(1);
}
const content = JSON.parse(readFileSync(new URL(`../src/content/books/${bookId}.json`, import.meta.url), "utf8"));
const units = new Map(content.chapters.flatMap((chapter) => chapter.units.map((unit) => [unit.id, unit])));
const clean = (value) => String(value ?? "").replace(/[\t\r\n]+/g, " ").trim();

const lines = readFileSync(file, "utf8").split(/\r?\n/).filter((line) => line.trim() !== "");
const header = lines.shift().split("\t");
const col = (name) => {
  const index = header.indexOf(name);
  if (index < 0) throw new Error(`worksheet has no "${name}" column`);
  return index;
};
const [idCol, arabicCol, textCol] = [col("passage_id"), col("arabic_vowelled"), col("translation")];

const problems = [];
const passages = {};
const seen = new Set();
lines.forEach((line, i) => {
  const cells = line.split("\t");
  const id = cells[idCol];
  const unit = units.get(id);
  if (!unit) return problems.push(`row ${i + 2}: unknown passage id "${id}"`);
  if (clean(cells[arabicCol]) !== clean(unit.arabicVowelled ?? unit.arabic)) {
    problems.push(`row ${i + 2}: Arabic for "${id}" does not match the book; re-export the worksheet`);
  }
  if (seen.has(id)) problems.push(`row ${i + 2}: "${id}" appears twice`);
  seen.add(id);
  const text = clean(cells[textCol]);
  if (text) passages[id] = text;
});

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.error(`${Object.keys(passages).length} of ${units.size} passages translated`);
process.stdout.write(JSON.stringify({ bookId, translationId, language, passages }, null, 2) + "\n");
