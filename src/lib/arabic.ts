import type { GlossaryTerm } from "../content/glossary";

const MARKS =
  /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g;

/** Fold Arabic for search and glossary lookup. Display text is never folded. */
export function foldArabic(input: string) {
  return input
    .replace(MARKS, "")
    .replace(/\u0640/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه");
}

const EASTERN = "٠١٢٣٤٥٦٧٨٩";

export function toArabicDigits(value: number) {
  return String(value).replace(/\d/g, (digit) => EASTERN[Number(digit)] ?? digit);
}

const PREFIXES = ["وال", "فال", "بال", "كال", "لل", "ال", "و", "ف", "ب", "ل", "ك"];

export type Segment = { text: string; termId?: string };

export function segmentTerms(text: string, terms: GlossaryTerm[]): Segment[] {
  const map = new Map<string, string>();
  const vowelling = new Map<string, string>();
  for (const term of terms) {
    map.set(foldArabic(term.arabic), term.id);
    for (const alias of term.aliases) map.set(foldArabic(alias), term.id);
    for (const [alias, form] of Object.entries(term.vowelled ?? {})) vowelling.set(foldArabic(alias), form);
  }
  /* A hit on an ambiguous alias counts only if the word carries the term's vowelling. */
  const accept = (key: string, word: string) => {
    const form = vowelling.get(key);
    return !form || word.includes(form);
  };
  const used = new Set<string>();
  return text.split(/([\u0600-\u06FF]+)/).map((part) => {
    if (!part || !/^[\u0600-\u06FF]+$/.test(part)) return { text: part };
    const folded = foldArabic(part);
    let termId = accept(folded, part) ? map.get(folded) : undefined;
    if (!termId) {
      for (const prefix of PREFIXES) {
        const stem = folded.slice(prefix.length);
        if (folded.startsWith(prefix) && stem.length >= 3) {
          const hit = map.get(stem);
          if (hit && accept(stem, part)) {
            termId = hit;
            break;
          }
        }
      }
    }
    if (!termId || used.has(termId)) return { text: part };
    used.add(termId);
    return { text: part, termId };
  });
}
