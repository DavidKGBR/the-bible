import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/i18nContext";
import type { HomeStats } from "../../services/api";

const CATEGORY_COLORS: Record<string, string> = {
  theology: "#8B4513",
  language: "#2E8B57",
  culture: "#4169E1",
  interpretation: "#DAA520",
  prophecy: "#B22222",
  textual: "#6b4c9a",
  historical: "#4a7c59",
};

export default function CommunityPreview({ stats }: { stats: HomeStats | null }) {
  const { t } = useI18n();

  if (!stats) return null;

  return (
    <section className="mb-8">
      <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 mb-4">
        {t("home.communityPreview")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Community Notes */}
        <div className="rounded-lg border border-[var(--color-gold)]/15 bg-white p-5">
          <h3 className="font-display font-bold text-sm mb-3">
            {t("home.recentNotes")}
          </h3>
          {stats.recent_notes.length === 0 ? (
            <p className="text-sm opacity-40">—</p>
          ) : (
            <div className="space-y-3">
              {stats.recent_notes.map((note) => (
                <div key={note.id} className="flex items-start gap-2">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full capitalize shrink-0 mt-0.5"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[note.category] || "#666"}15`,
                      color: CATEGORY_COLORS[note.category] || "#666",
                    }}
                  >
                    {note.category}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{note.title}</div>
                    <div className="text-[10px] opacity-40">{note.verse_id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/community"
            className="inline-block mt-3 text-xs text-[var(--color-gold)] font-bold hover:underline"
          >
            {t("home.seeAllNotes")} &rarr;
          </Link>
        </div>

        {/* Open Questions */}
        <div className="rounded-lg border border-[var(--color-gold)]/15 bg-white p-5">
          <h3 className="font-display font-bold text-sm mb-3">
            {t("home.openQuestions")}
          </h3>
          {stats.recent_questions.length === 0 ? (
            <p className="text-sm opacity-40">—</p>
          ) : (
            <div className="space-y-3">
              {stats.recent_questions.map((q) => (
                <div key={q.id} className="flex items-start gap-2">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full capitalize shrink-0 mt-0.5"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[q.category] || "#666"}15`,
                      color: CATEGORY_COLORS[q.category] || "#666",
                    }}
                  >
                    {q.category}
                  </span>
                  <div className="text-sm font-medium">{q.title}</div>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/open-questions"
            className="inline-block mt-3 text-xs text-[var(--color-gold)] font-bold hover:underline"
          >
            {t("home.exploreQuestions")} &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
