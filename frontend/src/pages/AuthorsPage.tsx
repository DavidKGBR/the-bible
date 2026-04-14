import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAuthors, fetchAuthorDetail, type Author, type AuthorDetail } from "../services/api";

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "OT" | "NT">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<AuthorDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAuthors(filter === "all" ? undefined : filter)
      .then(setAuthors)
      .catch(() => setAuthors([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleExpand = (authorId: string) => {
    if (expanded === authorId) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(authorId);
    setDetailLoading(true);
    fetchAuthorDetail(authorId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title text-3xl">Biblical Authors</h1>
        <p className="text-sm opacity-60 mt-1">
          33 traditional authors behind the 66 books of the Bible.
          Vocabulary stats computed from Strong's interlinear data.
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6">
        {(["all", "OT", "NT"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-4 py-1.5 rounded-full border transition ${
              filter === f
                ? "bg-[var(--color-gold)] text-white border-[var(--color-gold)]"
                : "border-[var(--color-gold)]/30 hover:bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)]"
            }`}
          >
            {f === "all" ? "All" : f === "OT" ? "Old Testament" : "New Testament"}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm opacity-50">Loading authors...</p>}

      {/* Author cards */}
      <div className="space-y-3">
        {authors.map((author) => {
          const isOpen = expanded === author.author_id;
          return (
            <div
              key={author.author_id}
              className="rounded-lg border border-[var(--color-gold-dark)]/15 bg-white overflow-hidden"
            >
              <button
                onClick={() => handleExpand(author.author_id)}
                className="w-full text-left px-4 py-3 flex items-start justify-between gap-3
                           hover:bg-[var(--color-gold)]/5 transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-[var(--color-ink)]">
                      {author.name}
                    </h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                      author.testament === "OT"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-[var(--color-new-testament)]/10 text-[var(--color-new-testament)]"
                    }`}>
                      {author.testament}
                    </span>
                  </div>
                  <p className="text-xs opacity-50 mt-0.5">
                    {author.period} · {author.literary_style}
                  </p>
                  {!isOpen && (
                    <p className="text-sm opacity-60 mt-1 line-clamp-1">
                      {author.books.length} book{author.books.length !== 1 ? "s" : ""}: {author.books.join(", ")}
                    </p>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 opacity-40 transition-transform shrink-0 mt-1 ${isOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-4 border-t border-[var(--color-gold-dark)]/10">
                  {/* Description */}
                  <p className="text-sm leading-relaxed font-body mt-3">
                    {author.description}
                  </p>

                  {/* Books */}
                  <div>
                    <h4 className="text-[10px] uppercase tracking-wider font-bold opacity-50 mb-2">
                      Books Written
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {author.books.map((bookId) => (
                        <Link
                          key={bookId}
                          to={`/reader?book=${bookId}&chapter=1`}
                          className="text-xs px-2.5 py-1 rounded border border-[var(--color-gold)]/30
                                     hover:bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] transition"
                        >
                          {bookId}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Vocabulary stats */}
                  {detailLoading && (
                    <p className="text-xs opacity-50">Loading vocabulary stats...</p>
                  )}
                  {!detailLoading && detail?.stats && detail.stats.unique_strongs > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider font-bold opacity-50 mb-2">
                        Vocabulary Fingerprint
                      </h4>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="text-center p-2 rounded bg-[var(--color-gold)]/5">
                          <div className="text-lg font-bold text-[var(--color-gold-dark)]">
                            {detail.stats.unique_strongs.toLocaleString()}
                          </div>
                          <div className="text-[9px] uppercase tracking-wider opacity-50">
                            Unique words
                          </div>
                        </div>
                        <div className="text-center p-2 rounded bg-[var(--color-gold)]/5">
                          <div className="text-lg font-bold text-[var(--color-gold-dark)]">
                            {detail.stats.total_words.toLocaleString()}
                          </div>
                          <div className="text-[9px] uppercase tracking-wider opacity-50">
                            Total words
                          </div>
                        </div>
                        <div className="text-center p-2 rounded bg-[var(--color-gold)]/5">
                          <div className="text-lg font-bold text-[var(--color-gold-dark)]">
                            {detail.stats.total_verses.toLocaleString()}
                          </div>
                          <div className="text-[9px] uppercase tracking-wider opacity-50">
                            Verses
                          </div>
                        </div>
                      </div>

                      {/* Top words */}
                      {detail.stats.top_words && detail.stats.top_words.length > 0 && (
                        <div>
                          <h4 className="text-[10px] uppercase tracking-wider font-bold opacity-50 mb-1">
                            Most Used Words
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {detail.stats.top_words.map((w, i) => (
                              <Link
                                key={i}
                                to={`/word-study/${w.strongs_id}`}
                                className="text-[11px] px-2 py-0.5 rounded bg-[var(--color-gold)]/10
                                           text-[var(--color-gold-dark)] hover:bg-[var(--color-gold)]/20 transition"
                                title={`${w.strongs_id} — ${w.occurrences} occurrences`}
                              >
                                {w.gloss} <span className="opacity-40">({w.occurrences})</span>
                              </Link>
                            ))}
                          </div>
                        </div>
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
