/**
 * Builds src/content/books/akhdari.json from the OpenITI Arabic sources.
 * Unvowelled text comes from the structured sections. Vowelled text is
 * sliced from the diacritized file by normalized alignment — never translated.
 *
 * Run: node scripts/build-akhdari.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const structured = JSON.parse(
  fs.readFileSync(path.join(root, "content/sources/akhdari.structured.json"), "utf8"),
);
const diacritizedRaw = fs.readFileSync(
  path.join(root, "content/sources/akhdari.diacritized.txt"),
  "utf8",
);

const DIACRITICS =
  /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g;

function normalize(input) {
  return input
    .replace(DIACRITICS, "")
    .replace(/\u0640/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\u0600-\u06FF]/g, "");
}

function cleanDisplay(input) {
  return input
    .replace(/\u00a0/g, " ")
    .replace(/【\s*/g, "(")
    .replace(/\s*】/g, ")")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n+/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([.،؛:)])/g, "$1")
    .replace(/([(])\s+/g, "$1")
    .trim();
}

/** Map each normalized character back to an index in the original string. */
function buildAlignIndex(original) {
  const normChars = [];
  const origins = [];
  let i = 0;
  const stripped = original.replace(DIACRITICS, "").replace(/\u0640/g, "");
  // Walk original, skipping marks, and record the origin of each kept char
  // that survives normalize(). Easier: walk and apply the same transforms.
  const chars = [...original];
  for (const ch of chars) {
    const start = i;
    i += ch.length;
    if (DIACRITICS.test(ch) || ch === "\u0640") {
      DIACRITICS.lastIndex = 0;
      continue;
    }
    const mapped = ch
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ي")
      .replace(/ة/g, "ه");
    if (/^[\u0600-\u06FF]$/.test(mapped)) {
      normChars.push(mapped);
      origins.push(start);
    }
  }
  return { norm: normChars.join(""), origins, length: original.length };
}

