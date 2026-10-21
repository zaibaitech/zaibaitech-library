import type { BookPractice } from "../types";
import { akhdariPractice } from "./akhdari";

const practiceByBook: Record<string, BookPractice> = {
  akhdari: akhdariPractice,
};

export function getPractice(bookId: string): BookPractice | null {
  return practiceByBook[bookId] ?? null;
}

export function practiceBookIds() {
  return Object.keys(practiceByBook);
}
