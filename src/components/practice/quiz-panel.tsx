"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { BookContent, Quiz, TextUnit } from "@/content/types";
import { loadPractice, savePractice } from "@/lib/storage";

function findUnit(content: BookContent, unitId: string): TextUnit | null {
  for (const chapter of content.chapters) {
    const unit = chapter.units.find((item) => item.id === unitId);
    if (unit) return unit;
  }
  return null;
}
import { useSettings } from "../settings-provider";

export function QuizPanel({
  quizzes,
  bookId,
  content,
}: {
  quizzes: Quiz[];
  bookId: string;
  content: BookContent;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, { best: number; total: number }>>({});
  const active = quizzes.find((quiz) => quiz.id === activeId) ?? null;

  useEffect(() => {
    const record = loadPractice(bookId);
    setScores(record.quizzes);
  }, [bookId]);

  if (!active) {
    return (
      <ul className="grid gap-3 sm:grid-cols-2">
        {quizzes.map((quiz) => {
          const score = scores[quiz.id];
          return (
            <li key={quiz.id}>
              <button
                type="button"
                onClick={() => setActiveId(quiz.id)}
                className="flex h-full w-full flex-col rounded-3xl border border-line bg-paper-2 p-5 text-left hover:border-gold"
              >
                <span className="font-display text-2xl text-ink">{quiz.title}</span>
                <span className="mt-2 text-sm text-muted">{quiz.questions.length} questions</span>
                <span className="mt-4 text-sm text-emerald">
                  {score ? `Best on this device: ${score.best} / ${score.total}` : "Not tried yet"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <QuizRunner
      quiz={active}
      bookId={bookId}
      content={content}
      onExit={() => setActiveId(null)}
      onScore={(best, total) => setScores((current) => ({ ...current, [active.id]: { best, total } }))}
    />
  );
}

function QuizRunner({
  quiz,
  bookId,
  content,
  onExit,
  onScore,
}: {
  quiz: Quiz;
  bookId: string;
  content: BookContent;
  onExit: () => void;
  onScore: (best: number, total: number) => void;
}) {
  const { settings } = useSettings();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const question = quiz.questions[index];
  const source = question ? findUnit(content, question.sourceUnitId) : null;

  function choose(choice: number) {
    if (picked !== null || !question) return;
    setPicked(choice);
    if (choice === question.answer) setCorrectCount((count) => count + 1);
  }

  function finish(finalCorrect: number) {
    setDone(true);
    const record = loadPractice(bookId);
    const previous = record.quizzes[quiz.id];
    const best = Math.max(previous?.best ?? 0, finalCorrect);
    record.quizzes[quiz.id] = { best, total: quiz.questions.length, updatedAt: Date.now() };
    savePractice(bookId, record);
    onScore(best, quiz.questions.length);
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-line bg-paper-2 p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">{quiz.title}</p>
        <h3 className="mt-2 font-display text-3xl">
          {correctCount} of {quiz.questions.length}
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          The score is kept on this device. Each answer pointed at an Arabic line. That line is the source, not the English prompt.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            className="rounded-full bg-emerald px-4 py-2 text-sm font-medium text-paper"
            onClick={() => {
              setIndex(0);
              setPicked(null);
              setCorrectCount(0);
              setDone(false);
            }}
          >
            Try again
          </button>
          <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={onExit}>
            All quizzes
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;
  const arabic = settings.vowelled && source?.arabicVowelled ? source.arabicVowelled : source?.arabic;

  return (
    <div className="rounded-3xl border border-line bg-paper-2 p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">{quiz.title}</p>
        <button type="button" onClick={onExit} className="text-sm text-muted underline-offset-4 hover:underline">
          All quizzes
        </button>
      </div>
      <p className="mt-2 text-sm text-muted">
        Question {index + 1} of {quiz.questions.length}
      </p>
      <h3 className="mt-3 font-display text-2xl leading-snug text-ink sm:text-3xl">{question.prompt}</h3>
      <ul className="mt-5 space-y-2">
        {question.choices.map((choice, choiceIndex) => {
          const selected = picked === choiceIndex;
          const isAnswer = choiceIndex === question.answer;
          const show = picked !== null;
          return (
            <li key={choice}>
              <button
                type="button"
                disabled={picked !== null}
                onClick={() => choose(choiceIndex)}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm leading-relaxed sm:text-base ${
                  show && isAnswer
                    ? "border-emerald bg-emerald/10"
                    : show && selected
                      ? "border-clay bg-clay/10"
                      : "border-line bg-paper hover:border-gold"
                }`}
              >
                {choice}
              </button>
            </li>
          );
        })}
      </ul>
      {picked !== null ? (
        <div className="mt-5 border-t border-line pt-4">
          {arabic ? (
            <blockquote className="arabic-text rounded-2xl bg-paper px-4 py-3 text-xl text-ink" dir="rtl" lang="ar">
              {arabic}
            </blockquote>
          ) : null}
          <p className="mt-3 text-sm font-medium text-ink">
            {picked === question.answer ? "That matches the line." : "The chapter says otherwise."}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{question.explanation}</p>
          <Link
            href={`/books/${bookId}/read#${question.sourceUnitId}`}
            className="mt-3 inline-flex text-sm font-medium text-emerald underline decoration-gold underline-offset-4"
          >
            Open this line in the reader
          </Link>
          <div className="mt-4">
            <button
              type="button"
              className="rounded-full bg-emerald px-4 py-2 text-sm font-medium text-paper"
              onClick={() => {
                const finalCorrect = correctCount;
                if (index + 1 >= quiz.questions.length) {
                  finish(finalCorrect);
                  return;
                }
                setIndex((current) => current + 1);
                setPicked(null);
              }}
            >
              {index + 1 >= quiz.questions.length ? "See the score" : "Next question"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
