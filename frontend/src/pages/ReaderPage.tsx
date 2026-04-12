import { useState } from "react";
import BibleReader from "../components/BibleReader";
import ParallelView from "../components/ParallelView";

type Mode = "single" | "parallel";

export default function ReaderPage() {
  const [mode, setMode] = useState<Mode>("single");

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-ink)]">
          Bible Reader
        </h2>
        <div className="flex rounded overflow-hidden border">
          <button
            onClick={() => setMode("single")}
            className={`px-4 py-1.5 text-sm transition ${
              mode === "single"
                ? "bg-[var(--color-ink)] text-[var(--color-parchment)]"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            Single
          </button>
          <button
            onClick={() => setMode("parallel")}
            className={`px-4 py-1.5 text-sm transition ${
              mode === "parallel"
                ? "bg-[var(--color-ink)] text-[var(--color-parchment)]"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            Parallel
          </button>
        </div>
      </div>

      {mode === "single" ? <BibleReader /> : <ParallelView />}
    </div>
  );
}
