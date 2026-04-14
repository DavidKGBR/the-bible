import { useState } from "react";
import BibleReader from "../components/BibleReader";
import ParallelView from "../components/ParallelView";
import ImmersiveReader from "../components/ImmersiveReader/ImmersiveReader";
import InterlinearView from "../components/reader/InterlinearView";

type Mode = "single" | "parallel" | "immersive" | "interlinear";

const MODES: { key: Mode; label: string }[] = [
  { key: "single", label: "Single" },
  { key: "parallel", label: "Parallel" },
  { key: "immersive", label: "Immersive" },
  { key: "interlinear", label: "Interlinear" },
];

export default function ReaderPage() {
  const [mode, setMode] = useState<Mode>("single");

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="page-title text-2xl">Bible Reader</h2>
        <div className="flex rounded overflow-hidden border">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`px-4 py-1.5 text-sm transition ${
                mode === m.key
                  ? "bg-[var(--color-ink)] text-[var(--color-parchment)]"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {mode === "single" && <BibleReader />}
      {mode === "parallel" && <ParallelView />}
      {mode === "immersive" && <ImmersiveReader />}
      {mode === "interlinear" && <InterlinearView />}
    </div>
  );
}
