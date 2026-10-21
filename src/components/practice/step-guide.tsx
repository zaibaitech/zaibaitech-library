"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { BookContent, Guide } from "@/content/types";
import { ClassPill } from "../class-pill";
import { LicenseNote } from "../license-note";
import { IllustratedFigure } from "./illustrated-figure";
import { SourceLine } from "./source-line";

function captionFor(kind: Guide["kind"], highlight: string) {
  if (highlight === "fawr") return "One act after another — the sequence on this line.";
  if (kind === "tayammum") return "A wipe across the part this step names. No stream.";
  if (kind === "salah" || kind === "posture") return "The posture this step names, in the order the line gives.";
  if (highlight === "niyyah" || highlight === "tasmiya" || highlight === "siwak" || highlight === "private") {
    return "A name or an intention is marked. The wash itself is not drawn here.";
  }
  return "Rubbing moves on the wash.";
}

export function StepGuide({
  guide,
  bookId,
  content,
}: {
  guide: Guide;
  bookId: string;
  content: BookContent;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = guide.steps[index];

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [guide.id]);

  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % guide.steps.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [guide.steps.length, playing]);

  return (
    <div>
      <p className="text-xs leading-relaxed text-muted sm:text-sm">{guide.intro}</p>
      <div className="guide-fit mt-4">
        <div className="guide-figure">
          <IllustratedFigure highlight={step.highlight} kind={guide.kind} />
          <ol className="sequence" aria-label="Sequence of this guide">
            {guide.steps.map((item, itemIndex) => (
              <li key={item.id}>
                <button
                  type="button"
                  aria-label={item.title}
                  aria-current={itemIndex === index}
                  onClick={() => {
                    setPlaying(false);
                    setIndex(itemIndex);
                  }}
                  className={itemIndex === index ? "is-current" : itemIndex < index ? "is-done" : undefined}
                />
              </li>
            ))}
          </ol>
          <p className="sequence-caption">{captionFor(guide.kind, step.highlight)}</p>
        </div>
        <div key={step.id} className="guide-note step-enter">
          <div className="flex flex-wrap items-center gap-2">
            <ClassPill value={step.classification} />
            <span className="text-sm text-muted">
              Step {index + 1} of {guide.steps.length}
            </span>
          </div>
          <h3 className="mt-1 font-display text-xl leading-tight text-ink">{step.title}</h3>
          <p className="mt-0.5 font-amiri text-xl leading-snug text-ink" dir="rtl" lang="ar">
            {step.titleAr}
          </p>
          <div className="mt-2">
            <SourceLine content={content} bookId={bookId} unitId={step.sourceUnitId} compact />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink">{step.note}</p>
          {step.highlight === "private" ? (
            <p className="mt-2 text-xs leading-relaxed text-muted">The figure stays clothed. The line names the wash.</p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-full border border-line px-4 py-2 text-sm"
          onClick={() => {
            setPlaying(false);
            setIndex((current) => (current - 1 + guide.steps.length) % guide.steps.length);
          }}
        >
          Previous
        </button>
        <button
          type="button"
          className="rounded-full bg-emerald px-4 py-2 text-sm font-medium text-paper"
          onClick={() => {
            setPlaying(false);
            setIndex((current) => (current + 1) % guide.steps.length);
          }}
        >
          Next
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm"
          onClick={() => setPlaying((value) => !value)}
          aria-pressed={playing}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? "Pause" : "Play through"}
        </button>
      </div>
      <div className="mt-4">
        <LicenseNote className="text-xs" />
      </div>
    </div>
  );
}
