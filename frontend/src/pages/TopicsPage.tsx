import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  fetchTopics,
  fetchPopularTopics,
  fetchTopic,
  type Topic,
  type TopicDetail,
} from "../services/api";
import { useI18n } from "../i18n/i18nContext";
import { topicName } from "../i18n/topicNames";

export default function TopicsPage() {
  const { t, locale } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [popular, setPopular] = useState<Topic[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<TopicDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load popular topics on mount
  useEffect(() => {
    fetchPopularTopics(15).then((d) => setPopular(d.results)).catch(() => {});
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q !== query) setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (query.length < 2) {
      setTopics([]);
      setTotal(0);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      fetchTopics({ q: query, limit: 50 })
        .then((data) => {
          setTopics(data.results);
          setTotal(data.total);
        })
        .catch(() => {
          setTopics([]);
          setTotal(0);
        })
        .finally(() => setLoading(false));
      setSearchParams(query ? { q: query } : {}, { replace: true });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, setSearchParams]);

  const handleExpand = (slug: string) => {
    if (expanded === slug) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(slug);
    setDetailLoading(true);
    fetchTopic(slug)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  };

  const displayTopics = query.length >= 2 ? topics : [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title text-3xl">{t("topics.title")}</h1>
        <p className="text-sm opacity-60 mt-1">{t("topics.subtitle")}</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("topics.searchPlaceholder")}
          className="w-full rounded-lg border border-[var(--color-gold-dark)]/20 px-4 py-3
                     text-sm bg-white focus:outline-none focus:ring-2
                     focus:ring-[var(--color-gold)]/50 focus:border-[var(--color-gold)]/50"
          autoFocus
        />
      </div>

      {loading && <p className="text-sm opacity-50">{t("topics.searching")}</p>}

      {!loading && query.length >= 2 && topics.length === 0 && (
        <p className="text-sm opacity-50 italic">
          {t("topics.noResults").replace("{query}", query)}
        </p>
      )}

      {/* Popular topics when no search */}
      {query.length < 2 && popular.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold opacity-50 mb-3">{t("topics.popular")}</h2>
          <div className="flex flex-wrap gap-2">
            {popular.map((topic) => (
              <button
                key={topic.slug}
                onClick={() => setQuery(topic.name)}
                className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-gold)]/30
                           hover:bg-[var(--color-gold)]/10 transition text-[var(--color-gold-dark)]"
              >
                {topicName(topic.slug, locale, topic.name)}{" "}
                <span className="opacity-40">({topic.verse_count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {query.length < 2 && (
        <div className="rounded-lg border border-dashed border-[var(--color-gold-dark)]/30 p-8 text-center">
          <p className="opacity-60 mb-3">{t("topics.typeHint")}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { slug: "faith", en: "FAITH" },
              { slug: "love", en: "LOVE" },
              { slug: "prayer", en: "PRAYER" },
              { slug: "forgiveness", en: "FORGIVENESS" },
              { slug: "salvation", en: "SALVATION" },
              { slug: "grace", en: "GRACE" },
              { slug: "hope", en: "HOPE" },
              { slug: "sin-1", en: "SIN" },
            ].map((w) => (
              <button
                key={w.slug}
                onClick={() => setQuery(w.en)}
                className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-gold)]/30
                           hover:bg-[var(--color-gold)]/10 transition text-[var(--color-gold-dark)]"
              >
                {topicName(w.slug, locale, w.en)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {query.length >= 2 && total > 0 && (
        <p className="text-xs opacity-40 mb-2">
          {(total === 1 ? t("topics.foundSingular") : t("topics.found")).replace("{n}", String(total))}
        </p>
      )}

      <div className="space-y-3">
        {displayTopics.map((topic) => {
          const isOpen = expanded === topic.slug;
          return (
            <div
              key={topic.slug}
              className="rounded-lg border border-[var(--color-gold-dark)]/15 bg-white overflow-hidden"
            >
              <button
                onClick={() => handleExpand(topic.slug)}
                className="w-full text-left px-4 py-3 flex items-start justify-between gap-3
                           hover:bg-[var(--color-gold)]/5 transition"
              >
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-[var(--color-ink)]">
                    {topicName(topic.slug, locale, topic.name)}
                  </h3>
                  <p className="text-xs opacity-50 mt-0.5">
                    {(topic.verse_count === 1 ? t("topics.verseRef") : t("topics.verseRefs")).replace("{n}", String(topic.verse_count))}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 opacity-40 transition-transform shrink-0 mt-1 ${isOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-[var(--color-gold-dark)]/10">
                  {detailLoading && (
                    <p className="text-xs opacity-50 mt-3">{t("topics.loadingVerses")}</p>
                  )}

                  {!detailLoading && detail && (
                    <div className="mt-3 space-y-2">
                      {detail.verses.map((v) =>
                        v.text ? (
                          <div key={v.verse_id} className="text-sm leading-relaxed">
                            <Link
                              to={`/reader?book=${v.book_id}&chapter=${v.chapter}`}
                              className="text-[10px] font-bold text-[var(--color-gold-dark)] hover:underline mr-1"
                            >
                              {v.reference}
                            </Link>
                            <span className="font-body">{v.text}</span>
                          </div>
                        ) : (
                          <div key={v.verse_id} className="text-xs opacity-40">
                            {t("topics.notInTranslation")
                              .replace("{id}", v.verse_id)
                              .replace("{translation}", detail.translation)}
                          </div>
                        )
                      )}
                      {detail.verse_count > detail.verses.length && (
                        <p className="text-xs opacity-40 pt-2">
                          {t("topics.showing")
                            .replace("{shown}", String(detail.verses.length))
                            .replace("{total}", String(detail.verse_count))}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
