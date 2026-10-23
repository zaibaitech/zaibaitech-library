import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { books, TEXT_CREDIT } from "@/content/books";
import { getBookContent } from "@/content/library";
import type { BookContent } from "@/content/types";
import { longDate } from "@/lib/dates";
import { availableTranslations } from "@/lib/translations";

export const metadata: Metadata = {
  title: "Sources and licensing",
  description: "Where the Arabic text comes from, how it is licensed, and what has been corrected.",
};

type Correction = { n: string; was: string; now: string; where: string; why: string };
type Restoration = { n: string; restored: string; passageId: string | null; detail: string; note: string };

/** The numbered rows of one table in CORRECTIONS.md: the rows that follow a "## heading" line, up to the next heading. */
function tableRows(raw: string, heading: string): string[][] {
  const start = raw.indexOf(heading);
  if (start < 0) return [];
  const rest = raw.slice(start + heading.length);
  const end = rest.search(/\n## /);
  return (end < 0 ? rest : rest.slice(0, end))
    .split("\n")
    .filter((line) => /^\|\s*\d+\s*\|/.test(line))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));
}

/** Read the tables straight from CORRECTIONS.md so the page cannot drift from the record. */
function loadRecord() {
  const raw = readFileSync(path.join(process.cwd(), "CORRECTIONS.md"), "utf8");
  const corrections: Correction[] = tableRows(raw, "# Arabic corrections").map(([n, was, now, where, why]) => ({ n, was, now, where, why }));
  const restorations: Restoration[] = tableRows(raw, "## Words restored").map(([n, restored, passage, note]) => {
    // e.g. "`salah_conditions.p04`, before خروج الوقت"
    const match = passage.match(/^`([^`]+)`,?\s*(.*)$/);
    return { n, restored, passageId: match?.[1] ?? null, detail: match ? match[2] : passage, note };
  });
  return { corrections, restorations };
}

/** "Prayer times, passage 4" for a passage id, so readers never see raw ids. */
function placeName(content: BookContent | null, passageId: string | null) {
  if (!content || !passageId) return null;
  for (const chapter of content.chapters) {
    const unit = chapter.units.find((u) => u.id === passageId);
    if (unit) return { label: `${chapter.headingEn}, passage ${unit.number}`, href: `/books/akhdari/read#${unit.id}` };
  }
  return null;
}

