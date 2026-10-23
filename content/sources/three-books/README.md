# The three books of Omar Ceesay: source record

The library holds three books as their published English edition:

| Library id | Title | Editor (title page) | PDF pages | Printed pages |
| --- | --- | --- | --- | --- |
| `reviving-religion` | Reviving Religion in the Self and Life. *The Balanced Scale: A Contemporary Reading of Islam, a Renewal of Religion, and Its Effect on Life* | Bai Lamin Dondeh | 2–83 | ii–73 |
| `knowing-the-self` | Knowing the Self: The Path to Uprightness | Dr. Alieu Gibba | 84–146 | 74–136 |
| `balance-of-stations` | The Balance of Spiritual Stations in the Muslim’s Life. *Servitude \| Belonging \| Emulation \| Receiving Knowledge from a Sheikh* | Muhammed MK Kah | 147–236 | 137–226 |

- **Author:** Abu Abdur-Rahman Omar Ibn Alhagie Abdullah Ceesay Ibn Alhagie Jibel Fana Sow Ceesay
- **Translator:** Sidy Ahmad Gassama
- **Copyright:** © Omar Ceesay
- **ISBN:** 978-9983-94-606-2, one ISBN for the three-book volume
- **Edition:** First Edition 1447H / 2026
- **Printer:** DBC Printing Corporation, Banjul, The Gambia

## Rights

The edition says: "All rights reserved. No part of this publication may be reproduced, stored in a retrieval system, or transmitted, in any form, or by any means … without the prior permission of the publisher."

The books are **not** openly licensed. The library owner confirmed on 23 October 2026 that the rights holder permits the library to display the complete text publicly. The site shows the copyright, ISBN, edition and rights notice on each book page and at the end of each book. It assigns no licence and claims no right to redistribute.

## Source file

- **File:** `Three Books - Complete English Translation [Final]_PRINT.pdf`
  - 236 pages
  - digital text, not a scan, so no OCR was needed
  - SHA-256 `4c84b844e8b276bb18157b346bf8626b1527d5b42bb0484414aebe4868f460aa`
- **Delivery:** received with three PDFs pre-split at approximate boundaries. The split files were not used. The boundaries above come from the full PDF's own title pages, and the tests check them against its table of contents.
- **Not committed:** the PDF is not in the repository.

`pages.json` is a snapshot of the PDF's text layer, made once with `scripts/extract-three-books.py` (pdfplumber). For every line it records:
- its position and size
- its runs of bold and italic text
- each ruled table, cell by cell

Nothing in the snapshot is corrected or reworded.

## Build

`npm run content:three-books` runs `scripts/build-three-books.mjs`, which writes `src/content/books/<id>.json`. CI runs it with `--check`.

### What the build does

1. **Skips** the title, copyright, contents and blank pages: PDF 2, 3, 4, 5, 8, 84 and 147. Their details are shown as the book's metadata, and the reader has its own contents.
2. **Splits blocks by spacing.** The print leaves a paragraph's space after every heading, so a bold line that runs straight on into text is a lead-in, kept in bold, not a heading. A paragraph continues onto the next page when its last line is justified to the margin.
3. **Makes sections** from the headings listed in `books.json`:
   - parts, chapters, introductions, prologues, summaries, conclusions, the translator's preface and the references
   - other bold headings, such as "Section One: …", are set as sub-headings above the passage they open
   - the translator's signature is kept as text, with its line break
4. **Makes passages:**
   - one paragraph, numbered item, table or signature each
   - ids are `<section-id>.pNN`
   - each records the printed page where it starts
5. **Keeps emphasis** as `**bold**`, `*italic*`, `***both***`. Italic is used for the Qur’an, hadith and book titles.
6. **Joins lines.** A line ending in a hyphen joins the next with no space and the hyphen kept. All 60 such breaks in the book are genuine compounds ("Al-Tirmidhi", "self-restraint", "God-consciousness").
7. **Drops** the invisible right-to-left embedding marks the PDF wraps around ﷺ.
8. **Applies** the corrections in `corrections.json`.
9. **Merges** a table that runs on from one page to the next. The references span printed pages 223–225.

### Checks (`tests/three-books.test.ts`)

- The build is deterministic and committed.
- Every character of every page appears, in order, in the right book, with nothing added. Spacing is the only thing the build decides.
- The skipped pages hold only the title, copyright, contents or nothing.
- All 21 part titles and their page numbers agree with the printed table of contents.
- Each title page names its own editor, the translator and the edition.
- Ids are unique and well formed, every section has passages, and no passage is empty or has an unreadable character.
- The references table has its 71 works.

## For review

Nothing here changes the published wording except c1.

1. **c1: missing honorific (applied, to confirm).** On printed pages 40, 141 and 212 the print shows an empty missing-glyph box after "the Messenger of Allah" or "the Messenger", inside italic quotations. The PDF has no character there. Everywhere else the book prints ﷺ in this position, so the library shows ﷺ. The publisher should confirm.
2. **One ISBN for three books.** The edition gives a single ISBN for the volume, so each book page shows that ISBN.
3. **Editors.** Each title page names one editor, and the library shows that editor for that book: Bai Lamin Dondeh (book 1), Dr. Alieu Gibba (book 2), Muhammed MK Kah (book 3).
4. **The translator's preface** speaks of all three books but is printed in the first book's front matter (pages vi–vii), so it opens *Reviving Religion in the Self and Life* only.
5. **Headings as printed:**
   - *Knowing the Self*, Part 6 has a chapter headed only "Chapter One", with no title.
   - Parts 1 and 7 of that book have several short closing sections, some with the same heading, for example "Conclusion" twice in Part 7.
   - They are kept as printed. Repeated headings get ids ending `-2`.
6. **Original language.** The edition calls itself a "Complete English Translation" but does not name the language it was translated from, so the library does not either.
