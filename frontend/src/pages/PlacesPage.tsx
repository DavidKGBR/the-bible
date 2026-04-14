import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  fetchPlaces,
  fetchPlace,
  fetchPlaceTypes,
  type BiblicalPlace,
  type PlaceTypeCount,
} from "../services/api";

export default function PlacesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [places, setPlaces] = useState<BiblicalPlace[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<BiblicalPlace | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [placeTypes, setPlaceTypes] = useState<PlaceTypeCount[]>([]);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load place types on mount
  useEffect(() => {
    fetchPlaceTypes().then(setPlaceTypes).catch(() => {});
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q !== query) setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      fetchPlaces({
        q: query || undefined,
        place_type: typeFilter || undefined,
        limit: 50,
      })
        .then((data) => {
          setPlaces(data.results);
          setTotal(data.total);
        })
        .catch(() => {
          setPlaces([]);
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
  }, [query, typeFilter, setSearchParams]);

  const handleExpand = (slug: string) => {
    if (expanded === slug) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(slug);
    setDetailLoading(true);
    fetchPlace(slug)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  };

  // Top 6 types for filter chips
  const topTypes = placeTypes.slice(0, 6);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title text-3xl">Places of the Bible</h1>
        <p className="text-sm opacity-60 mt-1">
          1,800+ biblical locations with coordinates from OpenBible Geocoding.
          99.3% geocoded from 70+ atlases.
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search places (e.g., Jerusalem, Bethlehem, Sinai)..."
          className="w-full rounded-lg border border-[var(--color-gold-dark)]/20 px-4 py-3
                     text-sm bg-white focus:outline-none focus:ring-2
                     focus:ring-[var(--color-gold)]/50 focus:border-[var(--color-gold)]/50"
          autoFocus
        />
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setTypeFilter(null)}
          className={`text-xs px-3 py-1.5 rounded-full border transition ${
            !typeFilter
              ? "bg-[var(--color-gold)] text-white border-[var(--color-gold)]"
              : "border-[var(--color-gold)]/30 hover:bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)]"
          }`}
        >
          All
        </button>
        {topTypes.map((t) => (
          <button
            key={t.place_type}
            onClick={() => setTypeFilter(typeFilter === t.place_type ? null : t.place_type)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              typeFilter === t.place_type
                ? "bg-[var(--color-gold)] text-white border-[var(--color-gold)]"
                : "border-[var(--color-gold)]/30 hover:bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)]"
            }`}
          >
            {t.place_type} ({t.count})
          </button>
        ))}
        <span className="text-xs opacity-40 self-center ml-2">
          {total.toLocaleString()} results
        </span>
      </div>

      {loading && <p className="text-sm opacity-50">Searching...</p>}

      {!loading && places.length === 0 && query.length >= 2 && (
        <p className="text-sm opacity-50 italic">No places found for &quot;{query}&quot;.</p>
      )}

      {!loading && places.length === 0 && !query && !typeFilter && (
        <div className="rounded-lg border border-dashed border-[var(--color-gold-dark)]/30 p-8 text-center">
          <p className="opacity-60 mb-3">
            Browse or search 1,800+ biblical locations.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Jerusalem", "Bethlehem", "Egypt", "Babylon", "Sinai", "Galilee", "Nazareth", "Rome"].map(
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
        {places.map((place) => {
          const isOpen = expanded === place.slug;
          return (
            <div
              key={place.slug}
              className="rounded-lg border border-[var(--color-gold-dark)]/15 bg-white overflow-hidden"
            >
              <button
                onClick={() => handleExpand(place.slug)}
                className="w-full text-left px-4 py-3 flex items-start justify-between gap-3
                           hover:bg-[var(--color-gold)]/5 transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-[var(--color-ink)]">
                      {place.name}
                    </h3>
                    {place.place_type && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                        {place.place_type}
                      </span>
                    )}
                    {place.latitude && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">
                        📍
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-50 mt-0.5">
                    {place.verse_count} verse{place.verse_count !== 1 ? "s" : ""}
                    {place.latitude && place.longitude && (
                      <> · {place.latitude.toFixed(2)}°, {place.longitude.toFixed(2)}°</>
                    )}
                    {place.geo_confidence != null && (
                      <> · {Math.round(place.geo_confidence * 100)}% confidence</>
                    )}
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
                  {detailLoading && (
                    <p className="text-xs opacity-50 mt-3">Loading details...</p>
                  )}

                  {!detailLoading && detail && (
                    <>
                      {/* Description */}
                      {detail.description && (
                        <p className="text-sm leading-relaxed font-body mt-3">
                          {detail.description}
                        </p>
                      )}

                      {/* Also called */}
                      {detail.also_called && Array.isArray(detail.also_called) && detail.also_called.length > 0 && (
                        <div>
                          <h4 className="text-[10px] uppercase tracking-wider font-bold opacity-50 mb-1">
                            Also Known As
                          </h4>
                          <p className="text-sm">{detail.also_called.join(", ")}</p>
                        </div>
                      )}

                      {/* Coordinates */}
                      {detail.latitude && detail.longitude && (
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-2 rounded bg-[var(--color-gold)]/5">
                            <div className="text-sm font-bold text-[var(--color-gold-dark)]">
                              {detail.latitude.toFixed(4)}°
                            </div>
                            <div className="text-[9px] uppercase tracking-wider opacity-50">Latitude</div>
                          </div>
                          <div className="text-center p-2 rounded bg-[var(--color-gold)]/5">
                            <div className="text-sm font-bold text-[var(--color-gold-dark)]">
                              {detail.longitude.toFixed(4)}°
                            </div>
                            <div className="text-[9px] uppercase tracking-wider opacity-50">Longitude</div>
                          </div>
                          <div className="text-center p-2 rounded bg-[var(--color-gold)]/5">
                            <div className="text-sm font-bold text-[var(--color-gold-dark)]">
                              {detail.geo_confidence != null ? `${Math.round(detail.geo_confidence * 100)}%` : "N/A"}
                            </div>
                            <div className="text-[9px] uppercase tracking-wider opacity-50">Confidence</div>
                          </div>
                        </div>
                      )}

                      {/* Events at this place */}
                      {detail.events && detail.events.length > 0 && (
                        <div>
                          <h4 className="text-[10px] uppercase tracking-wider font-bold opacity-50 mb-2">
                            Events at {detail.name}
                          </h4>
                          <div className="space-y-1">
                            {detail.events.map((evt) => (
                              <div key={evt.event_id} className="text-sm flex items-center gap-2">
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 shrink-0">
                                  {evt.era || "Unknown"}
                                </span>
                                <span>{evt.title}</span>
                                {evt.start_year && (
                                  <span className="text-xs opacity-40">
                                    ({Math.abs(evt.start_year)} {evt.start_year < 0 ? "BC" : "AD"})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick actions */}
                      <div className="flex gap-3 text-xs pt-1">
                        <Link
                          to={`/search?q=${encodeURIComponent(place.name)}`}
                          className="text-[var(--color-gold-dark)] hover:underline"
                        >
                          Search in Bible →
                        </Link>
                        <Link
                          to={`/dictionary?q=${encodeURIComponent(place.name)}`}
                          className="text-[var(--color-gold-dark)] hover:underline"
                        >
                          Dictionary →
                        </Link>
                      </div>
                    </>
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
