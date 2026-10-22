/**
 * Validate every registered translation file, or one file given on the
 * command line. Exits non-zero on errors. Prints coverage, warnings, and the
 * reasons a translation is not yet publishable.
 *
 *   npm run translations:check
 *   npm run translations:check -- path/to/file.json
 */
import { readFileSync } from "node:fs";
import { books } from "../src/content/books";
import { getBookContent } from "../src/content/library";
import { translationFiles } from "../src/content/translations";
import type { TranslationFile } from "../src/content/types";
import { validateTranslation } from "../src/lib/translation-validation";

const path = process.argv[2];
const files: TranslationFile[] = path ? [JSON.parse(readFileSync(path, "utf8"))] : translationFiles;

if (files.length === 0) {
  console.log("No translation files registered. Nothing to check.");
  process.exit(0);
}

let failed = false;
for (const file of files) {
  const book = books.find((item) => item.id === file.bookId);
  const content = book ? getBookContent(book.id) : null;
  if (!book || !content) {
    console.log(`✗ ${file.translationId}: book "${file.bookId}" has no text in the library`);
    failed = true;
    continue;
  }
  const report = validateTranslation(book, content, file);
  const { translated, total } = report.coverage;
  console.log(`${report.errors.length ? "✗" : "✓"} ${file.translationId} (${book.id}) — ${translated}/${total} passages`);
  for (const error of report.errors) console.log(`  error: ${error}`);
  for (const warning of report.warnings) console.log(`  warning: ${warning}`);
  if (report.publishBlockers.length > 0) {
    console.log(`  not publishable yet: ${report.publishBlockers.join("; ")}`);
  }
  if (report.errors.length > 0) failed = true;
}
process.exit(failed ? 1 : 0);
