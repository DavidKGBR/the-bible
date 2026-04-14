import { useEffect, useState } from "react";
import {
  fetchCombinedTimeline,
  type CombinedTimeline,
  type TimelineEvent,
  type TimelineEra,
} from "../services/api";

function yearLabel(year: number): string {
  if (year < 0) return `${Math.abs(year)} BC`;
  if (year === 0) return "1 BC";
  return `${year} AD`;
}

function EraBar({ eras, yearMin, yearMax }: { eras: TimelineEra[]; yearMin: number; yearMax: number }) {
  const span = yearMax - yearMin;
  return (
    <div className="relative h-6 rounded-full overflow-hidden bg-gray-100 mb-6">
      {eras.map((era) => {
        const left = Math.max(0, ((era.start - yearMin) / span) * 100);
        const width = Math.min(100 - left, ((era.end - era.start) / span) * 100);
        if (width <= 0) return null;
        return (
          <div
            key={era.id}
            className="absolute top-0 h-full flex items-center justify-center text-[8px] text-white font-bold tracking-wider uppercase overflow-hidden"
            style={{
              left: `${left}%`,
              width: `${width}%`,
              backgroundColor: era.color,
              opacity: 0.8,
            }}
            title={`${era.name} (${yearLabel(era.start)} – ${yearLabel(era.end)})`}
          >
            {width > 8 && era.name}
          </div>
        );
      })}
    </div>
  );
}

function EventDot({
  event,
  yearMin,
  yearMax,
  onClick,
  isSelected,
}: {
  event: TimelineEvent;
  yearMin: number;
  yearMax: number;
  onClick: () => void;
  isSelected: boolean;
}) {
  const span = yearMax - yearMin;
  const left = ((event.year - yearMin) / span) * 100;
  const isBiblical = event.type === "biblical";

  return (
    <button
      onClick={onClick}
      className={`absolute transition-transform hover:scale-150 ${
        isSelected ? "scale-150 z-20" : "z-10"
      }`}
      style={{ left: `${left}%`, top: isBiblical ? "20%" : "60%" }}
      title={`${event.title} (${yearLabel(event.year)})`}
    >
      <div
        className={`w-2.5 h-2.5 rounded-full border-2 ${
          isBiblical
            ? "bg-[var(--color-gold)] border-[var(--color-gold-dark)]"
            : "bg-gray-400 border-gray-500"
        } ${isSelected ? "ring-2 ring-[var(--color-gold)]/50" : ""}`}
      />
    </button>
  );
}

