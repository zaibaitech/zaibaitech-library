/**
 * Builds the three English books of Omar Ceesay from the text-layer snapshot of the printed PDF
 * (content/sources/three-books/pages.json, made by scripts/extract-three-books.py):
 *
 *   src/content/books/reviving-religion.json
 *   src/content/books/knowing-the-self.json
 *   src/content/books/balance-of-stations.json
 *
 * Wording is never changed. The build only:
 * - joins the printed lines of a paragraph (a line ending in a hyphen joins the next with no space, hyphen kept),
 * - keeps bold and italic as inline marks (**bold**, *italic*),
 * - drops invisible right-to-left embedding marks the PDF wraps around ﷺ,
 * - applies the corrections listed in content/sources/three-books/corrections.json, each with its page and reason.
 *
 * Run: node scripts/build-three-books.mjs           (writes the books)
 *      node scripts/build-three-books.mjs --check   (fails if a committed book differs from a fresh build)
 *      node scripts/build-three-books.mjs --headings (prints every heading the build found, for review)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "content/sources/three-books");
const snapshot = JSON.parse(fs.readFileSync(path.join(sourceDir, "pages.json"), "utf8"));
const config = JSON.parse(fs.readFileSync(path.join(sourceDir, "books.json"), "utf8"));
const corrections = JSON.parse(fs.readFileSync(path.join(sourceDir, "corrections.json"), "utf8")).corrections;

const BODY_SIZE = 12;
const LEFT = 54; // left margin of the text block
const FULL_LINE = 360; // a line reaching this far right is justified, so its paragraph goes on
const PARAGRAPH_GAP = 22; // more space than this between two lines starts a new block

const pageByNumber = new Map(snapshot.pages.map((page) => [page.pdfPage, page]));

/* ---------- lines to blocks ---------- */

const lineText = (line) => line.runs.map((run) => run[0]).join("");
const allBold = (line) => line.runs.every((run) => run[1].includes("b") || !run[0].trim());
const startsItem = (line) => /^\d+\.\s/.test(lineText(line));

/** Blocks of one page range: { kind: "lines", lines, page } or { kind: "table", rows, page }. */
function blocksOf(fromPage, toPage) {
  const blocks = [];
  for (let n = fromPage; n <= toPage; n++) {
    const page = pageByNumber.get(n);
    // Body lines and tables in top-to-bottom order.
    const items = [
      ...page.lines.filter((line) => line.size >= BODY_SIZE - 0.5 || line.size <= 8.5).map((line) => ({ type: "line", top: line.top, line })),
      ...page.tables.map((table) => ({ type: "table", top: table.top, table })),
    ].sort((a, b) => a.top - b.top);
    let previous = null;
    for (const item of items) {
      if (item.type === "table") {
        const open = blocks.at(-1);
        // A table that runs on from the foot of the previous page (no line between them) is the same table.
        if (open?.kind === "table" && open.lastPdfPage === n - 1 && !previous && open.rows[0].length === item.table.rows[0].length) {
          open.rows.push(...item.table.rows);
          open.lastPdfPage = n;
        } else {
          blocks.push({ kind: "table", rows: [...item.table.rows], page: page.printed, pdfPage: n, lastPdfPage: n });
        }
        previous = null;
        continue;
      }
      const { line } = item;
      const open = blocks.at(-1);
      const continues =
        open?.kind === "lines" &&
        (previous
          ? line.top - previous.top <= PARAGRAPH_GAP && sameKind(open, line)
          : // first line of a page: carries on a paragraph whose last line was justified to the margin
            pageContinues(open, line));
      if (continues) open.lines.push(line);
      else blocks.push({ kind: "lines", lines: [line], page: page.printed, pdfPage: n });
      previous = line;
    }
  }
  return blocks;
}

/**
 * Within a page, blocks are split by spacing: the print leaves a paragraph's space after every heading, so a bold
 * line that runs straight on into plain text is a lead-in, not a heading. A new numbered item starts its own block.
 */
function sameKind(block, line) {
  if (startsItem(line) && line.x0 <= LEFT + 1 && block.lines[0].x0 <= LEFT + 1) return false;
  return true;
}

