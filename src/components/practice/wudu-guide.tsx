"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import type { Guide } from "@/content/types";
import { ClassPill } from "../class-pill";
import { WuduScene } from "./wudu-scene";

export function WuduGuide({ guide, bookId }: { guide: Guide; bookId: string }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = guide.steps[index];

  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % guide.steps.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [guide.steps.length, playing]);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(240px,320px)_minmax(0,1fr)] [&>*]:min-w-0">
      <div className="rounded-3xl border border-line bg-paper-2 p-4 lg:sticky lg:top-24">
        <WuduScene highlight={step.highlight} />
        <p className="mt-2 text-center text-xs text-muted">
          Water moves on the wash steps. A wipe, a name, or an intention is drawn without a stream.
        </p>
      </div>
      <div>
        <p className="text-sm leading-relaxed text-muted">{guide.intro}</p>
        <div key={step.id} className="step-enter mt-5 rounded-3xl border border-line bg-paper-2 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <ClassPill value={step.classification} />
            <span className="text-sm text-muted">
              Step {index + 1} of {guide.steps.length}
            </span>
          </div>
          <h3 className="mt-4 font-display text-3xl text-ink">{step.title}</h3>
          <p className="mt-2 font-amiri text-3xl text-ink" dir="rtl" lang="ar">
            {step.titleAr}
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink">{step.note}</p>
          <Link
            href={`/books/${bookId}/read#${step.sourceUnitId}`}
            className="mt-5 inline-flex text-sm font-medium text-emerald underline decoration-gold underline-offset-4"
          >
            Read the Arabic line this step comes from
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
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
        <ol className="mt-5 flex flex-wrap gap-2">
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
                className={`h-2.5 w-6 rounded-full ${itemIndex === index ? "bg-gold" : "bg-line"}`}
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
