import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="eyebrow">Page not found</p>
      <h1 className="mt-3 font-display text-4xl text-ink">That is not on the shelf.</h1>
      <p className="mt-3 text-muted">
        The library only opens books that are in the catalogue and whose text is available.
      </p>
      <Link href="/" className="btn btn-primary mt-6">
        Back to the library
      </Link>
    </div>
  );
}
