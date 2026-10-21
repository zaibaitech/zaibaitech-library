"use client";

import { useMemo, useState } from "react";
import type { BookContent, DecisionGuide } from "@/content/types";
import { LicenseNote } from "../license-note";
import { SourceLine } from "./source-line";

export function DecisionPanel({
  guides,
  bookId,
  content,
}: {
  guides: DecisionGuide[];
  bookId: string;
  content: BookContent;
}) {
  const [guideId, setGuideId] = useState(guides[0]?.id ?? "");
  const guide = guides.find((item) => item.id === guideId) ?? guides[0];
  const [nodeId, setNodeId] = useState(guide?.start ?? "");
  const [trail, setTrail] = useState<string[]>([]);

  function open(id: string) {
    const next = guides.find((item) => item.id === id);
    setGuideId(id);
    setNodeId(next?.start ?? "");
    setTrail([]);
  }

  const node = useMemo(() => guide?.nodes.find((item) => item.id === nodeId) ?? null, [guide, nodeId]);

  if (!guide || !node) return null;

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {guides.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => open(item.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
              item.id === guide.id ? "bg-gold-soft text-ink" : "border border-line"
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{guide.intro}</p>
      <div className="mt-4 rounded-3xl border border-line bg-paper-2 p-4 sm:p-6">
        <SourceLine content={content} bookId={bookId} unitId={node.sourceUnitId} />
        <h3 className="mt-4 font-display text-2xl text-ink">{node.prompt}</h3>
        {node.result ? <p className="mt-3 text-sm leading-relaxed text-ink">{node.result}</p> : null}
        {node.choices ? (
          <ul className="mt-4 space-y-2">
            {node.choices.map((choice) => (
              <li key={choice.label}>
                <button
                  type="button"
                  className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-left text-sm leading-relaxed hover:border-gold"
                  onClick={() => {
                    setTrail((current) => [...current, node.id]);
                    setNodeId(choice.next);
                  }}
                >
                  {choice.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {trail.length > 0 ? (
            <button
              type="button"
              className="rounded-full border border-line px-4 py-2 text-sm"
              onClick={() => {
                const previous = trail[trail.length - 1];
                setTrail((current) => current.slice(0, -1));
                if (previous) setNodeId(previous);
              }}
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            className="rounded-full border border-line px-4 py-2 text-sm"
            onClick={() => {
              setNodeId(guide.start);
              setTrail([]);
            }}
          >
            Start again
          </button>
        </div>
      </div>
      <div className="mt-4">
        <LicenseNote className="text-xs" />
      </div>
    </div>
  );
}