function pageContinues(block, line) {
  const last = block.lines.at(-1);
  if (block.lines.every(allBold)) return false;
  if (allBold(line) && !/^[a-z]/.test(lineText(line))) return false;
  if (startsItem(line) && line.x0 <= LEFT + 1) return false;
  return last.x1 >= FULL_LINE;
}

/* ---------- blocks to text ---------- */

const marks = { b: "**", i: "*", bi: "***" };

/** Join the lines of a block into one string with inline marks. */
function markup(lines) {
  const runs = [];
  lines.forEach((line, index) => {
    line.runs.forEach((run, r) => {
      let [text, style] = run;
      if (r === 0 && index > 0) {
        const prev = runs.at(-1);
        // A line ending in a hyphen joins the next with no space; the hyphen stays.
        if (prev && /[A-Za-z’'’]-$/.test(prev[0])) {
          // nothing to add
        } else if (prev) {
          prev[0] += " ";
        }
      }
      const prev = runs.at(-1);
      if (prev && prev[1] === style) prev[0] += text;
      else runs.push([text, style]);
    });
  });
  return runs
    .map(([text, style]) => {
      if (!style || !text.trim()) return text;
      const lead = text.match(/^\s*/)[0];
      const tail = text.match(/\s*$/)[0];
      const core = text.trim();
      return `${lead}${marks[style]}${core}${marks[style]}${tail}`;
    })
    .join("")
    .replace(/[‪-‮]/g, "")
    .replace(/ {2,}/g, " ")
    .trim();
}

const plain = (text) => text.replace(/\*+/g, "");

/* ---------- corrections ---------- */

function applyCorrections(text, pdfPage, used) {
  let out = text;
  for (const c of corrections) {
    if (c.status !== "applied" || !c.pdfPages.includes(pdfPage)) continue;
    if (!out.includes(c.was)) continue;
    out = out.split(c.was).join(c.now);
    used.add(c.id);
  }
  return out;
}

/* ---------- sections ---------- */

function slug(text) {
  return text
    .toLowerCase()
    .replace(/[’'‘]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

function buildBook(book) {
  const blocks = blocksOf(book.firstPdfPage, book.lastPdfPage).filter((block) => !book.skipPdfPages.includes(block.pdfPage));
  const sectionHeadings = book.sections.map((s) => ({ ...s, matched: false }));
  const usedCorrections = new Set();
  const chapters = [];
  const headingsFound = [];
  let part = null;
  let pendingHeading = null;
  let backMatter = false;

  const ids = new Set();
  const uniqueId = (base) => {
    let id = base;
    for (let n = 2; ids.has(id); n++) id = `${base}-${n}`;
    ids.add(id);
    return id;
  };

  const openSection = (heading, block) => {
    const text = heading;
    let id;
    const partMatch = text.match(/^Part (\d+)[:,]/);
    const chapterMatch = text.match(/^Chapter (\d+|One|Two|Three)\b/i);
    if (partMatch && !backMatter) {
      part = { number: Number(partMatch[1]), title: text };
      id = uniqueId(`part-${part.number}`);
    } else if (chapterMatch && part) {
      const n = Number(chapterMatch[1]) || NUMBER_WORDS[chapterMatch[1].toLowerCase()];
      id = uniqueId(`p${part.number}-ch${n}`);
    } else {
      const base = slug(text.replace(/\s+(of|to) Part \d+.*$/i, "").replace(/:.*$/, ""));
      id = uniqueId(part && !backMatter ? `p${part.number}-${base}` : base);
    }
    chapters.push({
      id,
      order: chapters.length + 1,
      headingEn: text,
      partEn: part && !backMatter ? part.title : "",
      page: block.page,
      units: [],
    });
  };

  for (const block of blocks) {
    const asText = (block.kind === "lines" && book.textBlocks.find((t) => t.pdfPage === block.pdfPage && t.heading === plain(markup(block.lines)))) || null;
    if (block.kind === "lines" && !asText && block.lines.every(allBold) && !startsItem(block.lines[0])) {
      const heading = applyCorrections(plain(markup(block.lines)), block.pdfPage, usedCorrections);
      headingsFound.push({ pdfPage: block.pdfPage, page: block.page, heading, x0: block.lines[0].x0 });
      const known = sectionHeadings.find((s) => !s.matched && s.pdfPage === block.pdfPage && s.heading === heading);
      if (known) {
        known.matched = true;
        if (known.backMatter) backMatter = true;
        if (known.frontMatter) part = null;
        openSection(heading, block);
        pendingHeading = null;
        continue;
      }
      // Any other bold line is a sub-heading inside the section, set above the passage that follows it.
      pendingHeading = pendingHeading ? `${pendingHeading} ${heading}` : heading;
      continue;
    }
    const chapter = chapters.at(-1);
    if (!chapter && process.argv[2] === "--headings") continue;
    if (!chapter) throw new Error(`${book.id}: text before the first section on PDF page ${block.pdfPage}`);
    const number = chapter.units.length + 1;
    const unit = { id: `${chapter.id}.p${String(number).padStart(2, "0")}`, number, page: block.page };
    if (pendingHeading) {
      unit.heading = pendingHeading;
      pendingHeading = null;
    }
    if (block.kind === "table") {
      unit.kind = "table";
      unit.rows = block.rows.map((row) => row.map((cell) => applyCorrections(cell, block.pdfPage, usedCorrections)));
      unit.text = unit.rows.map((row) => row.join(" — ")).join("\n");
    } else {
      // A signature keeps its printed lines.
      const text = asText?.kind === "signature" ? block.lines.map((line) => markup([line])).join("\n") : markup(block.lines);
      unit.text = applyCorrections(text, block.pdfPage, usedCorrections);
      if (asText) unit.kind = asText.kind;
      else if (startsItem(block.lines[0]) && block.lines.slice(1).some((line) => line.x0 > LEFT + 10)) unit.kind = "item";
    }
    chapter.units.push(unit);
  }
  if (pendingHeading && process.argv[2] !== "--headings") throw new Error(`${book.id}: heading "${pendingHeading}" has no text after it`);
  const missing = sectionHeadings.filter((s) => !s.matched);
  if (missing.length && process.argv[2] !== "--headings") throw new Error(`${book.id}: section headings not found: ${missing.map((s) => `${s.heading} (p${s.pdfPage})`).join("; ")}`);
  const empty = chapters.filter((c) => c.units.length === 0);
  return { chapters, headingsFound, usedCorrections, empty };
}

/* ---------- output ---------- */

const mode = process.argv[2];
let failed = false;
const allUsed = new Set();
for (const book of config.books) {
  const { chapters, headingsFound, usedCorrections, empty } = buildBook(book);
  usedCorrections.forEach((id) => allUsed.add(id));
  if (mode === "--headings") {
    console.log(`\n== ${book.id}`);
    for (const h of headingsFound) console.log(`${h.pdfPage}\t${h.page}\t${h.x0}\t${h.heading}`);
    continue;
  }
  if (empty.length) {
    console.error(`${book.id}: sections with no text: ${empty.map((c) => c.id).join(", ")}`);
    failed = true;
  }
  const content = {
    id: book.id,
    language: "en",
    source: {
      ...config.source,
      title: book.title,
      editor: book.editor,
      pdfPages: `${book.firstPdfPage}–${book.lastPdfPage}`,
    },
    chapters,
  };
  const out = path.join(root, "src/content/books", `${book.id}.json`);
  const json = `${JSON.stringify(content, null, 1)}\n`;
  if (mode === "--check") {
    const current = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "";
    if (current !== json) {
      console.error(`${path.relative(root, out)} is out of date. Run: node scripts/build-three-books.mjs`);
      failed = true;
    }
  } else {
    fs.writeFileSync(out, json);
    const passages = chapters.reduce((sum, c) => sum + c.units.length, 0);
    console.log(`${book.id}: ${chapters.length} sections, ${passages} passages`);
  }
}
if (mode !== "--headings") {
  const unused = corrections.filter((c) => c.status === "applied" && !allUsed.has(c.id));
  if (unused.length) {
    console.error(`Corrections that matched nothing: ${unused.map((c) => c.id).join(", ")}`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
