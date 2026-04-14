import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  fetchPeople,
  fetchPersonFamily,
  type BiblicalPerson,
  type FamilyMember,
} from "../services/api";

const RELATION_LABELS: Record<string, string> = {
  father: "Father",
  mother: "Mother",
  spouse: "Spouse",
  child: "Children",
  sibling: "Siblings",
  half_sibling: "Half-Siblings",
};

const RELATION_ORDER = ["father", "mother", "spouse", "sibling", "half_sibling", "child"];

export default function PeoplePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [people, setPeople] = useState<BiblicalPerson[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [family, setFamily] = useState<Record<string, FamilyMember[]> | null>(null);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [genderFilter, setGenderFilter] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load popular people on mount
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q !== query) setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      fetchPeople({
        q: query || undefined,
        gender: genderFilter || undefined,
        limit: 50,
      })
        .then((data) => {
          setPeople(data.results);
          setTotal(data.total);
        })
        .catch(() => {
          setPeople([]);
          setTotal(0);
        })
        .finally(() => setLoading(false));
      if (query) {
        setSearchParams({ q: query }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, genderFilter, setSearchParams]);

  const handleExpand = (slug: string) => {
    if (expanded === slug) {
      setExpanded(null);
      setFamily(null);
      return;
    }
    setExpanded(slug);
    setFamilyLoading(true);
    fetchPersonFamily(slug)
      .then((data) => setFamily(data.relations))
      .catch(() => setFamily(null))
      .finally(() => setFamilyLoading(false));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title text-3xl">People of the Bible</h1>
        <p className="text-sm opacity-60 mt-1">
          3,000+ people from the Theographic dataset. Search, explore family
          trees, and discover connections.
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name (e.g., Moses, David, Esther)..."
          className="w-full rounded-lg border border-[var(--color-gold-dark)]/20 px-4 py-3
                     text-sm bg-white focus:outline-none focus:ring-2
                     focus:ring-[var(--color-gold)]/50 focus:border-[var(--color-gold)]/50"
          autoFocus
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6">
        {[null, "Male", "Female"].map((g) => (
          <button
            key={g || "all"}
            onClick={() => setGenderFilter(g)}
            className={`text-xs px-4 py-1.5 rounded-full border transition ${
              genderFilter === g
                ? "bg-[var(--color-gold)] text-white border-[var(--color-gold)]"
                : "border-[var(--color-gold)]/30 hover:bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)]"
            }`}
          >
            {g || "All"}
          </button>
        ))}
        <span className="text-xs opacity-40 self-center ml-2">
          {total.toLocaleString()} results
        </span>
      </div>

      {loading && <p className="text-sm opacity-50">Searching...</p>}

      {!loading && people.length === 0 && query.length >= 2 && (
        <p className="text-sm opacity-50 italic">No people found for &quot;{query}&quot;.</p>
      )}

      {!loading && people.length === 0 && !query && (
        <div className="rounded-lg border border-dashed border-[var(--color-gold-dark)]/30 p-8 text-center">
          <p className="opacity-60 mb-3">
            Browse or search 3,000+ biblical figures.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Moses", "David", "Esther", "Paul", "Mary", "Abraham", "Ruth", "Daniel"].map(
              (w) => (
                <button
                  key={w}
                  onClick={() => setQuery(w)}
                  className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-gold)]/30
                             hover:bg-[var(--color-gold)]/10 transition text-[var(--color-gold-dark)]"
                >
                  {w}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {people.map((person) => {
          const isOpen = expanded === person.slug;
          return (
            <div
              key={person.slug}
              className="rounded-lg border border-[var(--color-gold-dark)]/15 bg-white overflow-hidden"
            >
              <button
                onClick={() => handleExpand(person.slug)}
                className="w-full text-left px-4 py-3 flex items-start justify-between gap-3
                           hover:bg-[var(--color-gold)]/5 transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-[var(--color-ink)]">
                      {person.name}
                    </h3>
                    {person.gender && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                        person.gender === "Male"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-pink-100 text-pink-700"
                      }`}>
                        {person.gender}
                      </span>
                    )}
                    {person.tribe && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        {person.tribe}
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-50 mt-0.5">
                    {person.verse_count} verse{person.verse_count !== 1 ? "s" : ""}
                    {person.occupation && ` · ${person.occupation}`}
                    {person.birth_year && ` · ${Math.abs(person.birth_year)} ${person.birth_year < 0 ? "BC" : "AD"}`}
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
                <div className="px-4 pb-4 space-y-4 border-t border-[var(--color-gold-dark)]/10">
                  {/* Description */}
                  {person.description && (
                    <p className="text-sm leading-relaxed font-body mt-3">
                      {person.description}
                    </p>
                  )}

                  {/* Books mentioned */}
                  {person.books_mentioned && Array.isArray(person.books_mentioned) && person.books_mentioned.length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider font-bold opacity-50 mb-2">
                        Appears in
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {person.books_mentioned.map((bookId) => (
                          <Link
                            key={bookId}
                            to={`/reader?book=${bookId}&chapter=1`}
                            className="text-[11px] px-2 py-0.5 rounded border border-[var(--color-gold)]/30
                                       hover:bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] transition"
                          >
                            {bookId}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Family tree */}
                  {familyLoading && (
                    <p className="text-xs opacity-50">Loading family...</p>
                  )}
                  {!familyLoading && family && Object.keys(family).length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider font-bold opacity-50 mb-2">
                        Family
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {RELATION_ORDER.filter((rel) => family[rel]?.length).map((rel) => (
                          <div key={rel} className="rounded p-2 bg-[var(--color-gold)]/5">
                            <div className="text-[9px] uppercase tracking-wider opacity-50 mb-1">
                              {RELATION_LABELS[rel] || rel}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {family[rel].map((member) => (
                                <button
                                  key={member.slug}
                                  onClick={() => {
                                    setQuery(member.name || member.slug);
                                    setExpanded(null);
                                    setFamily(null);
                                  }}
                                  className="text-[11px] px-2 py-0.5 rounded bg-white
                                             border border-[var(--color-gold)]/20
                                             hover:bg-[var(--color-gold)]/10 transition
                                             text-[var(--color-gold-dark)]"
                                >
                                  {member.name || member.slug}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!familyLoading && family && Object.keys(family).length === 0 && (
                    <p className="text-xs opacity-40 italic">No family relations recorded.</p>
                  )}

                  {/* Quick actions */}
                  <div className="flex gap-3 text-xs pt-1">
                    <Link
                      to={`/search?q=${encodeURIComponent(person.name)}`}
                      className="text-[var(--color-gold-dark)] hover:underline"
                    >
                      Search in Bible →
                    </Link>
                    <Link
                      to={`/dictionary?q=${encodeURIComponent(person.name)}`}
                      className="text-[var(--color-gold-dark)] hover:underline"
                    >
                      Dictionary →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