export default function TimelinePage() {
  const [data, setData] = useState<CombinedTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [showBiblical, setShowBiblical] = useState(true);
  const [showSecular, setShowSecular] = useState(true);
  const [yearRange, setYearRange] = useState<[number, number]>([-2200, 100]);

  useEffect(() => {
    setLoading(true);
    fetchCombinedTimeline(yearRange[0], yearRange[1])
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [yearRange]);

  const allEvents: TimelineEvent[] = [];
  if (data) {
    if (showBiblical) allEvents.push(...data.biblical);
    if (showSecular) allEvents.push(...data.secular);
  }

  const presets: { label: string; range: [number, number] }[] = [
    { label: "Full", range: [-2200, 100] },
    { label: "Patriarchs", range: [-2200, -1400] },
    { label: "Exodus–Monarchy", range: [-1400, -586] },
    { label: "Exile–Return", range: [-586, -400] },
    { label: "NT Era", range: [-100, 100] },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title text-3xl">Biblical Timeline</h1>
        <p className="text-sm opacity-60 mt-1">
          Biblical events alongside secular history from ~2200 BC to 100 AD.
          Click any dot to see details.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Era presets */}
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setYearRange(p.range);
              setSelectedEvent(null);
            }}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              yearRange[0] === p.range[0] && yearRange[1] === p.range[1]
                ? "bg-[var(--color-gold)] text-white border-[var(--color-gold)]"
                : "border-[var(--color-gold)]/30 hover:bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)]"
            }`}
          >
            {p.label}
          </button>
        ))}

        <span className="text-xs opacity-30">|</span>

        {/* Toggles */}
        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={showBiblical}
            onChange={(e) => setShowBiblical(e.target.checked)}
            className="rounded"
          />
          Biblical ({data?.biblical.length ?? 0})
        </label>
        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={showSecular}
            onChange={(e) => setShowSecular(e.target.checked)}
            className="rounded"
          />
          Secular ({data?.secular.length ?? 0})
        </label>
      </div>

      {loading && <p className="text-sm opacity-50">Loading timeline...</p>}

      {!loading && data && (
        <>
          {/* Era color bar */}
          <EraBar eras={data.eras} yearMin={yearRange[0]} yearMax={yearRange[1]} />

          {/* Timeline track */}
          <div className="relative h-32 mb-4 rounded-lg bg-[var(--color-gold)]/5 border border-[var(--color-gold-dark)]/10 overflow-hidden">
            {/* Track labels */}
            <div className="absolute left-2 top-1 text-[8px] uppercase tracking-wider opacity-30">
              Biblical
            </div>
            <div className="absolute left-2 bottom-1 text-[8px] uppercase tracking-wider opacity-30">
              Secular
            </div>

            {/* Center line */}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--color-gold-dark)]/15" />

            {/* Event dots */}
            {allEvents.map((evt) => (
              <EventDot
                key={evt.id}
                event={evt}
                yearMin={yearRange[0]}
                yearMax={yearRange[1]}
                onClick={() => setSelectedEvent(
                  selectedEvent?.id === evt.id ? null : evt
                )}
                isSelected={selectedEvent?.id === evt.id}
              />
            ))}

            {/* Year markers */}
            {(() => {
              const span = yearRange[1] - yearRange[0];
              const step = span > 1500 ? 500 : span > 500 ? 200 : span > 200 ? 100 : 50;
              const markers = [];
              for (let y = Math.ceil(yearRange[0] / step) * step; y <= yearRange[1]; y += step) {
                const left = ((y - yearRange[0]) / span) * 100;
                markers.push(
                  <div
                    key={y}
                    className="absolute bottom-0 text-[8px] opacity-30 -translate-x-1/2"
                    style={{ left: `${left}%` }}
                  >
                    {yearLabel(y)}
                  </div>
                );
              }
              return markers;
            })()}
          </div>

          {/* Selected event detail */}
          {selectedEvent && (
            <div className="rounded-lg border border-[var(--color-gold-dark)]/15 bg-white p-4 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-[var(--color-ink)]">
                      {selectedEvent.title}
                    </h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                      selectedEvent.type === "biblical"
                        ? "bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)]"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {selectedEvent.type === "biblical" ? selectedEvent.era : selectedEvent.category}
                    </span>
                  </div>
                  <p className="text-sm opacity-60">{yearLabel(selectedEvent.year)}</p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-xs opacity-40 hover:opacity-100 p-1"
                >
                  ✕
                </button>
              </div>

              {selectedEvent.description && (
                <p className="text-sm mt-2 leading-relaxed font-body">
                  {selectedEvent.description}
                </p>
              )}

              {selectedEvent.participants && selectedEvent.participants.length > 0 && (
                <div className="mt-2">
                  <span className="text-[9px] uppercase tracking-wider opacity-50">Participants: </span>
                  <span className="text-xs">{selectedEvent.participants.join(", ")}</span>
                </div>
              )}

              {selectedEvent.locations && selectedEvent.locations.length > 0 && (
                <div className="mt-1">
                  <span className="text-[9px] uppercase tracking-wider opacity-50">Locations: </span>
                  <span className="text-xs">{selectedEvent.locations.join(", ")}</span>
                </div>
              )}
            </div>
          )}

          {/* Events list below */}
          <div>
            <h2 className="text-sm font-bold mb-2 opacity-60">
              {allEvents.length} events in range {yearLabel(yearRange[0])} – {yearLabel(yearRange[1])}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {allEvents
                .sort((a, b) => a.year - b.year)
                .slice(0, 60)
                .map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`text-left p-2 rounded border transition text-xs ${
                      selectedEvent?.id === evt.id
                        ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10"
                        : "border-[var(--color-gold-dark)]/10 hover:bg-[var(--color-gold)]/5"
                    }`}
                  >
                    <span className="font-medium">{evt.title}</span>
                    <span className="opacity-40 ml-1">{yearLabel(evt.year)}</span>
                    <span className={`ml-1 text-[8px] px-1 rounded ${
                      evt.type === "biblical"
                        ? "bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)]"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {evt.type === "biblical" ? "B" : "S"}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
