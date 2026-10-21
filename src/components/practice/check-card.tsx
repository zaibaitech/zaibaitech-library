"use client";

import { useState } from "react";
import type { BookContent, CheckCard as CheckCardData } from "@/content/types";
import { LicenseNote } from "../license-note";
import { SourceLine } from "./source-line";

export function CheckCard({
  card,
  bookId,
  content,
}: {
  card: CheckCardData;
  bookId: string;
  content: BookContent;
}) {
  const [marked, setMarked] = useState<string[]>([]);

  function toggle(id: string) {
    setMarked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <div className="rounded-3xl border border-line bg-paper-2 p-4 sm:p-6">
      <p className="text-xs uppercase tracking-[0.16em] text-gold">From one line</p>
      <h3 className="mt-2 font-display text-2xl text-ink">{card.title}</h3>
      <div className="mt-3">
        <SourceLine content={content} bookId={bookId} unitId={card.sourceUnitId} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{card.intro}</p>
      <ul className="mt-4 space-y-2">
        {card.items.map((item) => {
          const on = marked.includes(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => toggle(item.id)}
                className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm ${
                  on ? "border-emerald bg-emerald/10" : "border-line bg-paper"
                }`}
              >
                <span className={`mt-0.5 h-4 w-4 shrink-0 rounded border ${on ? "border-emerald bg-emerald" : "border-line"}`} />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-ink">{card.closing}</p>
      <div className="mt-4">
        <LicenseNote className="text-xs" />
      </div>
    </div>
  );
}
