import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchTranslationStats,
  fetchSentiment,
  type TranslationStat,
  type SentimentGroup,
} from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function HomePage() {
  const [translations, setTranslations] = useState<TranslationStat[]>([]);
  const [testaments, setTestaments] = useState<SentimentGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchTranslationStats().then((d) => setTranslations(d.translations)),
      fetchSentiment("testament", "kjv").then((d) => setTestaments(d.data)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalVerses = translations.reduce((s, t) => s + t.verses, 0);
  const totalTranslations = translations.length;
  const languages = new Set(translations.map((t) => t.language)).size;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2 text-[var(--color-ink)]">
        Bible Data Pipeline
      </h2>
      <p className="text-sm opacity-60 mb-8">
        Multi-translation biblical analytics with NLP and cross-references
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Translations", value: totalTranslations },
          { label: "Languages", value: languages },
          { label: "Total Verses", value: totalVerses.toLocaleString() },
          { label: "Books per Translation", value: 66 },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-lg p-4 shadow-sm border"
          >
            <div className="text-2xl font-bold text-[var(--color-gold)]">
              {kpi.value}
            </div>
            <div className="text-xs opacity-60 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Translations table */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
        <h3 className="font-bold mb-3">Available Translations</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left opacity-60">
              <th className="pb-2">ID</th>
              <th className="pb-2">Language</th>
              <th className="pb-2">Verses</th>
              <th className="pb-2">Avg Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {translations.map((t) => (
              <tr key={t.translation_id} className="border-b last:border-0">
                <td className="py-1.5 font-mono">
                  {t.translation_id.toUpperCase()}
                </td>
                <td className="py-1.5">{t.language}</td>
                <td className="py-1.5">{t.verses.toLocaleString()}</td>
                <td className="py-1.5">{t.avg_sentiment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Testament sentiment */}
      {testaments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
          <h3 className="font-bold mb-3">Sentiment by Testament (KJV)</h3>
          <div className="flex gap-6">
            {testaments.map((t) => (
              <div key={t.testament} className="flex-1">
                <div className="text-sm font-bold mb-1">{t.testament}</div>
                <div className="text-xs opacity-60">
                  {t.verses.toLocaleString()} verses &middot; avg sentiment:{" "}
                  {t.avg_sentiment}
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-green-600">+{t.positive}</span>
                  <span className="text-gray-500">{t.neutral}</span>
                  <span className="text-red-600">{t.negative}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <Link
        to="/arc-diagram"
        className="inline-block bg-[var(--color-gold)] text-white px-6 py-3 rounded-lg font-bold shadow hover:opacity-90 transition"
      >
        Explore Arc Diagram
      </Link>
    </div>
  );
}
