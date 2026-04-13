import { useState, useEffect } from "react";
import { fetchBooks, fetchArcs, type Book, type Arc } from "../services/api";

export interface ArcFilters {
  sourceBook: string;
  targetBook: string;
  minConnections: number;
  colorBy: "distance" | "testament" | "category";
}

export interface ArcData {
  books: Book[];
  arcs: Arc[];
  totalCrossrefs: number;
  loading: boolean;
  error: string | null;
  filters: ArcFilters;
  setFilters: (f: Partial<ArcFilters>) => void;
}

const DEFAULT_FILTERS: ArcFilters = {
  sourceBook: "",
  targetBook: "",
  minConnections: 3,
  colorBy: "distance",
};

export function useArcData(): ArcData {
  const [books, setBooks] = useState<Book[]>([]);
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [totalCrossrefs, setTotalCrossrefs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ArcFilters>(DEFAULT_FILTERS);

  const setFilters = (partial: Partial<ArcFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  };

  // Fetch books once
  useEffect(() => {
    fetchBooks("kjv")
      .then(setBooks)
      .catch((e) => setError(e.message));
  }, []);

  // Fetch arcs when filters change
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchArcs(
      filters.sourceBook || undefined,
      filters.minConnections,
      filters.colorBy,
      filters.targetBook || undefined
    )
      .then((data) => {
        setArcs(data.arcs);
        setTotalCrossrefs(data.metadata.total_crossrefs);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters.sourceBook, filters.targetBook, filters.minConnections, filters.colorBy]);

  return { books, arcs, totalCrossrefs, loading, error, filters, setFilters };
}
