# Al-Risala: Arabic edition (draft)

Status: **draft, unpublished.** The text is generated and tested, but it is not registered for reading. The book stays "coming soon" until every blocker below is cleared. `tests/risala.test.ts` fails if the book is made readable while any blocker remains.

## Work and source

- **Work:** al-Risala, by Abu Muhammad Abd Allah ibn Abi Zayd al-Qayrawani (d. 386 AH). The work is identified by OpenITI URI `0386IbnAbiZaydQayrawani.Risala` and the author by Wikidata Q5984167. This is the Maliki primer, not al-Shafiʿi's *al-Risala* on legal theory.
- **Corpus:** OpenITI, repository `OpenITI/0400AH`, commit `5bb6966d8df2ed22b1bff5cdbe29bb9c24f3ca29` (2025-11-28). Retrieved 2026-10-23.
- **Base text:** `0386IbnAbiZaydQayrawani.Risala.JK000171-ara1`.
  - Flagged as OpenITI's primary version.
  - Cleaned of paratext by OpenITI in 2023.
  - Header records Dar al-Fikr, Beirut; no editor, year or ISBN.
  - About 25,000 words, unvowelled, with page markers for pages 1–170.
- **Reference text:** `0386IbnAbiZaydQayrawani.Risala.Shamela0011373-ara1`, *Matn al-Risala* (Dar al-Fikr, same pagination). It omits the introduction. It is used only to cross-check the 45 chapter headings.
- **Versions not used:**
  - `Shamela0097806`: only the creed introduction (ed. Bakr Abu Zayd).
  - `Shia000903`: opens with a later compiler's preface and has no recorded edition.
- **Vowelling:** none in any available version. The library does not add tashkil.
- **Snapshots:** the files in `content/sources/risala/` are byte-identical to OpenITI. Their SHA-256 hashes are in `provenance.json`, and the build refuses to run if a snapshot changes.
- **Citation:** Romanov, Maxim, and Masoumeh Seydi. *OpenITI: A Machine-Readable Corpus of Islamicate Texts.* Zenodo. doi:10.5281/zenodo.3082463.

### Licence

Recorded as **CC BY-NC-SA 4.0, reported but not verified**:

- A web search index reports the OpenITI Primary Version release (doi:10.5281/zenodo.10021513) as CC BY-NC-SA 4.0. That is the licence the library already records for al-Akhdari.
- The Zenodo record itself could not be opened from the build environment, and the `0400AH` repository has no licence file.
- **Before publication,** someone must open the Zenodo record, confirm the licence, and set `licence.status` to `verified` in `provenance.json`.
- The licence covers OpenITI's digital text only. It says nothing about the underlying Dar al-Fikr printing, any other modern edition, or any future translation. Each of those needs its own permission.

## Pipeline

`npm run content:risala` runs `scripts/build-risala.mjs` and writes `src/content/books/risala.json`. `node scripts/build-risala.mjs --check` fails if that file is out of date.

1. Verify the base snapshot's SHA-256 against `provenance.json`.
2. Split the text into paragraphs at OpenITI's `# ` marks, joining `~~` continuation lines.
3. Remove markup only:
   - page markers (`PageV01P###`) and milestones (`ms##`)
   - Quran-span markers (`@QB@ … @QE@`; the words are kept)
   - print line-break and heading bars (`|`) and empty paragraph marks (`#`)
   - spaces before punctuation and after "(" (spacing only)
4. A paragraph that opens with `|` and starts with باب is a chapter heading. It must match the expected heading in `content/sources/risala/chapters.json` (letters only, hamza forms folded), or the build stops. Text before the first heading is the author's introduction.
5. Passages are the source's paragraphs:
   - Ids are `<chapter-id>.pNN`; chapter ids are fixed in `chapters.json`.
   - Each passage records the source page where it begins (`sourcePage`), for checking against the print.
6. Apply only `applied` entries from `corrections.json`. Each needs its passage, the exact old and new wording, a reason and a supporting reference. There are none yet.

**Result:** 46 chapters (the introduction plus 45 chapters) and 667 passages, median 29 words.

**Tests (`tests/risala.test.ts`):**
- the snapshots are unchanged
- the build is deterministic and the committed output is current
- every Arabic letter and digit of the source survives, in order, with nothing added and no vowel marks
- passage ids are unique and well formed, and in book and page order
- correction records are validated
- review issues name real passages, and every passage with digits is listed
- attribution comes from the provenance record
- the draft cannot be published while blockers remain
- the book reads as an Arabic-only edition

## Open review issues

These are listed in `content/sources/risala/review-issues.json`. None has changed the text.

- **q1:** modern verse references in digits after Quran quotations, in 8 passages, most likely added by the printed edition. Kept as the source has them.
- **q2:** Quran quotations are not yet set apart in the reader.
- **q3:** two chapter headings differ slightly between the witnesses.
- **q4:** 12 long passages (150–378 words). Segmentation should be checked against the chosen printed edition.
- **q5:** no vowelled source.
- **q6:** the introduction's heading and all English chapter labels are the library's own and are unreviewed.

## Candidate printed editions (for the reviewer to choose)

None of these has been inspected; the details come from catalogue and bookseller listings found by web search, and must be checked against the books themselves. Choosing the review authority is the reviewer's decision.

| Edition | What the listing says | Why it might suit | Caveats |
| --- | --- | --- | --- |
| *al-Risala*, in the recension of al-Tataʾi, ed. Ibrahim Ahmad Ibrahim al-Sanari. Maʿhad al-Makhtutat al-ʿArabiyya (Institute of Arabic Manuscripts), 1442/2021 | Based on al-Tataʾi's commentary *Tanwir al-maqala*, collated with two manuscripts of the Risala and compared with five other commentaries; notes on rare words and grammar | A scholarly publisher with a stated method and apparatus; helps with wording and apparent copy errors | Follows one commentator's recension; copyright edition, so it can be cited for corrections but not copied |
| *al-Risala*, ed. Yamin ibn Qaddur al-Karaz al-Jazaʾiri. Dar Ibn Hazm | Seller describes it as based on 16 manuscripts, one read to the author | A wide manuscript base could settle variants and chapter divisions | The manuscript claim is from a retailer; not verified. Copyright edition |
| *al-Risala*. Dar al-Fikr, Beirut, 170 pages | The printing behind the OpenITI base text | Same pagination as `sourcePage`, so every passage can be located in it | No editor or apparatus recorded; checking against it only confirms the digitisation, not the text |
| Manuscript of *al-Risala*, Bibliothèque nationale de France (Gallica, ark:/12148/btv1b110014607) | A digitised manuscript, freely viewable | A pre-modern witness for difficult readings | Date, scribe and completeness not yet checked; reading it needs manuscript skill |

## Before publication

1. Licence confirmed on Zenodo (`licence.status: "verified"`).
2. A printed edition chosen by the reviewer and the text checked against it (`printedEditionComparison` starting "Done", naming the edition).
3. Every review issue closed, and every correction recorded with its reference.
4. A scholarly review recorded (`scholarlyReview` in `provenance.json`: reviewer, date, scope).
5. Only then: add the content to `src/content/library.ts`, set the book to `readable`, and run the full test and browser suites. No English translation is part of this phase.
