/**
 * Builds src/content/books/risala.json from the OpenITI snapshot in content/sources/risala.
 *
 * Deterministic: the same snapshot, chapter map and corrections always give byte-identical output.
 * Only OpenITI markup is removed (page and milestone markers, line continuations, Quran-span
 * markers, print line-break bars) and spacing is tidied around punctuation. No letter is added,
 * removed or changed except by an "applied" entry in corrections.json. No vowel marks are added.
 *
 * Run: node scripts/build-risala.mjs          (writes the JSON)
 *      node scripts/build-risala.mjs --check  (fails if the committed JSON is out of date)
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, "..");
const SOURCES = "content/sources/risala";
export const OUTPUT = "src/content/books/risala.json";

const read = (root, file) => fs.readFileSync(path.join(root, SOURCES, file), "utf8");
const readJson = (root, file) => JSON.parse(read(root, file));

/** Letters only, hamza and alif forms folded: for comparing headings across witnesses. */
export function foldLetters(input) {
  return input
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[ىئ]/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ء/g, "")
    .replace(/[^ء-ي]/g, "");
}

const PAGE = /PageV(\d+)P(\d+)/g;
// Bare "#" is an empty paragraph mark (one sits before each heading); "|" is a print line break or heading bar.
const MARKUP = /PageV\d+P\d+|ms\d+|@Q[BE]@|[|#]/g;

function tidy(text) {
  return text
    .replace(MARKUP, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.،؛:)])/g, "$1")
    .replace(/([(])\s+/g, "$1")
    .trim();
}

const CORRECTION_FIELDS = ["id", "passageId", "was", "now", "reason", "reference", "status"];

/** Problems with correction records; an empty list means every record is complete. */
export function validateCorrections(corrections) {
  const problems = [];
  const ids = new Set();
  for (const [index, entry] of corrections.entries()) {
    const label = entry?.id ?? `#${index}`;
    for (const field of CORRECTION_FIELDS) {
      if (typeof entry?.[field] !== "string" || !entry[field].trim()) problems.push(`${label}: missing ${field}`);
    }
    if (entry?.status && !["applied", "proposed"].includes(entry.status)) problems.push(`${label}: status must be applied or proposed`);
    if (entry?.was && entry.was === entry.now) problems.push(`${label}: was and now are the same`);
    if (ids.has(label)) problems.push(`${label}: duplicate id`);
    ids.add(label);
  }
  return problems;
}

/**
 * What still stands between the generated text and publication. The book may be made readable only
 * when this is empty; tests enforce it. Building successfully is not enough.
 */
export function publicationBlockers(root = ROOT) {
  const provenance = readJson(root, "provenance.json");
  const { issues } = readJson(root, "review-issues.json");
  const { corrections } = readJson(root, "corrections.json");
  const problems = validateCorrections(corrections);
  if (problems.length) throw new Error(`corrections.json: ${problems.join("; ")}`);
  const blockers = [];
  if (provenance.licence.status !== "verified") blockers.push(`Licence not verified (${provenance.licence.status}).`);
  if (!/^Done/.test(provenance.printedEditionComparison)) blockers.push("Not checked against a chosen printed edition.");
  for (const issue of issues) if (issue.status === "open") blockers.push(`Review issue ${issue.id} (${issue.kind}) is open.`);
  for (const entry of corrections) if (entry.status === "proposed") blockers.push(`Correction ${entry.id} is proposed, not decided.`);
  if (!provenance.scholarlyReview) blockers.push("No scholarly review recorded.");
  return blockers;
}

