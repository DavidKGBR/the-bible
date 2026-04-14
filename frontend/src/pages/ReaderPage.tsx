import { useState } from "react";
import BibleReader from "../components/BibleReader";
import ParallelView from "../components/ParallelView";
import ImmersiveReader from "../components/ImmersiveReader/ImmersiveReader";
import InterlinearView from "../components/reader/InterlinearView";
import { useI18n } from "../i18n/i18nContext";

type Mode = "single" | "parallel" | "immersive" | "interlinear";

const MODE_KEYS: { key: Mode; i18nKey: string }[] = [
  { key: "single", i18nKey: "reader.single" },
  { key: "parallel", i18nKey: "reader.parallel" },
  { key: "immersive", i18nKey: "reader.immersive" },
  { key: "interlinear", i18nKey: "reader.interlinear" },
];

export default function ReaderPage() {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("single");

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="page-title text-2xl">{t("reader.title")}</h2>
        <div className="flex rounded overflow-hidden border">
          {MODE_KEYS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`px-4 py-1.5 text-sm transition ${
                mode === m.key
                  ? "bg-[var(--color-ink)] text-[var(--color-parchment)]"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {t(m.i18nKey)}
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
