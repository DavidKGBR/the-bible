import { useState, useEffect, useCallback } from "react";
import { fetchReaderPage, fetchBooks, type ReaderPage, type Book } from "../../services/api";
import OrnateCorner from "./OrnateCorner";
import DropCap from "./DropCap";

const VERSES_PER_PAGE = 15;
const TRANSLATIONS = ["kjv", "bbe", "nvi", "ra", "acf", "rvr", "apee", "asv", "web", "darby"];

export default function ImmersiveReader() {
  const [books, setBooks] = useState<Book[]>([]);
  const [data, setData] = useState<ReaderPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookId, setBookId] = useState("GEN");
  const [chapter, setChapter] = useState(1);
  const [translation, setTranslation] = useState("kjv");
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    fetchBooks(translation).then(setBooks).catch(() => {});
  }, [translation]);

  useEffect(() => {
    setLoading(true);
    setPageIndex(0);
    fetchReaderPage(bookId, chapter, translation)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [bookId, chapter, translation]);

  const totalPages = data ? Math.ceil(data.verses.length / VERSES_PER_PAGE) : 0;
  const pageVerses = data
    ? data.verses.slice(pageIndex * VERSES_PER_PAGE, (pageIndex + 1) * VERSES_PER_PAGE)
    : [];

  const prevPage = useCallback(() => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    } else if (data?.has_previous) {
      setChapter(chapter - 1);
    }
  }, [pageIndex, data, chapter]);

  const nextPage = useCallback(() => {
    if (pageIndex < totalPages - 1) {
      setPageIndex(pageIndex + 1);
    } else if (data?.has_next) {
      setChapter(chapter + 1);
    }
  }, [pageIndex, totalPages, data, chapter]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prevPage();
      if (e.key === "ArrowRight") nextPage();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prevPage, nextPage]);

  const firstVerse = pageVerses[0];
  const firstLetter = firstVerse?.text?.[0] || "";
  const firstVerseRest = firstVerse?.text?.slice(1) || "";

  return (
    <div
      className="min-h-[80vh] rounded-xl p-8 relative"
      style={{
        backgroundColor: "var(--bg-void)",
        boxShadow: "inset 0 0 100px rgba(196, 162, 101, 0.05)",
      }}
    >
      {/* Controls bar */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <select
          value={bookId}
          onChange={(e) => { setBookId(e.target.value); setChapter(1); }}
          className="border border-[var(--color-gold-dark)]/30 rounded px-3 py-1.5
                     bg-[var(--bg-ambient)] text-[var(--color-parchment)] text-sm"
        >
          {books.map((b) => (
            <option key={b.book_id} value={b.book_id}>{b.book_name}</option>
          ))}
        </select>

        <select
          value={chapter}
          onChange={(e) => setChapter(Number(e.target.value))}
          className="border border-[var(--color-gold-dark)]/30 rounded px-3 py-1.5
                     bg-[var(--bg-ambient)] text-[var(--color-parchment)] text-sm"
        >
          {Array.from({ length: data?.total_chapters || 1 }, (_, i) => i + 1).map((ch) => (
            <option key={ch} value={ch}>Ch. {ch}</option>
          ))}
        </select>

        <select
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          className="border border-[var(--color-gold-dark)]/30 rounded px-3 py-1.5
                     bg-[var(--bg-ambient)] text-[var(--color-parchment)] text-sm"
        >
          {TRANSLATIONS.map((t) => (
            <option key={t} value={t}>{t.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Book page */}
      <div
        className="relative max-w-2xl mx-auto rounded-lg p-10 min-h-[500px]"
        style={{
          backgroundColor: "var(--bg-ambient)",
          border: "1px solid rgba(196, 162, 101, 0.15)",
          boxShadow: "0 0 60px rgba(196, 162, 101, 0.08)",
        }}
      >
        <OrnateCorner position="top-left" />
        <OrnateCorner position="top-right" />
        <OrnateCorner position="bottom-left" />
        <OrnateCorner position="bottom-right" />

        {loading ? (
          <p className="text-center text-[var(--color-gold)] opacity-50 py-20 font-body text-lg">
            Loading...
          </p>
        ) : data ? (
          <div className="fade-in">
            {/* Chapter title */}
            <h2
              className="font-display text-center text-2xl mb-8 tracking-widest"
              style={{ color: "var(--color-gold)" }}
            >
              {data.book_name}
              <span className="block text-sm tracking-normal opacity-60 mt-1">
                Chapter {data.chapter}
              </span>
            </h2>

            {/* Verses */}
            <div className="font-body text-[var(--color-parchment)] text-lg leading-[1.9]">
              {pageVerses.map((v, i) => (
                <span key={v.verse}>
                  {i === 0 && pageIndex === 0 ? (
                    <>
                      <DropCap letter={firstLetter} />
                      <sup className="text-[var(--color-gold)] text-xs font-bold mr-1">
                        {v.verse}
                      </sup>
                      {firstVerseRest}{" "}
                    </>
                  ) : (
                    <>
                      <sup className="text-[var(--color-gold)] text-xs font-bold mr-1">
                        {v.verse}
                      </sup>
                      {v.text}{" "}
                    </>
                  )}
                </span>
              ))}
            </div>

            {/* Page indicator */}
            <div
              className="text-center mt-8 text-sm font-body tracking-wide"
              style={{ color: "var(--color-gold-dark)" }}
            >
              {pageIndex + 1} / {totalPages}
            </div>
          </div>
        ) : (
          <p className="text-center text-red-400 py-20">Failed to load.</p>
        )}
      </div>

      {/* Navigation arrows */}
      <div className="flex justify-between mt-6 max-w-2xl mx-auto">
        <button
          onClick={prevPage}
          disabled={pageIndex === 0 && !data?.has_previous}
          className="text-[var(--color-gold)] opacity-60 hover:opacity-100
                     disabled:opacity-20 transition text-2xl px-4"
        >
          &larr;
        </button>
        <button
          onClick={nextPage}
          disabled={pageIndex >= totalPages - 1 && !data?.has_next}
          className="text-[var(--color-gold)] opacity-60 hover:opacity-100
                     disabled:opacity-20 transition text-2xl px-4"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
}
