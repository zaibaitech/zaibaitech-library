"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export type Choice = { key: string; label: string };

/**
 * The reader's display settings, opened from the toolbar's "Aa" button.
 * Escape or a click outside closes it and returns focus to the button.
 */
export function DisplayPanel({
  id,
  onClose,
  anchorRef,
  children,
}: {
  id: string;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>("button, [tabindex='0']")?.focus();
    const anchor = anchorRef.current;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        anchor?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !anchor?.contains(target)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [anchorRef, onClose]);

  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-label="Display settings"
      className="absolute inset-x-0 top-full z-40 border-b border-line bg-paper-2 shadow-lift sm:inset-x-auto sm:right-4 sm:top-[calc(100%+0.5rem)] sm:w-[22rem] sm:rounded-lg sm:border"
    >
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-5 sm:px-5">{children}</div>
    </div>
  );
}

export function PanelRow({ label, children, note }: { label: string; children: ReactNode; note?: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{label}</p>
      <div className="mt-2">{children}</div>
      {note ? <p className="mt-1.5 text-xs text-muted">{note}</p> : null}
    </div>
  );
}

/** A radio group drawn as a segmented control, with arrow-key navigation (WAI-ARIA radio group pattern). */
export function Segmented({ label, value, choices, onChange }: { label: string; value: string; choices: Choice[]; onChange: (key: string) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, choices.findIndex((choice) => choice.key === value));
  const move = (event: KeyboardEvent<HTMLDivElement>) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key as string];
    let next: number | null = delta === undefined ? null : (index + delta + choices.length) % choices.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = choices.length - 1;
    if (next === null) return;
    event.preventDefault();
    onChange(choices[next].key);
    refs.current[next]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={move} className="flex gap-1 rounded-lg bg-paper-3 p-1">
      {choices.map((choice, i) => (
        <button
          key={choice.key}
          ref={(node) => {
            refs.current[i] = node;
          }}
          type="button"
          role="radio"
          aria-checked={i === index}
          tabIndex={i === index ? 0 : -1}
          onClick={() => onChange(choice.key)}
          className="segment"
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}

/** − value + stepper for a text size. */
export function Stepper({
  label,
  sample,
  sampleClass,
  level,
  levels,
  onStep,
}: {
  label: string;
  sample: string;
  sampleClass?: string;
  level: number;
  levels: number;
  onStep: (delta: number) => void;
}) {
  return (
    <div role="group" aria-label={`${label} text size`} className="flex items-center gap-2">
      <button type="button" className="tool-btn !px-0" aria-label={`Smaller ${label} text`} disabled={level <= 0} onClick={() => onStep(-1)}>
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <div className="flex flex-1 items-center justify-center gap-3">
        <span className={cn("text-ink", sampleClass)} aria-hidden>
          {sample}
        </span>
        <span className="flex gap-1" aria-hidden>
          {Array.from({ length: levels }, (_, i) => (
            <span key={i} className={cn("h-1.5 w-1.5 rounded-full", i <= level ? "bg-ink" : "bg-line-strong")} />
          ))}
        </span>
        <span className="sr-only" aria-live="polite">
          {`${label} size ${level + 1} of ${levels}`}
        </span>
      </div>
      <button
        type="button"
        className="tool-btn !px-0"
        aria-label={`Larger ${label} text`}
        disabled={level >= levels - 1}
        onClick={() => onStep(1)}
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

/** An on/off switch with a visible state word, so it does not rely on colour. */
export function Switch({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (value: boolean) => void; hint?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full items-center justify-between gap-4 rounded-md text-left"
    >
      <span>
        <span className="block text-sm text-ink">{label}</span>
        {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
      </span>
      <span className="flex items-center gap-2 text-xs text-muted">
        {checked ? "On" : "Off"}
        <span className={cn("relative h-6 w-10 rounded-full transition-colors motion-reduce:transition-none", checked ? "bg-emerald" : "bg-line-strong")}>
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-paper-2 shadow transition-transform motion-reduce:transition-none",
              checked ? "translate-x-[1.125rem]" : "translate-x-0.5",
            )}
          />
        </span>
      </span>
    </button>
  );
}
