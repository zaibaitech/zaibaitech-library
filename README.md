# Zaibaitech Library

A reading room for classical Islamic manuals, built for Muslims in the diaspora who are still growing into Quranic Arabic. The first book on the shelf is **Mukhtasar al-Akhdari** (عبد الرحمن الأخضري), the short Maliki manual of worship.

English in the interface names chapters, glossary words, and practice steps. It is not a translation of the book, and it is not a fatwa. The Arabic line is the source.

## Licensing

Arabic text from OpenITI, [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

OpenITI work: `0983IbnMuhammadSahgirAkhdari.MukhtasarFiCibadat.JK009285-ara1`.

Evident copy errors in that witness (split words, doubled words, letter swaps) are listed in [CORRECTIONS.md](CORRECTIONS.md). Numbers and unusual wording were left alone.

The sources used to build the reader live in `content/sources/`:

- `akhdari.structured.json` — 21 sections, unvowelled
- `akhdari.diacritized.txt` — the same text with vowels

No English translation of the book text is included. None is licensed for this app yet.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Production:

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

The app is a Next.js 14 App Router project (TypeScript, Tailwind, lucide-react). All book routes are statically generated. The last line read, vowel preference, font size, and theme stay in `localStorage` on the device. There is no account and no payment. Practice and the older reader tools (bookmarks, in-reader search, the progress meter) remain in the code and stay off until `studyToolsEnabled` in `src/lib/flags.ts` is set to true.

## What is on the shelf

| Route | What it is |
| --- | --- |
| `/` | Shelf |
| `/books/akhdari` | Book page: cover, author, contents, OpenITI credit, Continue |
| `/books/akhdari/read` | Continuous Arabic reader. Text size and vowels sit behind one button. The last line is remembered on this device. |
| `/books/akhdari/practice` | Practice, guides, drills, and quizzes. Hidden while `studyToolsEnabled` is false in `src/lib/flags.ts`. |
| `/glossary` | Tap-to-define notes. The shelf does not link here while study tools are off. |

Coming-soon cards (al-Risala, Mukhtasar Khalil) are catalogue entries only. They have no text.

In the reader, the first time a glossary word appears in a line it is tappable. Vowels can be turned off; search ignores them.

## How a translation would be added later

Each line is a `TextUnit` (`src/content/types.ts`):

```ts
{
  id: "wudu_faraid_sunan.1",
  number: 1,
  arabic: "...",
  arabicVowelled: "...",
  translations: [
    {
      translationId: "en-example",
      language: "en",
      translator: "Name",
      license: "The license that actually covers it",
      text: "..."
    }
  ]
}
```

Look a translation up with `translationFor(unit, translationId)`. Do not fill `translations` until a license allows that wording. The reader does not render translations today.

## How to add a new book

1. Add a `Book` to `src/content/books.ts` (`id`, `title`, `subtitle`, `author`, `description`, `status`, `coverGradient`, `chapterCount`, `madhhab`, `languages`, `level`). Use `status: "coming-soon"` until the text exists. `titleAr` and `authorAr` are extra fields the shelf uses.
2. For a readable book, add `src/content/books/<id>.json` matching `BookContent`: `source` plus `chapters[]`, each chapter with `units[]` of `TextUnit`. Register it in `src/content/library.ts`.
3. Rebuild Akhdari from the OpenITI files, if you change those sources:

   ```bash
   npm run content
   ```

   `scripts/build-akhdari.mjs` splits the unvowelled sections into lines and aligns the vowelled file. It does not translate anything.
4. Optional: add glossary entries in `src/content/glossary.ts` (aliases are matched with vowels stripped, plus a leading و / ف / ال).
5. Optional: add practice in `src/content/practice/<id>.ts` and register it in `src/content/practice/index.ts`. Cite `sourceUnitId` values that exist in the book. Keep English general, and do not add a ruling the Arabic line does not state.
6. Routes are generated from the catalogue and the content map: `/books/[id]`, `/books/[id]/read`, `/books/[id]/practice`.

## Stack

Next.js 14, React 18, TypeScript, Tailwind CSS, lucide-react. Deploy on Vercel with the default Next.js build (`npm run build`). No database.