function sliceOriginal(original, origins, normStart, normEnd) {
  if (normStart < 0 || normEnd <= normStart || normStart >= origins.length) return "";
  let from = origins[normStart];
  // A unit that opens with a "(" marker keeps it: the marker sits just before the first letter.
  const opener = original.slice(0, from).match(/\(\s*$/);
  if (opener) from -= opener[0].length;
  const last = origins[Math.min(normEnd, origins.length) - 1];
  // extend through any trailing diacritics that belong to the last letter
  let to = last + 1;
  const rest = original.slice(to);
  const mark = rest.match(/^[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]*/);
  if (mark) to += mark[0].length;
  return original.slice(from, to);
}

const chapterMeta = {
  basmala_hamdala: {
    headingEn: "Opening",
    summaryEn:
      "The basmala, the blessing on the Prophet, and the praise that open the book.",
    partEn: "Opening",
    partAr: "المقدمة",
  },
  obligations_of_the_mukallaf: {
    headingEn: "The accountable person",
    summaryEn:
      "What the chapter says a mukallaf begins with, then tawba, the limbs, and keeping to what one knows to be obedience.",
    partEn: "Opening",
    partAr: "المقدمة",
  },
  tahara_purification: {
    headingEn: "Purification",
    summaryEn:
      "The two kinds of purification, and the water the chapter accepts for both.",
    partEn: "Purification",
    partAr: "الطهارة",
  },
  najasa_impurity: {
    headingEn: "Impurity",
    summaryEn:
      "What to do when impurity on a garment is known, doubtful, or remembered in the prayer.",
    partEn: "Purification",
    partAr: "الطهارة",
  },
  wudu_faraid_sunan: {
    headingEn: "Wudu",
    summaryEn:
      "Seven obligations of wudu, then its sunan, then its virtues, and what follows when one of them is left out.",
    partEn: "Purification",
    partAr: "الطهارة",
  },
  wudu_nullifiers: {
    headingEn: "What breaks wudu",
    summaryEn:
      "The events and the causes the chapter names, including the note on madhi.",
    partEn: "Purification",
    partAr: "الطهارة",
  },
  acts_requiring_wudu: {
    headingEn: "Acts that require wudu",
    summaryEn:
      "Prayer, tawaf, and touching a copy of the Quran, as this chapter restricts them.",
    partEn: "Purification",
    partAr: "الطهارة",
  },
  ghusl_causes: {
    headingEn: "When ghusl is due",
    summaryEn: "Three causes for ghusl, and the two forms of janaba.",
    partEn: "Purification",
    partAr: "الطهارة",
  },
  ghusl_faraid_sunan: {
    headingEn: "Ghusl",
    summaryEn:
      "The obligations of the full wash, then its sunan and virtues, and a missed spot.",
    partEn: "Purification",
    partAr: "الطهارة",
  },
  junub_prohibitions: {
    headingEn: "The person in janaba",
    summaryEn:
      "The mosque, recitation, and the note about someone who cannot use cold water.",
    partEn: "Purification",
    partAr: "الطهارة",
  },
  tayammum: {
    headingEn: "Tayammum",
    summaryEn:
      "Who may use dry ablution, its obligations, sunan, and virtues, and what one tayammum covers.",
    partEn: "Purification",
    partAr: "الطهارة",
  },
  hayd_menstruation: {
    headingEn: "Menstruation",
    summaryEn:
      "The beginner, the woman with a habit, and the pregnant woman, and what menstruation suspends.",
    partEn: "Purification",
    partAr: "الطهارة",
  },
  nifas_postnatal: {
    headingEn: "Postnatal bleeding",
    summaryEn:
      "Nifas follows menstruation in what it suspends. The chapter names its maximum and a return of blood.",
    partEn: "Purification",
    partAr: "الطهارة",
  },
  salah_title: {
    headingEn: "The prayer",
    summaryEn: "A section title. The chapters after this one are about the prayer.",
    partEn: "Prayer",
    partAr: "الصلاة",
  },
  salah_times: {
    headingEn: "Prayer times",
    summaryEn:
      "Chosen and necessary times, the makeup that falls outside them, and when a voluntary prayer is not prayed.",
    partEn: "Prayer",
    partAr: "الصلاة",
  },
  salah_conditions: {
    headingEn: "Conditions of the prayer",
    summaryEn:
      "Purification of hadath and of impurity, covering, the qibla, speech, and a great deal of extra movement.",
    partEn: "Prayer",
    partAr: "الصلاة",
  },
  salah_faraid_sunan: {
    headingEn: "Inside the prayer",
    summaryEn:
      "What the chapter lists as obligatory in the prayer, then its sunan, then its virtues.",
    partEn: "Prayer",
    partAr: "الصلاة",
  },
  salah_khushu: {
    headingEn: "Humility in the prayer",
    summaryEn:
      "The chapter’s counsel on presence of heart, and on the light of the prayer reaching the humble.",
    partEn: "Prayer",
    partAr: "الصلاة",
  },
  salah_seven_states: {
    headingEn: "Seven ways of praying",
    summaryEn:
      "Four postures ordered as obligation, then three on the side or the back that the chapter calls recommended.",
    partEn: "Prayer",
    partAr: "الصلاة",
  },
  qada_missed_prayers: {
    headingEn: "Making up missed prayers",
    summaryEn:
      "Prayers still owed: their order, their form, and the voluntary prayers the chapter still allows.",
    partEn: "Prayer",
    partAr: "الصلاة",
  },
  sahw_forgetfulness: {
    headingEn: "Forgetfulness in the prayer",
    summaryEn:
      "The prostrations of forgetfulness, and the cases of a missing act, an extra act, and doubt.",
    partEn: "Prayer",
    partAr: "الصلاة",
  },
};

function splitUnits(raw) {
  const text = cleanDisplay(raw);
  if (!text) return [];
  const primary = text.split(/(?<=[.؛])\s+/).map((s) => s.trim()).filter(Boolean);
  const pieces = [];
  for (const sentence of primary) {
    if (sentence.length <= 340) {
      pieces.push(sentence);
      continue;
    }
    const bits = sentence.split(/(?<=،)\s+/);
    let buf = "";
    bits.forEach((bit, index) => {
      const next = buf ? `${buf} ${bit}` : bit;
      const last = index === bits.length - 1;
      if (!last && next.length < 150) {
        buf = next;
        return;
      }
      if (next.length > 420 && buf) {
        pieces.push(buf);
        buf = bit;
        if (last) pieces.push(buf);
        return;
      }
      pieces.push(next);
      buf = "";
    });
    if (buf) pieces.push(buf);
  }
  const merged = [];
  for (const piece of pieces) {
    const marker = /^\((?:و?سنن|و?فضائل|و?فرائض|و?شروط|و?نواقض)/.test(piece);
    if (!marker && merged.length && (piece.length < 28 || merged[merged.length - 1].length < 28)) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${piece}`.replace(/\s+/g, " ");
    } else {
      merged.push(piece);
    }
  }
  return merged;
}

const aligned = buildAlignIndex(diacritizedRaw);
let cursor = 0;
let matchedUnits = 0;
let totalUnits = 0;
const misses = [];

const chapters = structured.sections.map((section) => {
  const meta = chapterMeta[section.id];
  if (!meta) throw new Error(`Missing English chapter label for ${section.id}`);
  const units = splitUnits(section.text_ar);
  const built = units.map((arabic, index) => {
    totalUnits += 1;
    const needle = normalize(arabic);
    const found = needle ? aligned.norm.indexOf(needle, cursor) : -1;
    let arabicVowelled;
    if (found >= 0) {
      const slice = sliceOriginal(diacritizedRaw, aligned.origins, found, found + needle.length);
      arabicVowelled = cleanDisplay(slice);
      const endPunct = arabic.match(/[.؛،:]+$/)?.[0];
      if (endPunct && arabicVowelled && !arabicVowelled.endsWith(endPunct)) {
        arabicVowelled += endPunct;
      }
      cursor = found + needle.length;
      if (normalize(arabicVowelled) === needle) matchedUnits += 1;
      else misses.push(`${section.id}.${index + 1} normalized mismatch`);
    } else {
      misses.push(`${section.id}.${index + 1} not found (${needle.slice(0, 24)}…)`);
    }
    return {
      id: `${section.id}.${index + 1}`,
      number: index + 1,
      arabic,
      ...(arabicVowelled ? { arabicVowelled } : {}),
    };
  });
  return {
    id: section.id,
    order: section.order,
    headingAr: section.heading_ar,
    headingEn: meta.headingEn,
    summaryEn: meta.summaryEn,
    partEn: meta.partEn,
    partAr: meta.partAr,
    units: built,
  };
});

const book = {
  id: "akhdari",
  source: {
    work: structured.title_ar,
    author: structured.author_ar,
    openiti: structured.source,
    license: "CC BY-NC-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    note: "Arabic text from OpenITI. No English translation of the book text is included.",
  },
  chapters,
};

const out = path.join(root, "src/content/books/akhdari.json");
fs.writeFileSync(out, JSON.stringify(book, null, 2) + "\n");

console.log(
  `chapters ${chapters.length} · units ${totalUnits} · vowelled matches ${matchedUnits} · misses ${misses.length}`,
);
misses.slice(0, 30).forEach((m) => console.log(" -", m));
chapters.forEach((ch) => {
  console.log(`${String(ch.order).padStart(2, "0")} ${ch.id} (${ch.units.length})`);
});
