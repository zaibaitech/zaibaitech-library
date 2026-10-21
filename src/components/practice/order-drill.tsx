"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import type { Drill, DrillStep } from "@/content/types";
import { cn } from "@/lib/cn";
import { loadPractice, savePractice } from "@/lib/storage";
import { ClassPill } from "../class-pill";

function shuffle(steps: DrillStep[]) {
  const next = steps.slice();
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [next[index], next[swap]] = [next[swap], next[index]];
  }
  if (next.every((step, index) => step.id === steps[index]?.id) && next.length > 1) {
    [next[0], next[1]] = [next[1], next[0]];
  }
  return next;
}

export function OrderDrill({ drill, bookId }: { drill: Drill; bookId: string }) {
  const [items, setItems] = useState<DrillStep[] | null>(null);
  const [marks, setMarks] = useState<Array<"right" | "wrong"> | null>(null);
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setItems(shuffle(drill.steps));
    setMarks(null);
    setSolved(false);
    const record = loadPractice(bookId).drills[drill.id];
    setAttempts(record?.attempts ?? 0);
    if (record?.solved) setSolved(true);
  }, [bookId, drill.id, drill.steps]);

  function persist(nextSolved: boolean, nextAttempts: number) {
    const record = loadPractice(bookId);
    record.drills[drill.id] = { solved: nextSolved, attempts: nextAttempts };
    savePractice(bookId, record);
  }

  function move(index: number, direction: -1 | 1) {
    if (!items) return;
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    setMarks(null);
  }

  function onGripDown(event: React.PointerEvent<HTMLButtonElement>, index: number) {
    if (!items || event.button !== 0) return;
    const handle = event.currentTarget;
    const list = handle.closest("ol");
    if (!list) return;
    handle.setPointerCapture(event.pointerId);
    const snapshot = items;
    let last = index;
    const movePointer = (ev: PointerEvent) => {
      const rows = Array.from(list.querySelectorAll<HTMLElement>(":scope > li"));
      let nextIndex = 0;
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        const rect = rows[rowIndex].getBoundingClientRect();
        if (ev.clientY > rect.top + rect.height / 2) nextIndex = rowIndex;
      }
      nextIndex = Math.max(0, Math.min(snapshot.length - 1, nextIndex));
      if (nextIndex === last) return;
      const copy = snapshot.slice();
      const [row] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, row);
      last = nextIndex;
      setItems(copy);
      setMarks(null);
    };
    const end = () => {
      handle.removeEventListener("pointermove", movePointer);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
    };
    handle.addEventListener("pointermove", movePointer);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }

  function check() {
    if (!items) return;
    const nextMarks = items.map((item, index) =>
      item.id === drill.steps[index]?.id ? "right" : "wrong",
    ) as Array<"right" | "wrong">;
    const ok = nextMarks.every((mark) => mark === "right");
    const nextAttempts = attempts + 1;
    setMarks(nextMarks);
    setAttempts(nextAttempts);
    setSolved(ok);
    persist(ok, nextAttempts);
  }

  if (!items) {
    return <div className="h-72 animate-pulse rounded-3xl bg-line/50" aria-hidden="true" />;
  }

  return (
    <div>
      <p className="text-sm leading-relaxed text-muted">{drill.intro}</p>
      <p className="mt-2 text-sm text-muted">Drag a grip, or use the arrows. Then check the order.</p>
      <ol className="mt-4 space-y-2">
        {items.map((step, index) => {
          const mark = marks?.[index];
          return (
            <li
              key={step.id}
              className={cn(
                "flex flex-wrap items-center gap-2 rounded-2xl border bg-paper-2 p-2 sm:gap-3 sm:p-3",
                mark === "right" && "border-emerald",
                mark === "wrong" && "shake border-clay",
                !mark && "border-line",
              )}
            >
              <button
                type="button"
                aria-label={`Drag ${step.title}`}
                onPointerDown={(event) => onGripDown(event, index)}
                className="flex h-11 w-9 shrink-0 cursor-grab items-center justify-center rounded-xl text-muted active:cursor-grabbing"
                style={{ touchAction: "none" }}
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <span className="w-5 shrink-0 text-sm text-muted">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="font-amiri text-xl leading-snug text-ink" dir="rtl" lang="ar">
                  {step.titleAr}
                </p>
                <p className="text-sm text-muted">{step.title}</p>
              </div>
              <ClassPill value={step.classification} />
              <div className="flex shrink-0 flex-col">
                <button type="button" aria-label="Move up" onClick={() => move(index, -1)} className="rounded-md p-1 hover:bg-gold-soft">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button type="button" aria-label="Move down" onClick={() => move(index, 1)} className="rounded-md p-1 hover:bg-gold-soft">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={check} className="rounded-full bg-emerald px-4 py-2 text-sm font-medium text-paper">
          Check order
        </button>
        <button
          type="button"
          onClick={() => {
            setItems(drill.steps);
            setMarks(drill.steps.map(() => "right"));
            setSolved(true);
            persist(true, attempts);
          }}
          className="rounded-full border border-line px-4 py-2 text-sm"
        >
          Show the chapter’s order
        </button>
        <button
          type="button"
          onClick={() => {
            setItems(shuffle(drill.steps));
            setMarks(null);
            setSolved(false);
          }}
          className="rounded-full border border-line px-4 py-2 text-sm"
        >
          Shuffle again
        </button>
      </div>
      {marks ? (
        <p className="mt-4 text-sm text-ink">
          {solved
            ? "This matches the order described above."
            : "Some cards are still out of the order the chapter supports. Wrong ones are marked. Move them and check again."}
        </p>
      ) : null}
      {attempts > 0 ? <p className="mt-1 text-xs text-muted">Checks on this device: {attempts}</p> : null}
      <div className="mt-4 flex flex-wrap gap-3">
        {drill.steps.map((step) => (
          <Link
            key={step.id}
            href={`/books/${bookId}/read#${step.sourceUnitId}`}
            className="text-sm text-emerald underline decoration-gold/70 underline-offset-4"
          >
            {step.titleAr}
          </Link>
        ))}
      </div>
    </div>
  );
}
