import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { books, TEXT_CREDIT } from "@/content/books";
import { getBookContent } from "@/content/library";

export const metadata: Metadata = {
  title: "Sources and licensing",
  description: "Where the Arabic text comes from, how it is licensed, and what has been corrected.",
};

type Correction = { n: string; was: string; now: string; where: string; why: string };

/** Read the corrections table straight from CORRECTIONS.md so the page cannot drift from the record. */
function loadCorrections(): Correction[] {
  const raw = readFileSync(path.join(process.cwd(), "CORRECTIONS.md"), "utf8");
  return raw
    .split("\n")
    .filter((line) => /^\|\s*\d+\s*\|/.test(line))
    .map((line) => {
      const [, n, was, now, where, why] = line.split("|").map((cell) => cell.trim());
      return { n, was, now, where, why };
    });
}

export default function AboutPage() {
  const corrections = loadCorrections();
  const readable = books.filter((book) => book.status === "readable" && getBookContent(book.id));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="eyebrow">About the texts</p>
      <h1 className="mt-2 font-display text-4xl text-ink">Sources and licensing</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">
        Zaibaitech Library shows classical Arabic texts as faithfully as its sources allow. The Arabic line is the
        source. Anything written in English on this site is a learner&apos;s aid, not a translation and not a fatwa.
      </p>

      <section className="mt-10" aria-labelledby="arabic-heading">
        <h2 id="arabic-heading" className="font-display text-2xl text-ink">
          Arabic text
        </h2>
        <ul className="mt-3 space-y-3">
          {readable.map((book) => {
            const source = getBookContent(book.id)!.source;
            return (
              <li key={book.id} className="card p-4 text-sm leading-relaxed text-muted [overflow-wrap:anywhere]">
                <Link href={`/books/${book.id}`} className="font-medium text-ink underline decoration-gold/60 underline-offset-4">
                  {book.title}
                </Link>
                . {source.openiti}. Licensed{" "}
                <a href={source.licenseUrl} className="font-medium text-ink underline decoration-gold/60 underline-offset-4">
                  {source.license}
                </a>
                : attribution required, non-commercial use only, derivatives shared under the same licence.
              </li>
            );
          })}
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
          The library does not machine-translate books or present unreviewed wording as authoritative. A translation is
          shown only when its translator, source and licence are recorded and it has been reviewed. Today no book has
          one, and the reader says so. A translation&apos;s licence is separate from the Arabic text&apos;s licence.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="corrections">
        <h2 id="corrections" className="font-display text-2xl text-ink">
          Corrections to the Arabic
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The OpenITI copy of al-Akhdari contains evident copy errors. Each repair below is mechanical (a split word, a
          doubled word, a swapped letter) and is flagged for scholarly review. Numbers and unusual wording were left as
          the witness has them. The full record, with reasons, is in <code>CORRECTIONS.md</code> in the repository.
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">Corrections made to the Arabic text</caption>
            <thead className="bg-gold-soft/50 text-ink">
              <tr>
                <th scope="col" className="px-3 py-2">#</th>
                <th scope="col" className="px-3 py-2">Was</th>
                <th scope="col" className="px-3 py-2">Now</th>
                <th scope="col" className="px-3 py-2">Where</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {corrections.map((row) => (
                <tr key={row.n}>
                  <td className="px-3 py-2 text-muted">{row.n}</td>
                  <td className="px-3 py-2 font-amiri text-lg" lang="ar" dir="rtl">{row.was}</td>
                  <td className="px-3 py-2 font-amiri text-lg" lang="ar" dir="rtl">{row.now}</td>
                  <td className="px-3 py-2 text-muted">{row.where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="review-heading">
        <h2 id="review-heading" className="font-display text-2xl text-ink">
          Review status
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
          <li>Arabic text: OpenITI witness plus the corrections above, awaiting scholarly review.</li>
          <li>Glossary notes: editorial, written to describe how the book uses a word; awaiting review by a qualified teacher.</li>
          <li>Guided practice and knowledge checks: not published until reviewed against the Arabic.</li>
        </ul>
      </section>
    </div>
  );
}
