import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchBooks,
  fetchReaderPage,
  fetchInterlinearChapter,
  type Book,
  type ReaderPage,
  type InterlinearWord
} from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";
import WordDetailPanel from "../lexicon/WordDetailPanel";

export default function InterlinearView() {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState<ReaderPage | null>(null);
  const [words, setWords] = useState<InterlinearWord[]>([]);
  const [loading, setLoading] = useState(true);

  const [bookId, setBookId] = useState(searchParams.get("book") || "GEN");
  const [chapter, setChapter] = useState(Number(searchParams.get("chapter")) || 1);
  const [translation] = useState("kjv"); // Reference translation is KJV usually for Interlinear
  
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks(translation).then(setBooks).catch(() => {});
  }, [translation]);

  // Sync params
  useEffect(() => {
    const b = searchParams.get("book");
    const c = searchParams.get("chapter");
    if (b) setBookId(b);
    if (c) setChapter(Number(c));
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchReaderPage(bookId, chapter, translation),
      fetchInterlinearChapter(bookId, chapter)
    ])
      .then(([p, interData]) => {
        setPage(p);
        setWords(interData.words);
      })
      .catch(() => {
        setPage(null);
        setWords([]);
      })
      .finally(() => setLoading(false));
  }, [bookId, chapter, translation]);

  const totalChapters = page?.total_chapters || 1;

  // Group interlinear words by verse_id for easy rendering
  const verseWords: Record<string, InterlinearWord[]> = {};
  if (!loading && page) {
    page.verses.forEach(v => {
      verseWords[v.verse_id] = [];
    });
    words.forEach(w => {
      if (!verseWords[w.verse_id]) {
        verseWords[w.verse_id] = [];
      }
      verseWords[w.verse_id].push(w);
    });
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-8 items-center border-b border-[var(--color-gold)]/20 pb-4">
        <select
          value={bookId}
          onChange={(e) => { setBookId(e.target.value); setChapter(1); }}
          className="border rounded px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50 focus:border-[var(--color-gold)]/60 border-[var(--color-gold)]/30"
        >
          {books.map((b) => (
            <option key={b.book_id} value={b.book_id}>{b.book_name}</option>
          ))}
        </select>

        <select
          value={chapter}
          onChange={(e) => setChapter(Number(e.target.value))}
          className="border rounded px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50 focus:border-[var(--color-gold)]/60 border-[var(--color-gold)]/30"
        >
          {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => (
            <option key={ch} value={ch}>Chapter {ch}</option>
          ))}
        </select>
        
        <div className="ml-auto flex items-center">
             <span className="text-xs uppercase tracking-widest opacity-40 font-bold bg-[var(--color-ink)]/5 px-3 py-1.5 rounded text-[var(--color-gold-dark)] shadow-sm">Interlinear Mode</span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching original texts..." />
      ) : page ? (
        <div>
          <div className="mb-10 text-center fade-in">
            <h2 className="page-title text-4xl mb-2">
              {page.book_name} {page.chapter}
            </h2>
            <p className="text-sm opacity-50 uppercase tracking-widest text-[var(--color-gold-dark)] font-bold">
              Original Text Analysis
            </p>
          </div>

          <div className="space-y-12 pb-20 fade-in">
            {page.verses.map((v) => {
              const vWords = verseWords[v.verse_id] || [];
              const direction = vWords[0]?.language === 'hebrew' ? 'rtl' : 'ltr';

              return (
                <div key={v.verse} className="flex gap-4 sm:gap-6 relative group">
                  {/* Verse Number Margin */}
                  <div className="pt-2 text-[var(--color-gold)] font-body font-bold text-lg select-none w-6 shrink-0 text-right">
                    {v.verse}
                  </div>
                  
                  {/* Word Grid Container */}
                  <div className="flex-1 flex flex-wrap gap-x-6 gap-y-8 min-w-0" style={{ direction: direction as any }}>
                    {vWords.length === 0 ? (
                      <p className="text-sm italic opacity-50 pt-3">Interlinear data missing for this verse.</p>
                    ) : (vWords.map((w, idx) => (
                      <div key={`${w.verse_id}-${w.word_position}-${idx}`} className="flex flex-col gap-1.5 items-center w-auto max-w-[140px] text-center" style={{ direction: 'ltr' }}>
                         {/* Line 1: Original */}
                         <div className={`text-2xl leading-none text-[var(--color-ink)] ${w.language === 'hebrew' ? 'font-hebrew pt-1 pb-2' : 'font-greek py-1'}`}>
                             {w.original_word}
                         </div>
                         {/* Line 2: Transliteration / Morphology */}
                         <div className="hidden md:block text-[11px] text-[var(--color-gold-dark)] opacity-70 italic truncate w-full" title={w.lemma}>
                             {w.transliteration} <span className="opacity-50 text-[9px] uppercase not-italic ml-0.5">· {w.grammar}</span>
                         </div>
                         {/* Line 3: Translation */}
                         <div className="text-[13px] font-bold text-[var(--color-ink)]/90 leading-tight">
                             {w.english}
                         </div>
                         {/* Line 4: Strong's Link */}
                         <button 
                            className="mt-1 flex items-center justify-center text-[10px] bg-[var(--color-gold)]/10 hover:bg-[var(--color-gold)]/20 text-[var(--color-gold-dark)] px-2 py-0.5 rounded cursor-pointer transition focus:ring-1 focus:ring-[var(--color-gold)] outline-none font-medium"
                            onClick={() => setSelectedWord(w.strongs_id)}
                         >
                            {w.strongs_raw}
                         </button>
                      </div>
                    )))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-[var(--color-gold)]/20 mb-20">
            <button
              disabled={!page.has_previous}
              onClick={() => { setChapter(chapter - 1); window.scrollTo({top:0}); }}
              className="px-5 py-2.5 rounded bg-[var(--color-ink)] text-[var(--color-parchment)] text-sm disabled:opacity-30 hover:opacity-80 transition font-bold"
            >
              &larr; Prev
            </button>
            <button
              disabled={!page.has_next}
              onClick={() => { setChapter(chapter + 1); window.scrollTo({top:0}); }}
              className="px-5 py-2.5 rounded bg-[var(--color-ink)] text-[var(--color-parchment)] text-sm disabled:opacity-30 hover:opacity-80 transition font-bold"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      ) : (
        <p className="text-red-600">Failed to load chapter.</p>
      )}

      {/* Lexicon Bottom Sheet / Sidebar */}
      {selectedWord && (
          <>
             {/* Backdrop */}
             <div 
               className="fixed inset-0 bg-black/20 z-40 fade-in backdrop-blur-sm" 
               onClick={() => setSelectedWord(null)}
             />
             <WordDetailPanel 
               strongsId={selectedWord} 
               onClose={() => setSelectedWord(null)} 
             />
          </>
      )}
    </div>
  );
}
