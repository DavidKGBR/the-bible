import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBooks, type Book } from "../services/api";
import { useReadingPlans } from "../hooks/useReadingPlans";
import { PLANS, getPlanById, type ChapterRef } from "../components/plans/plansData";
import PlanCard from "../components/plans/PlanCard";

export default function PlansPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const {
    progress,
    active,
    start,
    pause,
    resume,
    reset,
    markChapter,
    unmarkChapter,
    isCompleted,
    currentDay,
    todayReading,
    scheduleProgress,
  } = useReadingPlans();

  useEffect(() => {
    fetchBooks("kjv").then(setBooks).catch(() => {});
  }, []);

  const activeDef = active ? getPlanById(active.plan_id) : undefined;
  const todayDay = activeDef ? todayReading(activeDef, books) : null;

  function handleStart(planId: typeof PLANS[number]["id"]) {
    if (active && active.plan_id !== planId) {
      const other = getPlanById(active.plan_id);
      const title = other?.title ?? active.plan_id;
      if (!confirm(`This will pause "${title}". Continue?`)) return;
    }
    start(planId);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title text-3xl">Reading Plans</h1>
        <p className="text-sm opacity-60 mt-1">
          Structured daily readings to give your study a rhythm. Only one plan
          is active at a time — switching pauses the current one.
        </p>
      </div>

      {/* Today's Reading — only when there's an active plan */}
      {active && activeDef && todayDay && (
        <section className="rounded-lg border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/5 p-5 mb-8">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] opacity-60 font-display">
                Today's Reading
              </div>
              <h2 className="font-display font-bold text-xl text-[var(--color-ink)] mt-1">
                {activeDef.emoji} {activeDef.title}
              </h2>
              <p className="text-sm opacity-70 mt-1">
                Day {currentDay(activeDef)} / {activeDef.total_days} ·{" "}
                {todayDay.chapters.length}{" "}
                {todayDay.chapters.length === 1 ? "chapter" : "chapters"} to read
              </p>
            </div>
            <button
              onClick={() => pause(activeDef.id)}
              className="text-xs px-3 py-1.5 rounded border hover:bg-white transition"
            >
              Pause plan
            </button>
          </div>

          <ul className="space-y-1.5">
            {todayDay.chapters.map((ch) => (
              <TodayChapterRow
                key={ch.chapter_id}
                ch={ch}
                done={isCompleted(activeDef.id, ch.chapter_id)}
                onToggle={() =>
                  isCompleted(activeDef.id, ch.chapter_id)
                    ? unmarkChapter(activeDef.id, ch.chapter_id)
                    : markChapter(activeDef.id, ch.chapter_id)
                }
              />
            ))}
          </ul>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="opacity-60">
              {todayDay.chapters.filter((c) => isCompleted(activeDef.id, c.chapter_id)).length} of{" "}
              {todayDay.chapters.length} done today
              {todayDay.chapters.length > 0 &&
                todayDay.chapters.every((c) => isCompleted(activeDef.id, c.chapter_id)) &&
                " 🎉"}
            </span>
            <button
              onClick={() => {
                todayDay.chapters.forEach((c) =>
                  markChapter(activeDef.id, c.chapter_id)
                );
              }}
              className="text-[var(--color-gold-dark)] hover:underline"
            >
              Mark all done
            </button>
          </div>
        </section>
      )}

      {/* Plan grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {PLANS.map((plan) => {
          const p = progress[plan.id];
          const { done, total } = scheduleProgress(plan, books);
          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              progress={p}
              currentDay={currentDay(plan)}
              done={done}
              total={total}
              onStart={handleStart}
              onPause={pause}
              onResume={resume}
              onReset={reset}
            />
          );
        })}
      </div>
    </div>
  );
}

function TodayChapterRow({
  ch,
  done,
  onToggle,
}: {
  ch: ChapterRef;
  done: boolean;
  onToggle: () => void;
}) {
  const readerLink = `/reader?book=${ch.book_id}&chapter=${ch.chapter}&translation=kjv`;
  return (
    <li className="flex items-center gap-2">
      <button
        onClick={onToggle}
        aria-label={done ? "Mark as not read" : "Mark as read"}
        aria-pressed={done}
        className={`w-5 h-5 shrink-0 rounded border-2 transition
                   flex items-center justify-center
                   focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/60 ${
                     done
                       ? "bg-[var(--color-gold)] border-[var(--color-gold)]"
                       : "border-[var(--color-gold-dark)]/40 hover:border-[var(--color-gold)]"
                   }`}
      >
        {done && (
          <svg
            className="w-3 h-3 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={4}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <Link
        to={readerLink}
        className={`text-sm flex-1 ${
          done
            ? "opacity-50 line-through decoration-[var(--color-gold-dark)]/40"
            : "hover:text-[var(--color-gold-dark)]"
        }`}
      >
        {ch.book_name} {ch.chapter}
      </Link>
    </li>
  );
}
