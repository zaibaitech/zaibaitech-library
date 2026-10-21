import Link from "next/link";
import { books } from "@/content/books";
import { BookPlate } from "@/components/book-plate";
import { LicenseNote } from "@/components/license-note";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs uppercase tracking-[0.22em] text-gold">Zaibaitech</p>
      <h1 className="mt-2 font-display text-4xl text-ink">The shelf</h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
        Mukhtasar al-Akhdari, in Arabic. English on this shelf names the book and its chapters.
      </p>
      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {books.map((book) => (
          <li key={book.id}>
            <Link href={`/books/${book.id}`} className="group block">
              <BookPlate book={book} compact />
              <p className="mt-3 font-medium text-ink group-hover:text-emerald">{book.title}</p>
              <p className="text-sm text-muted">
                {book.author}
                {book.status === "readable" ? "" : " · text not loaded"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm leading-relaxed text-muted">
        Al-Risala and Mukhtasar Khalil are on the shelf as the next titles. They have no text yet.
      </p>
      <div className="mt-8">
        <LicenseNote />
      </div>
    </div>
  );
}
