import { Fragment, type ReactNode } from "react";
import type { ProseUnit } from "@/content/types";
import { cn } from "@/lib/cn";
import { emphasisRuns, isInvocation } from "@/lib/emphasis";
import { Rosette } from "../geometric";

/**
 * Text of an English book with the print's emphasis (see `emphasisRuns`): plain text stays upright; only marked runs
 * are bold or italic. A line break is kept where the print breaks the line (a signature).
 */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, l) => (
        <Fragment key={l}>
          {l > 0 ? <br /> : null}
          {emphasisRuns(line).map((run, i) => {
            if (run.bold && run.italic) return <strong key={i} className="font-semibold text-ink"><em>{run.text}</em></strong>;
            if (run.bold) return <strong key={i} className="font-semibold text-ink">{run.text}</strong>;
            if (run.italic) return <em key={i}>{run.text}</em>;
            return run.text;
          })}
        </Fragment>
      ))}
    </>
  );
}

/** A section of an English book opens with its heading, under the part's title when a new part begins. */
export function ProseHeading({ id, heading, part }: { id: string; heading: string; part?: string }) {
  const opensPart = part !== undefined && part === heading;
  return (
    <header className="mb-6 text-center" lang="en">
      {part && !opensPart ? (
        <p className="mb-4 flex items-center justify-center gap-3 text-gold">
          <span aria-hidden className="h-px w-8 shrink-0 bg-gold/40" />
          <span className="eyebrow">{part.replace(/:.*$/, "")}</span>
          <span aria-hidden className="h-px w-8 shrink-0 bg-gold/40" />
        </p>
      ) : null}
      {opensPart ? <Rosette className="mx-auto mb-3 h-5 w-5 text-gold/80" /> : null}
      <h2
        id={id}
        className={cn(
          "mx-auto max-w-xl text-balance font-display leading-snug text-ink",
          opensPart ? "text-[1.6rem] sm:text-[1.9rem]" : "text-[1.3rem] sm:text-[1.5rem]",
        )}
      >
        {heading}
      </h2>
    </header>
  );
}

/** One passage of an English book, set as the print sets it. `after` is placed at the end (the bookmark button). */
export function ProsePassage({ unit, fontSize, after }: { unit: ProseUnit; fontSize: string; after: ReactNode }) {
  const body =
    unit.kind === "table" && unit.rows ? (
      <div className="max-w-[34em]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[0.92em] leading-snug">
            <thead>
              <tr>
                {unit.rows[0].map((cell, c) => (
                  <th key={c} scope="col" className="border-b border-line-strong px-2 py-2 font-semibold text-ink first:pl-0">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unit.rows.slice(1).map((row, r) => (
                <tr key={r} className="border-b border-line">
                  {row.map((cell, c) => (
                    <td key={c} className="px-2 py-1.5 align-top first:pl-0 [overflow-wrap:anywhere]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {after}
      </div>
    ) : (
      <p
        className={cn(
          "max-w-[34em]",
          // Paragraphs and numbered items are justified; the invocation is centred and a signature stays ragged.
          unit.kind !== "signature" && !isInvocation(unit.text) && "reading-justify",
          unit.kind === "item" && "ps-[1.6em] -indent-[1.6em]",
          unit.kind === "signature" && "mt-2",
          // The invocation stands on its own, centred, before the text begins.
          isInvocation(unit.text) && "invocation mx-auto py-2 text-center text-[1.05em] text-ink",
        )}
      >
        <Inline text={unit.text} />
        {after}
      </p>
    );
  return (
    <div className="translation-text text-ink-2" lang="en" style={{ fontSize }}>
      {unit.heading ? (
        <h3 className="mb-2 max-w-[34em] font-display text-[1.08em] font-semibold leading-snug text-ink">{unit.heading}</h3>
      ) : null}
      {body}
    </div>
  );
}
