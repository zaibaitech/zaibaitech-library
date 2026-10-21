import { LicenseNote } from "./license-note";

export function SiteFooter() {
  return (
    <footer className="no-print mt-16 border-t border-line">
      <div className="mx-auto flex min-w-0 max-w-6xl flex-col gap-3 px-4 py-8">
        <p className="font-display text-lg text-ink">Zaibaitech Library</p>
        <LicenseNote />
        <p className="text-sm text-muted">
          A reading room for classical manuals. The last line you were on stays on this device.
        </p>
      </div>
    </footer>
  );
}
