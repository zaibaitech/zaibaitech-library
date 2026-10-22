import Link from "next/link";
import { LicenseNote } from "./license-note";

export function SiteFooter() {
  return (
    <footer className="no-print mt-16 border-t border-line">
      <div className="mx-auto flex min-w-0 max-w-6xl flex-col gap-3 px-4 py-8">
        <p className="font-display text-lg text-ink">Zaibaitech Library</p>
        <LicenseNote />
        <p className="text-sm text-muted">
          Your place in a book, bookmarks and display choices stay on this device. There are no accounts.{" "}
          <Link href="/about" className="font-medium text-ink underline decoration-gold/60 underline-offset-4">
            Sources and licensing
          </Link>
        </p>
      </div>
    </footer>
  );
}
