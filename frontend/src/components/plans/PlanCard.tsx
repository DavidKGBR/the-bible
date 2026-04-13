import type { PlanDefinition, PlanId } from "./plansData";
import type { PlanProgress } from "../../hooks/useReadingPlans";

interface Props {
  plan: PlanDefinition;
  progress?: PlanProgress;
  currentDay: number;
  done: number;
  total: number;
  onStart: (id: PlanId) => void;
  onPause: (id: PlanId) => void;
  onResume: (id: PlanId) => void;
  onReset: (id: PlanId) => void;
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="relative h-1.5 rounded-full bg-[var(--color-gold-dark)]/10 overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-gold)] transition-all"
        style={{ width: `${pct}%` }}
        aria-hidden
      />
    </div>
  );
}

export default function PlanCard({
  plan,
  progress,
  currentDay,
  done,
  total,
  onStart,
  onPause,
  onResume,
  onReset,
}: Props) {
  const hasProgress = !!progress;
  const isPaused = hasProgress && progress!.paused === true;
  const isActive = hasProgress && !isPaused;

  const pct = plan.total_days > 0
    ? Math.round(((currentDay || 0) / plan.total_days) * 100)
    : 0;

  return (
    <div
      className={`rounded-lg border p-4 transition
                  ${isActive
                    ? "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/5"
                    : "border-[var(--color-gold-dark)]/20 bg-white hover:border-[var(--color-gold-dark)]/40"}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl leading-none">{plan.emoji}</div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-bold text-[var(--color-ink)] truncate">
            {plan.title}
          </h3>
          <p className="text-xs opacity-60">{plan.subtitle}</p>
        </div>
        {isActive && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-gold)] text-white shrink-0">
            Active
          </span>
        )}
        {isPaused && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-gold-dark)]/20 text-[var(--color-gold-dark)] shrink-0">
            Paused
          </span>
        )}
      </div>

      <p className="text-sm opacity-80 mb-3 leading-relaxed">{plan.description}</p>

      {hasProgress && (
        <div className="mb-3">
          <div className="flex items-baseline justify-between mb-1.5 text-xs">
            <span className="opacity-70">
              Day {currentDay} / {plan.total_days}
            </span>
            <span className="opacity-50 tabular-nums">
              {done} / {total} ch · {pct}%
            </span>
          </div>
          <ProgressBar value={currentDay} max={plan.total_days} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!hasProgress && (
          <button
            onClick={() => onStart(plan.id)}
            className="text-sm px-3 py-1.5 rounded bg-[var(--color-gold)] text-white
                       hover:opacity-90 transition focus:outline-none
                       focus:ring-2 focus:ring-[var(--color-gold)]/60"
          >
            Start plan
          </button>
        )}
        {isActive && (
          <>
            <button
              onClick={() => onPause(plan.id)}
              className="text-xs px-3 py-1.5 rounded border hover:bg-gray-50 transition"
            >
              Pause
            </button>
            <button
              onClick={() => {
                if (confirm("Reset progress for this plan? Completed chapters will be cleared.")) {
                  onReset(plan.id);
                }
              }}
              className="text-xs px-3 py-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 transition"
            >
              Reset
            </button>
          </>
        )}
        {isPaused && (
          <>
            <button
              onClick={() => onResume(plan.id)}
              className="text-sm px-3 py-1.5 rounded bg-[var(--color-gold)] text-white
                         hover:opacity-90 transition"
            >
              Resume
            </button>
            <button
              onClick={() => {
                if (confirm("Reset progress for this plan? Completed chapters will be cleared.")) {
                  onReset(plan.id);
                }
              }}
              className="text-xs px-3 py-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 transition"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}
