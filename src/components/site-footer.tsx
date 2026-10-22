import Link from "next/link";
import { TEXT_CREDIT } from "@/content/books";
import { Rosette } from "./geometric";

export function SiteFooter() {
  return (
    <footer className="no-print mt-20 border-t border-line">
      <div className="mx-auto grid max-w-page gap-6 px-5 py-10 text-sm sm:grid-cols-[1fr_auto] sm:px-8">
        <div className="max-w-xl">
          <p className="flex items-center gap-2 font-display text-base text-ink">
            <Rosette className="h-4 w-4 text-gold" />
            Zaibaitech Library
          </p>
          <p className="mt-3 leading-relaxed text-muted">
            <a className="link font-normal" href={TEXT_CREDIT.href}>
              {TEXT_CREDIT.label}
            </a>
            . Translations are credited on each book&apos;s page. Your place, bookmarks and display choices stay on this device;
            there are no accounts.
          </p>
        </div>
        <nav aria-label="Footer" className="flex gap-6 text-muted sm:flex-col sm:gap-2 sm:text-right">
          <Link href="/" className="hover:text-ink">
            Library
          </Link>
          <Link href="/about" className="hover:text-ink">
            Sources and licensing
          </Link>
        </nav>
      </div>
    </footer>
  );
}
