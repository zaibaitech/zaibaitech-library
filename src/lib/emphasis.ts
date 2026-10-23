/**
 * The English books keep the print's emphasis as inline marks: **bold**, *italic*, ***bold italic***.
 * Text outside the marks is upright and regular. The marks never nest (each printed run has one style).
 */
export type Run = { text: string; bold: boolean; italic: boolean };

const MARKED = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/;

/** The runs of one line of marked text. */
export function emphasisRuns(line: string): Run[] {
  return line
    .split(MARKED)
    .filter((part) => part !== "")
    .map((part) => {
      if (part.startsWith("***") && part.endsWith("***") && part.length > 6) return { text: part.slice(3, -3), bold: true, italic: true };
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return { text: part.slice(2, -2), bold: true, italic: false };
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return { text: part.slice(1, -1), bold: false, italic: true };
      return { text: part, bold: false, italic: false };
    });
}

/**
 * The opening invocation (basmala) as the books print it: a passage that is only "In the name of Allah …", set
 * apart from the paragraphs after it. Its italic is the print's own.
 */
export function isInvocation(text: string) {
  const runs = text.includes("\n") ? [] : emphasisRuns(text.trim());
  return runs.length === 1 && /^In the name of Allah\b/.test(runs[0].text) && runs[0].text.length < 90;
}
