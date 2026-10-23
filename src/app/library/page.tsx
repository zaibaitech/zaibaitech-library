import type { Metadata } from "next";
import { Catalogue } from "@/components/library/catalogue";
import { catalogueEntries } from "@/lib/library-view";

export const metadata: Metadata = {
  title: "Library",
  description: "Every title in the Zaibaitech Library, with search and subject filters.",
};

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-page px-4 pb-8 pt-8 sm:px-8 sm:pt-12">
      <p className="eyebrow">The collection</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-ink [font-variant-caps:small-caps] sm:text-5xl">The library</h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-2">
        Search by title, author or subject. Titles marked forthcoming are planned and cannot be opened yet.
      </p>
      <Catalogue entries={catalogueEntries()} />
    </div>
  );
}