export default function AboutPage() {
  const { corrections, restorations } = loadRecord();
  const readable = books
    .map((book) => ({ book, content: book.status === "readable" ? getBookContent(book.id) : null }))
    .filter((entry): entry is { book: (typeof books)[number]; content: BookContent } => entry.content !== null);
  const translated = readable.flatMap(({ book, content }) => availableTranslations(book, content).map((info) => ({ book, info })));
  const akhdari = getBookContent("akhdari");
  const englishBooks = books.filter((book) => book.status === "readable" && book.edition);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="eyebrow">About the texts</p>
      <h1 className="mt-2 font-display text-4xl text-ink">Sources and licensing</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">
        Zaibaitech Library shows classical Arabic texts as faithfully as its sources allow. The Arabic is the source
        text. An English translation appears only after it has been reviewed for publication, and none of it is a
        fatwa.
      </p>

      <section className="mt-10" aria-labelledby="arabic-heading">
        <h2 id="arabic-heading" className="font-display text-2xl text-ink">
          Arabic text
        </h2>
        <ul className="mt-3 space-y-3">
          {readable.map(({ book, content }) => (
            <li key={book.id} className="card p-4 text-sm leading-relaxed text-muted [overflow-wrap:anywhere]">
              <Link href={`/books/${book.id}`} className="link">
                {book.title}
              </Link>
              . {content.source.openiti}. Licensed{" "}
              <a href={content.source.licenseUrl} className="link">
                {content.source.license}
              </a>
              : attribution required, non-commercial use only, derivatives shared under the same licence.
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          Short form shown across the site: <span className="text-ink">{TEXT_CREDIT.label}</span>.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="translation-heading">
        <h2 id="translation-heading" className="font-display text-2xl text-ink">
          Translations
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The library does not machine-translate books. A translation is shown only when its translator, source and
          licence are recorded and a reviewer has approved it for publication. A translation&apos;s licence is separate
          from the Arabic text&apos;s licence.
        </p>
        {translated.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {translated.map(({ book, info }) => (
              <li key={info.translationId} className="card p-4 text-sm leading-relaxed text-muted">
                <Link href={`/books/${book.id}`} className="link">
                  {book.title}
                </Link>
                : {info.languageLabel} translation by {info.translator}, licensed{" "}
                {info.licenseUrl ? (
                  <a href={info.licenseUrl} className="link">
                    {info.license}
                  </a>
                ) : (
                  info.license
                )}
                .{info.review ? ` Reviewed for publication ${longDate(info.review.reviewedOn)}.` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">No translation has been published yet.</p>
        )}
      </section>

      {englishBooks.length > 0 ? (
        <section className="mt-10" aria-labelledby="english-heading">
          <h2 id="english-heading" className="font-display text-2xl text-ink">
            Books in English
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            These books are held as their published English edition, not as an Arabic text with a translation. Their
            text is copied from the printed edition without rewording; the few places where the print itself is
            defective are corrected and listed in the edition&apos;s source record. They are not openly licensed: all
            rights are reserved by the copyright holder, who has permitted the library to display them in full.
          </p>
          <ul className="mt-3 space-y-3">
            {englishBooks.map((book) => (
              <li key={book.id} className="card p-4 text-sm leading-relaxed text-muted">
                <Link href={`/books/${book.id}`} className="link">
                  {book.title}
                </Link>
                : by {book.edition!.author}. Translated by {book.edition!.translator}, edited by {book.edition!.editor}.{" "}
                {book.edition!.copyright}, ISBN {book.edition!.isbn}, {book.edition!.edition}.
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10" aria-labelledby="corrections">
        <h2 id="corrections" className="font-display text-2xl text-ink">
          Corrections to the Arabic
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The OpenITI copy of al-Akhdari contains evident copy errors. Each repair below is mechanical (a split word, a
          doubled word, a swapped letter) and is flagged for scholarly review. Numbers and unusual wording were left as
          the source has them.
        </p>
        <CorrectionList rows={corrections} />

        <h3 className="mt-10 font-display text-xl text-ink">Words restored from the Cairo edition</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          These words are missing from the OpenITI copy and were restored from the Cairo (Subayh) printing. The reader
          shows them in square brackets, so it is always clear what was added.
        </p>
        <ol className="mt-4 divide-y divide-line rounded-2xl border border-line">
          {restorations.map((row) => {
            const place = placeName(akhdari, row.passageId);
            return (
              <li key={row.n} className="grid gap-1 p-4 text-sm sm:grid-cols-[2rem_minmax(0,1fr)] sm:gap-x-3">
                <span className="text-faint">{row.n}</span>
                <div className="min-w-0">
                  <p className="w-fit max-w-full font-amiri text-xl leading-relaxed text-ink" lang="ar" dir="rtl">
                    {row.restored}
                  </p>
                  <p className="mt-1 text-muted">
                    {place ? (
                      <Link href={place.href} className="link font-normal">
                        {place.label}
                      </Link>
                    ) : null}
                    {row.detail ? (
                      <>
                        {place ? ", " : ""}
                        <bdi>{row.detail}</bdi>
                      </>
                    ) : null}
                  </p>
                  <p className="mt-1 leading-relaxed text-muted">{row.note}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="review-heading">
        <h2 id="review-heading" className="font-display text-2xl text-ink">
          Review status
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
          <li>Arabic text: the OpenITI copy plus the corrections and restorations above, awaiting scholarly review.</li>
          {translated.map(({ book, info }) => (
            <li key={info.translationId}>
              {info.languageLabel} translation of {book.title}:{" "}
              {info.review ? `reviewed for publication ${longDate(info.review.reviewedOn)}.` : "published."}
            </li>
          ))}
          <li>Glossary notes: editorial, written to describe how the book uses a word; awaiting review by a qualified teacher.</li>
          <li>Guided practice and knowledge checks: not published until reviewed against the Arabic.</li>
        </ul>
      </section>
    </div>
  );
}

/** A table from the sm breakpoint; stacked entries on phones, where four columns cannot fit. */
function CorrectionList({ rows }: { rows: Correction[] }) {
  return (
    <>
      <ol className="mt-4 divide-y divide-line rounded-2xl border border-line sm:hidden">
        {rows.map((row) => (
          <li key={row.n} className="p-4 text-sm">
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-faint">{row.n}</span>
              <span className="font-amiri text-lg text-muted line-through decoration-faint" lang="ar" dir="rtl">
                {row.was}
              </span>
              <span className="text-faint" aria-hidden>
                →
              </span>
              <span className="sr-only">corrected to</span>
              <span className="font-amiri text-lg text-ink" lang="ar" dir="rtl">
                {row.now}
              </span>
            </p>
            <p className="mt-1 text-muted">{row.where}</p>
            <p className="mt-1 leading-relaxed text-faint">{row.why}</p>
          </li>
        ))}
      </ol>
      <div className="mt-4 hidden overflow-hidden rounded-2xl border border-line sm:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Corrections made to the Arabic text</caption>
          <thead className="bg-gold-soft/50 text-ink">
            <tr>
              <th scope="col" className="px-3 py-2">#</th>
              <th scope="col" className="px-3 py-2">Was</th>
              <th scope="col" className="px-3 py-2">Now</th>
              <th scope="col" className="px-3 py-2">Where and why</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.n} className="align-top">
                <td className="px-3 py-2 text-muted">{row.n}</td>
                <td className="px-3 py-2 font-amiri text-lg" lang="ar" dir="rtl">{row.was}</td>
                <td className="px-3 py-2 font-amiri text-lg" lang="ar" dir="rtl">{row.now}</td>
                <td className="px-3 py-2 text-muted">
                  {row.where}
                  <span className="mt-0.5 block text-xs leading-relaxed text-faint">{row.why}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
