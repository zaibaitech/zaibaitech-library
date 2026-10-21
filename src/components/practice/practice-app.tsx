"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Book, BookContent, BookPractice, Guide } from "@/content/types";
import { cn } from "@/lib/cn";
import { LicenseNote } from "../license-note";
import { CheckCard } from "./check-card";
import { DecisionPanel } from "./decision-panel";
import { LineWalkPanel } from "./line-walk";
import { OrderDrill } from "./order-drill";
import { QuizPanel } from "./quiz-panel";
import { StepGuide } from "./step-guide";

const tabs = [
  { id: "guide", label: "Guides" },
  { id: "salah", label: "Prayer" },
  { id: "decide", label: "Decide" },
  { id: "sahw", label: "Sahw" },
  { id: "order", label: "Put in order" },
  { id: "quiz", label: "Quizzes" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function isTab(value: string | null): value is TabId {
  return tabs.some((item) => item.id === value);
}

export function PracticeApp({
  book,
  content,
  practice,
}: {
  book: Book;
  content: BookContent;
  practice: BookPractice;
}) {
  const params = useSearchParams();
  const initial = params.get("tab");
  const [tab, setTab] = useState<TabId>(isTab(initial) ? initial : "guide");
  const washGuides = practice.guides.filter((guide) => guide.kind === "wudu" || guide.kind === "ghusl" || guide.kind === "tayammum");
  const prayerGuides = practice.guides.filter((guide) => guide.kind === "salah" || guide.kind === "posture");
  const [guideId, setGuideId] = useState(washGuides[0]?.id ?? "");
  const [prayerId, setPrayerId] = useState(prayerGuides[0]?.id ?? "");
  const [drillId, setDrillId] = useState(practice.drills[0]?.id ?? "");
  const guide = washGuides.find((item) => item.id === guideId) ?? washGuides[0];
  const prayer = prayerGuides.find((item) => item.id === prayerId) ?? prayerGuides[0];
  const drill = useMemo(
    () => practice.drills.find((item) => item.id === drillId) ?? practice.drills[0],
    [drillId, practice.drills],
  );
  const walk = practice.walks[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 [&>*]:min-w-0">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Practice · {book.madhhab}</p>
      <h1 className="mt-1 font-display text-2xl leading-tight text-ink sm:text-5xl">{book.title}</h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted sm:text-sm">{practice.intro}</p>
      <div className="mt-2">
        <LicenseNote className="text-xs" />
      </div>
      <div role="tablist" aria-label="Practice modes" className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm",
              tab === item.id ? "bg-emerald text-paper" : "border border-line bg-paper-2 text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tab === "guide" && guide ? (
          <GuideSwitch guides={washGuides} current={guide} onChange={setGuideId} bookId={book.id} content={content} />
        ) : null}
        {tab === "salah" && prayer ? (
          <GuideSwitch guides={prayerGuides} current={prayer} onChange={setPrayerId} bookId={book.id} content={content} />
        ) : null}
        {tab === "decide" ? (
          <div className="space-y-6">
            {practice.checks.map((card) => (
              <CheckCard key={card.id} card={card} bookId={book.id} content={content} />
            ))}
            <DecisionPanel guides={practice.decisions} bookId={book.id} content={content} />
          </div>
        ) : null}
        {tab === "sahw" && walk ? <LineWalkPanel walk={walk} bookId={book.id} content={content} /> : null}
        {tab === "order" && drill ? (
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {practice.drills.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDrillId(item.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm",
                    item.id === drill.id ? "bg-gold-soft text-ink" : "border border-line",
                  )}
                >
                  {item.title}
                </button>
              ))}
            </div>
            <OrderDrill key={drill.id} drill={drill} bookId={book.id} />
          </div>
        ) : null}
        {tab === "quiz" ? <QuizPanel quizzes={practice.quizzes} bookId={book.id} content={content} /> : null}
      </div>
    </div>
  );
}

function GuideSwitch({
  guides,
  current,
  onChange,
  bookId,
  content,
}: {
  guides: Guide[];
  current: Guide;
  onChange: (id: string) => void;
  bookId: string;
  content: BookContent;
}) {
  return (
    <div>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {guides.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm",
              item.id === current.id ? "bg-gold-soft text-ink" : "border border-line",
            )}
          >
            {item.title}
          </button>
        ))}
      </div>
      <StepGuide key={current.id} guide={current} bookId={bookId} content={content} />
    </div>
  );
}
