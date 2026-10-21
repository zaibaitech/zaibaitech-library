import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Missing page</p>
      <h1 className="mt-3 font-display text-4xl text-ink">That is not on the shelf.</h1>
      <p className="mt-3 text-muted">The library only opens books that are in the catalogue.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-emerald px-5 py-3 text-sm font-medium text-paper">
        Back to the shelf
      </Link>
    </div>
  );
}
