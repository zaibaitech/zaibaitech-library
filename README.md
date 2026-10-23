# Zaibaitech Library

A reading room for classical Islamic manuals, built for Muslims in the diaspora who are still growing into Quranic Arabic. The first book on the shelf is **Mukhtasar al-Akhdari** (عبد الرحمن الأخضري), the short Maliki manual of worship.

The shelf also holds three books in English by Omar Ceesay, translated by Sidy Ahmad Gassama: *Reviving Religion in the Self and Life*, *Knowing the Self: The Path to Uprightness* and *The Balance of Spiritual Stations in the Muslim’s Life*.

English in the interface names chapters, glossary words, and practice steps. It is not a translation of the book, and it is not a fatwa. The Arabic line is the source.

## Licensing

Arabic text from OpenITI, [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

OpenITI work: `0983IbnMuhammadSahgirAkhdari.MukhtasarFiCibadat.JK009285-ara1`.

Evident copy errors in that witness (split words, doubled words, letter swaps) are listed in [CORRECTIONS.md](CORRECTIONS.md). Numbers and unusual wording were left alone.

The sources used to build the reader live in `content/sources/`:

- `akhdari.structured.json` — 21 sections, unvowelled
- `akhdari.diacritized.txt` — the same text with vowels

- `akhdari.segments.json` — where each of the 156 passages begins (see [CORRECTIONS.md](CORRECTIONS.md))

The three English books are © Omar Ceesay (ISBN 978-9983-94-606-2, First Edition 1447H / 2026), all rights reserved. They are shown in full with the rights holder's permission and carry no open licence. Their source record, build and open review points are in [content/sources/three-books/README.md](content/sources/three-books/README.md).

An English translation from the library's bilingual edition (original translation, CC BY-NC-SA 4.0) is published in the reader, with the translator's notes and chapter headings. It was approved by the library's reviewer on 22 October 2026.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Checks:

```bash
npm run typecheck
npm run lint
npm test          # content integrity, translation rules, catalogue filter, local storage
npm run build
npm run test:browser   # needs the build; starts the server itself
npm start
```

`npm run test:browser` runs the Playwright suites in `tests/browser/` against the production build:
- **accessibility:** contrast, focus, names, touch targets, 200% text, reduced motion.
- **reader:** reading modes, sizes, tashkīl, bookmarks, search, restore.
- **navigation:** landing on a passage, back/forward.
- **migration:** old passage ids.
- **publication:** what the published translation shows.
- **qa-regressions:** the preview QA findings.
- **arabic-collisions:** no vowel mark touches the line below, at six widths and sizes.
- **english-books:** the three English books: discovery, book-page details, the reader at three widths, contents, history, deep links, progress, bookmarks, search and tables.

Name suites to run only some (`npm run test:browser -- reader`). Set `SCREENSHOT_DIR` to save screenshots, `CHROMIUM_PATH` to use a particular browser, and `BASE_URL` to test a server that is already running.

GitHub Actions (`.github/workflows/ci.yml`) runs every check above on each pull request and on `main`.

Next.js 16 App Router, TypeScript, Tailwind, lucide-react. All book routes are statically generated. Reading position, bookmarks, text size, tashkīl, reading mode and theme live in `localStorage` on the device. No account, no payment, no database.

## What is in the library

| Route | What it is |
| --- | --- |
| `/` | Library: continue reading, featured book, subject filters, search, available vs forthcoming titles |
| `/books/[id]` | Book page: cover, author, level, subjects, languages, contents, source and licence, study aids |
| `/books/[id]/read` | Reader (readable books only; forthcoming titles return 404) |
| `/glossary` | Editorial glossary notes, flagged as awaiting teacher review |
| `/about` | Sources, licensing, translation policy, and the corrections table (read from `CORRECTIONS.md`) |
| `/books/[id]/practice` | Off. Returns 404 while `studyToolsEnabled` is false in `src/lib/flags.ts` |

### The reader

Toolbar always visible (it hides while scrolling down and returns on any scroll up): Arabic size, tashkīl on/off, reading mode, theme, contents, search, bookmarks. Passages have stable ids (`chapter.n`) used for bookmarks, saved position, and URL hashes. A hash in the URL always wins over the saved position; the hash is updated as you read (replace, not push) so Back and Forward keep your place.

Reading modes are built from the book's available translations: Arabic only, Arabic + translation (stacked on phones, side by side on large screens), translation only. With no translation, only Arabic is offered and the reader says why.

## Design system

Tokens live in `src/app/globals.css` (one definition per theme) and are exposed to Tailwind in `tailwind.config.ts`.

| Token | Role |
| --- | --- |
| `paper`, `paper-2`, `paper-3` | Page, raised surface, sunken surface (warm ivory; deep green-black in dark) |
| `ink`, `ink-2`, `muted`, `faint` | Headings, reading text, secondary text, quiet metadata. All meet WCAG AA (4.5:1) on every surface in both themes |
| `line`, `line-strong`, `control` | Hairlines, stronger dividers, form-field borders (3:1) |
| `emerald` | The one interactive accent: one primary action per view, focus rings, selected states |
| `gold` | Small ornaments and labels only |

Type: Fraunces for headings and the English reading text (optical size on), Outfit for interface text, Scheherazade New for Arabic reading text and Amiri for Arabic headings. Book covers are generated (`BookCover`) at 2:3 with lettering in container units, so they look the same at any size or text setting. Shared component classes (`.btn`, `.link`, `.field`, `.segment`, `.tool-btn`, `.round-btn`, `.eyebrow`) are in the same stylesheet.

Layout: the home page is a dashboard (hero card, "Continue reading" when this device has a saved place, and the books as cards with an "Open book" action). Search and subject filters live on `/library`. On phones the sections (Home, Library, Glossary, Sources) are a tab bar fixed to the bottom of the screen (`TabBar`); from the `md` breakpoint they are links in the header. Both read from `src/components/nav-links.ts`.



Metadata on the book (`Book.translations`), text in separate files (`src/content/translations/`), keyed by stable passage id and attached at load time, so `npm run content` can never erase a translation. A translation is shown only when `isPublishable` passes: verified, with a dated review record, translator, source, licence and licence evidence. One translation is registered: `en-zaibaitech-2026`, the English of the library's bilingual edition, with notes and headings. It is published (`verified`, reviewed 2026-10-22 by the library's language reviewer). Setting it back to `in-review` hides it everywhere, including from the page source.

