import { useEffect, useState } from "react";
import { fetchExplorerPresets, type ExplorerPreset } from "../../services/api";
import { useI18n } from "../../i18n/i18nContext";

interface Props {
  onSelect: (preset: ExplorerPreset) => void;
}

export default function PresetExplorations({ onSelect }: Props) {
  const { t } = useI18n();
  const [presets, setPresets] = useState<ExplorerPreset[]>([]);

  useEffect(() => {
    fetchExplorerPresets()
      .then((d) => setPresets(d.presets))
      .catch(() => {});
  }, []);

  if (presets.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-2xl text-[var(--color-ink)] mb-2">
          {t("explorer.presetTitle")}
        </h2>
        <p className="text-sm opacity-60 max-w-lg mx-auto">
          {t("explorer.presetSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="text-left p-4 rounded-lg border border-[var(--color-gold-dark)]/15
                       hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/5
                       transition group"
          >
            <div className="text-2xl mb-2">{p.icon}</div>
            <div className="font-display font-bold text-sm text-[var(--color-ink)]
                           group-hover:text-[var(--color-gold-dark)] transition">
              {p.label}
            </div>
            <p className="text-[11px] opacity-50 mt-1 line-clamp-2">
              {p.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