export function buildRisala(root = ROOT) {
  const provenance = readJson(root, "provenance.json");
  const base = provenance.files.find((file) => file.role === "base");
  const raw = read(root, base.path);
  const digest = crypto.createHash("sha256").update(raw).digest("hex");
  if (digest !== base.sha256) {
    throw new Error(`Source snapshot ${base.path} has changed (sha256 ${digest}); it must stay as retrieved.`);
  }
  const { chapters: map } = readJson(root, "chapters.json");
  const { corrections } = readJson(root, "corrections.json");

  const body = raw.split("#META#Header#End#")[1];
  if (!body) throw new Error("No OpenITI header end marker in the base source.");
  // "~~" continues the previous line; "# " at the start of a line opens a paragraph.
  const paragraphs = body.replace(/\r/g, "").replace(/\n~~/g, " ").split(/\n# /).slice(1);

  // OpenITI page markers close a page, so text after PageV01P002 begins on page 3.
  let lastPage = 0;
  const chapters = [];
  let chapterIndex = 0;
  const open = (entry, headingAr) => {
    chapters.push({
      id: entry.id,
      order: chapters.length,
      headingAr,
      headingEn: entry.headingEn,
      summaryEn: "",
      partEn: "",
      partAr: "",
      units: [],
    });
  };
  open(map[0], map[0].headingAr);

  for (const paragraph of paragraphs) {
    const startPage = lastPage + 1;
    for (const match of paragraph.matchAll(PAGE)) lastPage = Number(match[2]);
    const isHeading = paragraph.trimStart().startsWith("|");
    const text = tidy(paragraph);
    if (!text) continue;
    if (isHeading && text.startsWith("باب")) {
      chapterIndex += 1;
      const entry = map[chapterIndex];
      if (!entry) throw new Error(`Heading with no entry in chapters.json: ${text}`);
      if (foldLetters(entry.expectedAr) !== foldLetters(text)) {
        throw new Error(`Chapter ${entry.id}: source heading "${text}" does not match expected "${entry.expectedAr}".`);
      }
      open(entry, text);
      continue;
    }
    const chapter = chapters[chapters.length - 1];
    const number = chapter.units.length + 1;
    chapter.units.push({
      id: `${chapter.id}.p${String(number).padStart(2, "0")}`,
      number,
      arabic: text,
      sourcePage: `V01P${String(startPage).padStart(3, "0")}`,
    });
  }
  if (chapterIndex !== map.length - 1) {
    throw new Error(`Found ${chapterIndex} chapter headings; chapters.json lists ${map.length - 1}.`);
  }

  const units = new Map(chapters.flatMap((chapter) => chapter.units.map((unit) => [unit.id, unit])));
  for (const correction of corrections) {
    if (correction.status !== "applied") continue;
    const unit = units.get(correction.passageId);
    if (!unit) throw new Error(`Correction ${correction.id}: no passage ${correction.passageId}.`);
    if (unit.arabic.split(correction.was).length !== 2) {
      throw new Error(`Correction ${correction.id}: "${correction.was}" must occur exactly once in ${correction.passageId}.`);
    }
    unit.arabic = unit.arabic.replace(correction.was, correction.now);
  }

  return {
    id: "risala",
    source: {
      work: "al-Risala",
      author: "Ibn Abi Zayd al-Qayrawani",
      openiti: `OpenITI ${base.path}`,
      license: provenance.licence.name,
      licenseUrl: provenance.licence.url,
      note: "Unvowelled OpenITI text (Dar al-Fikr, Beirut). Passages follow the source's paragraphs. Not yet checked against a printed edition.",
    },
    chapters,
  };
}

export function serialise(content) {
  return `${JSON.stringify(content, null, 1)}\n`;
}

function main() {
  const out = path.join(ROOT, OUTPUT);
  const next = serialise(buildRisala());
  if (process.argv.includes("--check")) {
    const current = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "";
    if (current !== next) {
      console.error(`${OUTPUT} is out of date. Run: node scripts/build-risala.mjs`);
      process.exit(1);
    }
    console.log(`${OUTPUT} is up to date.`);
    return;
  }
  fs.writeFileSync(out, next);
  const content = JSON.parse(next);
  const count = content.chapters.reduce((sum, chapter) => sum + chapter.units.length, 0);
  console.log(`Wrote ${OUTPUT}: ${content.chapters.length} chapters, ${count} passages.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
