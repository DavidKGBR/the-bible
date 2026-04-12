import * as d3 from "d3";
import type { Book, Arc } from "../../services/api";

// Category colors from the roadmap palette
const CATEGORY_COLORS: Record<string, string> = {
  Law: "#2e5090",
  History: "#8b6914",
  Poetry: "#9b2335",
  "Major Prophets": "#5c4033",
  "Minor Prophets": "#5c4033",
  Gospels: "#c5a55a",
  Acts: "#c5a55a",
  "Pauline Epistles": "#4682b4",
  "General Epistles": "#4682b4",
  Apocalyptic: "#8b0000",
};

const TESTAMENT_COLORS = {
  "Old Testament": "#4a7c59",
  "New Testament": "#6b4c9a",
};

export interface BookPosition {
  book: Book;
  x: number;
  width: number;
}

/** Map books to x-positions proportional to verse count. */
export function computeBookPositions(
  books: Book[],
  totalWidth: number,
  padding = 2
): BookPosition[] {
  const totalVerses = books.reduce((s, b) => s + b.total_verses, 0);
  if (totalVerses === 0) return [];

  const usableWidth = totalWidth - padding * books.length;
  let x = 0;

  return books.map((book) => {
    const width = Math.max(4, (book.total_verses / totalVerses) * usableWidth);
    const pos = { book, x: x + padding / 2, width };
    x += width + padding;
    return pos;
  });
}

/** Generate an SVG arc path between two x-positions. */
export function arcPath(x1: number, x2: number, baseline: number): string {
  const radius = Math.abs(x2 - x1) / 2;
  // Flip direction so arcs go upward
  const sweep = x1 < x2 ? 1 : 0;
  return `M ${x1},${baseline} A ${radius},${radius} 0 0,${sweep} ${x2},${baseline}`;
}

/** Get color for a book bar based on its category. */
export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] || "#666";
}

/** Color scale for arcs by distance. */
export function distanceColorScale(maxDistance: number) {
  return d3.scaleSequential(d3.interpolateViridis).domain([0, maxDistance]);
}

/** Color for an arc by testament crossing. */
export function testamentArcColor(arc: Arc, positions: Map<string, BookPosition>): string {
  const source = positions.get(arc.source_book_id);
  const target = positions.get(arc.target_book_id);
  if (!source || !target) return "#999";

  const sT = source.book.testament;
  const tT = target.book.testament;
  if (sT !== tT) return "#b8860b"; // gold for cross-testament
  return TESTAMENT_COLORS[sT as keyof typeof TESTAMENT_COLORS] || "#999";
}

/** Opacity scale based on connection weight. */
export function opacityScale(weight: number, maxWeight: number): number {
  return Math.max(0.08, Math.min(0.8, weight / maxWeight));
}