Full workflow, tooling (`translations:worksheet`, `scripts/translation-import.mjs`, `translations:check`) and review rules: [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).

## How to add a new book

1. Add an author to `src/content/authors.ts` if needed (add `bio` only with a citable source).
2. Add a `Book` to `src/content/books.ts` (`authorId`, `subjects`, `summary`, `description`, `level`, `translations: []`). Use `status: "coming-soon"` until the text exists.
3. For a readable book, add `src/content/books/<id>.json` (`BookContent`: `source` with licence, then `chapters[].units[]`) and register it in `src/content/library.ts`. Ids must be `<chapterId>.pNN` (two digits, from 01); `npm test` enforces this.
4. Rebuild Akhdari from the OpenITI files if you change those sources: `npm run content`. The English books are rebuilt with `npm run content:three-books`.
   - **For a book in English** (its published English edition, not an Arabic text):
     - give the `Book` an `edition` record (translator, editor, copyright, ISBN, edition, rights and permission), copied from its title and copyright pages
     - register a `ProseBookContent` in `getReadableContent`
     - the reader then shows it without Arabic controls
5. Optional: glossary entries (`src/content/glossary.ts`), practice (`src/content/practice/`).
6. Run `npm test`. It checks id integrity, that forthcoming books have no content, that vowelled and unvowelled text agree, and that glossary and practice point at real passages.

## Not built, on purpose

Accounts, payments, author publishing and a database. The model (authors, books, editions' sources, licences, translation review status) is shaped so they can be added later without reworking the reader.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS, lucide-react; `tsx` for tests. Deploy on Vercel with the default build. Nothing here deploys itself.
