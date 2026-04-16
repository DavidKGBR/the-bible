/**
 * topicNames.ts — translations for the top ~80 biblical topics by verse
 * count (Nave's Topical Bible dataset). Slug-keyed so it matches
 * `topic.slug` across TopicsPage and any topic chip/link.
 *
 * Convention: Nave's Topical entries are UPPERCASE with comma-separated
 * clarifiers (e.g. "ISRAEL, PROPHECIES CONCERNING"). We preserve the
 * uppercase style in PT/ES — "FÉ", "AMOR", "JESUS, O CRISTO" — so topics
 * read as conceptual tags rather than prose headings.
 *
 * Fallback: missing slug returns `fallback` (API name) or the slug itself.
 */

import type { Locale } from "./i18nContext";

export interface TopicEntry {
  pt: string;
  es: string;
}

// ─── Core lookup — top ~80 by verse count ────────────────────────────────────

const TOPICS: Record<string, TopicEntry> = {
  // Deity & core identifiers
  "jesus-the-christ": { pt: "JESUS, O CRISTO", es: "JESÚS, EL CRISTO" },
  god: { pt: "DEUS", es: "DIOS" },
  "holy-spirit": { pt: "ESPÍRITO SANTO", es: "ESPÍRITU SANTO" },

  // People / nations
  israel: { pt: "ISRAEL", es: "ISRAEL" },
  "israel-prophecies-concerning": { pt: "ISRAEL, PROFECIAS A RESPEITO", es: "ISRAEL, PROFECÍAS ACERCA DE" },
  david: { pt: "DAVI", es: "DAVID" },
  moses: { pt: "MOISÉS", es: "MOISÉS" },
  paul: { pt: "PAULO", es: "PABLO" },
  solomon: { pt: "SALOMÃO", es: "SALOMÓN" },
  joshua: { pt: "JOSUÉ", es: "JOSUÉ" },
  joseph: { pt: "JOSÉ", es: "JOSÉ" },
  jacob: { pt: "JACÓ", es: "JACOB" },
  job: { pt: "JÓ", es: "JOB" },
  isaiah: { pt: "ISAÍAS", es: "ISAÍAS" },
  ezekiel: { pt: "EZEQUIEL", es: "EZEQUIEL" },

  // Places
  jerusalem: { pt: "JERUSALÉM", es: "JERUSALÉN" },
  babylon: { pt: "BABILÔNIA", es: "BABILONIA" },
  canaan: { pt: "CANAÃ", es: "CANAÁN" },

  // Core theological concepts
  faith: { pt: "FÉ", es: "FE" },
  love: { pt: "AMOR", es: "AMOR" },
  prayer: { pt: "ORAÇÃO", es: "ORACIÓN" },
  praise: { pt: "LOUVOR", es: "ALABANZA" },
  repentance: { pt: "ARREPENDIMENTO", es: "ARREPENTIMIENTO" },
  salvation: { pt: "SALVAÇÃO", es: "SALVACIÓN" },
  wisdom: { pt: "SABEDORIA", es: "SABIDURÍA" },
  obedience: { pt: "OBEDIÊNCIA", es: "OBEDIENCIA" },
  blessing: { pt: "BÊNÇÃO", es: "BENDICIÓN" },
  prophecy: { pt: "PROFECIA", es: "PROFECÍA" },
  revelation: { pt: "REVELAÇÃO", es: "REVELACIÓN" },
  vision: { pt: "VISÃO", es: "VISIÓN" },
  intercession: { pt: "INTERCESSÃO", es: "INTERCESIÓN" },
  "word-of-god": { pt: "PALAVRA DE DEUS", es: "PALABRA DE DIOS" },
  thankfulness: { pt: "GRATIDÃO", es: "GRATITUD" },
  righteous: { pt: "JUSTO", es: "JUSTO" },

  // Sin / suffering / negative
  "sin-1": { pt: "PECADO (1)", es: "PECADO (1)" },
  "afflictions-and-adversities": { pt: "AFLIÇÕES E ADVERSIDADES", es: "AFLICCIONES Y ADVERSIDADES" },
  "wicked-people": { pt: "ÍMPIOS (PESSOAS)", es: "IMPÍOS (PERSONAS)" },
  backsliders: { pt: "APÓSTATAS", es: "APÓSTATAS" },
  idolatry: { pt: "IDOLATRIA", es: "IDOLATRÍA" },
  falsehood: { pt: "FALSIDADE", es: "FALSEDAD" },
  hypocrisy: { pt: "HIPOCRISIA", es: "HIPOCRESÍA" },
  temptation: { pt: "TENTAÇÃO", es: "TENTACIÓN" },
  malice: { pt: "MALÍCIA", es: "MALICIA" },
  murmuring: { pt: "MURMURAÇÃO", es: "MURMURACIÓN" },
  homicide: { pt: "HOMICÍDIO", es: "HOMICIDIO" },
  persecution: { pt: "PERSEGUIÇÃO", es: "PERSECUCIÓN" },
  death: { pt: "MORTE", es: "MUERTE" },

  // Religion / practice / office
  church: { pt: "IGREJA", es: "IGLESIA" },
  religion: { pt: "RELIGIÃO", es: "RELIGIÓN" },
  priest: { pt: "SACERDOTE", es: "SACERDOTE" },
  levites: { pt: "LEVITAS", es: "LEVITAS" },
  temple: { pt: "TEMPLO", es: "TEMPLO" },
  tabernacle: { pt: "TABERNÁCULO", es: "TABERNÁCULO" },
  offerings: { pt: "OFERTAS", es: "OFRENDAS" },
  commandments: { pt: "MANDAMENTOS", es: "MANDAMIENTOS" },
  law: { pt: "LEI", es: "LEY" },
  miracles: { pt: "MILAGRES", es: "MILAGROS" },
  "minister-christian": { pt: "MINISTRO, Cristão", es: "MINISTRO, Cristiano" },
  "angel-a-spirit": { pt: "ANJO (um espírito)", es: "ÁNGEL (un espíritu)" },
  psalms: { pt: "SALMOS", es: "SALMOS" },
  poetry: { pt: "POESIA", es: "POESÍA" },
  "readings-select": { pt: "LEITURAS SELECIONADAS", es: "LECTURAS SELECCIONADAS" },
  "quotations-and-allusions": { pt: "CITAÇÕES E ALUSÕES", es: "CITAS Y ALUSIONES" },
  "symbols-and-similitudes": { pt: "SÍMBOLOS E SIMILITUDES", es: "SÍMBOLOS Y SIMILITUDES" },
  instruction: { pt: "INSTRUÇÃO", es: "INSTRUCCIÓN" },
  reproof: { pt: "REPREENSÃO", es: "REPRENSIÓN" },
  decision: { pt: "DECISÃO", es: "DECISIÓN" },

  // Society / power / civic
  rulers: { pt: "GOVERNANTES", es: "GOBERNANTES" },
  government: { pt: "GOVERNO", es: "GOBIERNO" },
  armies: { pt: "EXÉRCITOS", es: "EJÉRCITOS" },
  war: { pt: "GUERRA", es: "GUERRA" },
  judge: { pt: "JUIZ", es: "JUEZ" },
  judgments: { pt: "JUÍZOS", es: "JUICIOS" },
  servant: { pt: "SERVO", es: "SIERVO" },
  prisoners: { pt: "PRISIONEIROS", es: "PRISIONEROS" },
  women: { pt: "MULHERES", es: "MUJERES" },
  children: { pt: "CRIANÇAS", es: "NIÑOS" },
  animals: { pt: "ANIMAIS", es: "ANIMALES" },
  liberality: { pt: "GENEROSIDADE", es: "GENEROSIDAD" },
  "zeal-religious": { pt: "ZELO RELIGIOSO", es: "CELO RELIGIOSO" },
};

// ─── Helper functions ────────────────────────────────────────────────────────

/**
 * Translate a topic slug to the localized name.
 * Falls back to `fallback` (typically `topic.name` from the API).
 */
export function topicName(
  slug: string | null | undefined,
  locale: Locale,
  fallback?: string,
): string {
  if (!slug) return fallback ?? "";
  if (locale === "en") return fallback ?? slug;
  const entry = TOPICS[slug];
  if (!entry) return fallback ?? slug;
  if (locale === "pt") return entry.pt;
  if (locale === "es") return entry.es;
  return fallback ?? slug;
}

export function hasTopicTranslation(slug: string | null | undefined): boolean {
  return !!slug && slug in TOPICS;
}

export { TOPICS };
