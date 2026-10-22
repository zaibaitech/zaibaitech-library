import { Rosette } from "@/components/geometric";
import { HomeFeature } from "@/components/home/home-feature";
import { HomeLibrary } from "@/components/home/home-library";
import { catalogueEntries, resumeIndex } from "@/lib/library-view";

const FEATURED_ID = "akhdari";

export default function HomePage() {
  const entries = catalogueEntries();
  const featured = entries.find((entry) => entry.id === FEATURED_ID && entry.readable) ?? entries.find((e) => e.readable);
  const hasTranslation = entries.some((entry) => entry.readable && entry.languages.length > 1);

  return (
    <div className="mx-auto max-w-page px-5 pb-8 pt-12 sm:px-8 sm:pt-20">
      <p className="flex items-center gap-2 text-gold">
        <Rosette className="h-4 w-4" />
        <span className="eyebrow">Zaibaitech Library</span>
      </p>
      <h1 className="mt-5 max-w-3xl font-display text-[2.5rem] leading-[1.06] tracking-tight text-ink sm:text-6xl">
        Classical Islamic texts, set for careful reading.
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
        Foundational manuals in fully vowelled Arabic
        {hasTranslation ? ", with a reviewed English translation where one has been published" : ""}. Your place is kept on
        this device.
      </p>

      <HomeLibrary
        entries={entries}
        feature={featured ? <HomeFeature featured={featured} entries={entries} index={resumeIndex()} /> : null}
      />
    </div>
  );
}
