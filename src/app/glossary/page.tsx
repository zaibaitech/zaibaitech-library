import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { glossary, glossaryGroups } from "@/content/glossary";
import { glossaryEnabled } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Glossary",
  description: "How Mukhtasar al-Akhdari uses the words that sort acts of worship.",
};

export default function GlossaryPage() {
  if (!glossaryEnabled) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Tap-to-define</p>
      <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">Glossary</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">
        These notes say how Mukhtasar al-Akhdari uses a word. They are not a translation of the sentences the word sits in.
        In the reader, the first time a word appears in a passage it can be tapped.
      </p>
      <p className="mt-3 rounded-2xl border border-line bg-paper-2 px-4 py-3 text-sm leading-relaxed text-muted">
        These are editorial notes for learners, written from the text of the book. They have not yet been reviewed by a
        qualified teacher. Where they matter for your own worship, ask one.
      </p>
      {glossaryGroups.map((group) => (
        <section key={group} className="mt-10">
          <h2 className="font-display text-2xl text-ink">{group}</h2>
          <ul className="mt-4 space-y-4">
            {glossary
              .filter((term) => term.group === group)
              .map((term) => (
                <li key={term.id} id={term.id} className="card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl text-ink">{term.transliteration}</h3>
                      <p className="mt-1 text-sm text-muted">{term.short}</p>
                    </div>
                    <p className="font-amiri text-3xl text-ink" dir="rtl" lang="ar">
                      {term.arabic}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink">{term.body}</p>
                  {term.chapterId ? (
                    <Link
                      href={`/books/akhdari/read#${term.chapterId}`}
                      className="mt-3 inline-flex text-sm font-medium text-emerald underline decoration-gold underline-offset-4"
                    >
                      Open the chapter
                    </Link>
                  ) : null}
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
