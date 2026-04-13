import type { Book } from "../../services/api";

export type PlanId =
  | "bible-1-year"
  | "nt-90-days"
  | "psalms-30-days"
  | "proverbs-31-days"
  | "gospels-40-days";

export interface ChapterRef {
  book_id: string;
  book_name: string;
  chapter: number;
  chapter_id: string; // "GEN.1"
}

export interface DayReading {
  day: number; // 1-based
  chapters: ChapterRef[];
}

export interface PlanDefinition {
  id: PlanId;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  total_days: number;
  /** Pure function: expands a book catalog into the per-day reading schedule. */
  buildSchedule(books: Book[]): DayReading[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function chapterRefs(books: Book[]): ChapterRef[] {
  const refs: ChapterRef[] = [];
  for (const b of books) {
    for (let c = 1; c <= b.total_chapters; c++) {
      refs.push({
        book_id: b.book_id,
        book_name: b.book_name,
        chapter: c,
        chapter_id: `${b.book_id}.${c}`,
      });
    }
  }
  return refs;
}

/**
 * Distribute `chapters` across `totalDays`. The first `remainder` days get
 * `base + 1` chapters and the rest get `base`, so heavier days come first
 * (avoids a trailing day with only 1 chapter when totals are tight).
 */
function chunkChapters(
  chapters: ChapterRef[],
  totalDays: number
): DayReading[] {
  if (totalDays <= 0) return [];
  const base = Math.floor(chapters.length / totalDays);
  const remainder = chapters.length % totalDays;

  const schedule: DayReading[] = [];
  let cursor = 0;
  for (let day = 1; day <= totalDays; day++) {
    const size = base + (day <= remainder ? 1 : 0);
    const slice = chapters.slice(cursor, cursor + size);
    cursor += size;
    schedule.push({ day, chapters: slice });
  }
  return schedule;
}

function sortByPosition(books: Book[]): Book[] {
  return [...books].sort((a, b) => a.book_position - b.book_position);
}

// ─── Plan definitions ────────────────────────────────────────────────────────

export const PLANS: PlanDefinition[] = [
  {
    id: "bible-1-year",
    title: "Bible in 1 Year",
    subtitle: "365 days · ~3 chapters/day",
    description:
      "Read the whole Bible in canonical order across 365 days. ~3 chapters a day keeps it paced.",
    emoji: "📖",
    total_days: 365,
    buildSchedule(books) {
      return chunkChapters(chapterRefs(sortByPosition(books)), 365);
    },
  },
  {
    id: "nt-90-days",
    title: "New Testament in 90 Days",
    subtitle: "90 days · ~3 chapters/day",
    description:
      "Matthew through Revelation in three months. A condensed dive into the life and teaching of Jesus and the early church.",
    emoji: "✝️",
    total_days: 90,
    buildSchedule(books) {
      const nt = sortByPosition(
        books.filter((b) => b.testament === "New Testament")
      );
      return chunkChapters(chapterRefs(nt), 90);
    },
  },
  {
    id: "psalms-30-days",
    title: "Psalms in 30 Days",
    subtitle: "30 days · 5 chapters/day",
    description:
      "Five psalms per day. Excellent companion for morning or evening prayer.",
    emoji: "🎵",
    total_days: 30,
    buildSchedule(books) {
      const psa = books.filter((b) => b.book_id === "PSA");
      return chunkChapters(chapterRefs(psa), 30);
    },
  },
  {
    id: "proverbs-31-days",
    title: "Proverbs in 31 Days",
    subtitle: "31 days · 1 chapter/day",
    description:
      "One chapter per day of the month — the classic Proverbs-by-calendar-day habit.",
    emoji: "🦉",
    total_days: 31,
    buildSchedule(books) {
      const pro = books.filter((b) => b.book_id === "PRO");
      return chunkChapters(chapterRefs(pro), 31);
    },
  },
  {
    id: "gospels-40-days",
    title: "Gospels in 40 Days",
    subtitle: "40 days · ~2 chapters/day",
    description:
      "Matthew, Mark, Luke, and John in forty days — a Lent-friendly pace through the four accounts of Jesus.",
    emoji: "🕊️",
    total_days: 40,
    buildSchedule(books) {
      const gospelIds = new Set(["MAT", "MRK", "LUK", "JHN"]);
      const gospels = sortByPosition(books.filter((b) => gospelIds.has(b.book_id)));
      return chunkChapters(chapterRefs(gospels), 40);
    },
  },
];

export function getPlanById(id: PlanId): PlanDefinition | undefined {
  return PLANS.find((p) => p.id === id);
}
