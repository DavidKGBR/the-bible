/**
 * placeNames.ts — translations for the top ~90 biblical places by verse
 * count (Theographic + OpenBible datasets). Slug-keyed so it matches
 * `place.slug` and URL params across PlacesPage, MapPage, TimelinePage, etc.
 *
 * Pattern mirrors personNames.ts: a single `PLACES` record keyed by slug,
 * each entry has `pt` / `es`. Optional `typeKey` points to an i18n key for
 * "City" / "Mountain" / "Region" etc. used in the detail chip.
 *
 * Fallback: when a slug is missing, `placeName(slug, locale, fallback)`
 * returns the `fallback` (typically `place.name` from the API).
 *
 * Convention: consagrated PT-BR and ES-LATAM biblical toponyms.
 *   Jerusalem → Jerusalém (PT) / Jerusalén (ES)
 *   Egypt → Egito (PT) / Egipto (ES)
 *   Babylon → Babilônia (PT) / Babilonia (ES)
 *   Sea of Galilee → Mar da Galileia (PT) / Mar de Galilea (ES)
 */

import type { Locale } from "./i18nContext";

export interface PlaceEntry {
  pt: string;
  es: string;
  /** i18n key for the place type badge (optional). */
  typeKey?: string;
}

// ─── Core lookup table — top ~90 by verse count ──────────────────────────────

const PLACES: Record<string, PlaceEntry> = {
  // Core biblical centres
  jerusalem_636: { pt: "Jerusalém", es: "Jerusalén", typeKey: "place.type.city" },
  egypt_362: { pt: "Egito", es: "Egipto", typeKey: "place.type.region" },
  babylon_151: { pt: "Babilônia", es: "Babilonia", typeKey: "place.type.city" },
  jordan_653: { pt: "Jordão", es: "Jordán", typeKey: "place.type.water" },
  moab_815: { pt: "Moabe", es: "Moab", typeKey: "place.type.region" },
  zion_1263: { pt: "Sião", es: "Sion", typeKey: "place.type.mountain" },
  assyria_111: { pt: "Assíria", es: "Asiria", typeKey: "place.type.region" },
  samaria_1022: { pt: "Samaria", es: "Samaria", typeKey: "place.type.region" },
  gilead_475: { pt: "Gileade", es: "Galaad", typeKey: "place.type.region" },
  edom_357: { pt: "Edom", es: "Edom", typeKey: "place.type.region" },
  canaan_272: { pt: "Canaã", es: "Canaán", typeKey: "place.type.region" },
  syria_1122: { pt: "Síria", es: "Siria", typeKey: "place.type.region" },
  galilee_433: { pt: "Galileia", es: "Galilea", typeKey: "place.type.region" },
  bethel_202: { pt: "Betel (da Palestina)", es: "Betel (de Palestina)" },
  jericho_634: { pt: "Jericó", es: "Jericó", typeKey: "place.type.city" },
  lebanon_720: { pt: "Líbano", es: "Líbano", typeKey: "place.type.region" },
  hebron_551: { pt: "Hebrom", es: "Hebrón", typeKey: "place.type.city" },
  damascus_322: { pt: "Damasco", es: "Damasco", typeKey: "place.type.city" },
  tyre_1184: { pt: "Tiro", es: "Tiro", typeKey: "place.type.city" },
  bashan_159: { pt: "Basã", es: "Basán", typeKey: "place.type.region" },

  // Judges / Patriarchs
  sodom_1107: { pt: "Sodoma", es: "Sodoma", typeKey: "place.type.city" },
  judea_657: { pt: "Judeia", es: "Judea", typeKey: "place.type.region" },
  midian_796: { pt: "Midiã", es: "Madián", typeKey: "place.type.region" },
  gibeah_466: { pt: "Gibeá", es: "Guibeá" },
  shechem_1069: { pt: "Siquém", es: "Siquem", typeKey: "place.type.city" },
  heshbon_565: { pt: "Hesbom", es: "Hesbón", typeKey: "place.type.city" },
  negeb_885: { pt: "Neguebe", es: "Négueb", typeKey: "place.type.region" },
  gibeon_470: { pt: "Gibeão", es: "Gabaón", typeKey: "place.type.city" },
  gilgal_476: { pt: "Gilgal", es: "Gilgal", typeKey: "place.type.city" },
  bethlehem_218: { pt: "Belém", es: "Belén", typeKey: "place.type.city" },
  euphrates_421: { pt: "Eufrates", es: "Éufrates", typeKey: "place.type.water" },
  beersheba_170: { pt: "Berseba", es: "Beerseba", typeKey: "place.type.city" },
  gath_442: { pt: "Gate", es: "Gat", typeKey: "place.type.city" },
  ai_36: { pt: "Ai", es: "Hai", typeKey: "place.type.city" },
  sidon_1093: { pt: "Sidom", es: "Sidón", typeKey: "place.type.city" },
  nile_895: { pt: "Nilo", es: "Nilo", typeKey: "place.type.water" },
  shiloh_1081: { pt: "Siló", es: "Silo", typeKey: "place.type.city" },
  mizpah_811: { pt: "Mispá", es: "Mizpa", typeKey: "place.type.city" },
  nazareth_878: { pt: "Nazaré", es: "Nazaret", typeKey: "place.type.city" },
  red_sea_986: { pt: "Mar Vermelho", es: "Mar Rojo", typeKey: "place.type.water" },
  persia_938: { pt: "Pérsia", es: "Persia", typeKey: "place.type.region" },
  seir_1042: { pt: "Seir", es: "Seir", typeKey: "place.type.region" },
  hamath_516: { pt: "Hamate", es: "Hamat", typeKey: "place.type.city" },
  gomorrah_489: { pt: "Gomorra", es: "Gomorra", typeKey: "place.type.city" },
  lachish_711: { pt: "Laquis", es: "Laquis", typeKey: "place.type.city" },
  jezreel_643: { pt: "Jezreel", es: "Jezreel" },
  carmel_278: { pt: "Carmelo", es: "Carmelo", typeKey: "place.type.city" },
  macedonia_747: { pt: "Macedônia", es: "Macedonia", typeKey: "place.type.region" },
  mount_zion_860: { pt: "Monte Sião", es: "Monte Sion", typeKey: "place.type.mountain" },
  susa_1118: { pt: "Susã", es: "Susa", typeKey: "place.type.city" },
  "ramoth-gilead_984": { pt: "Ramote-Gileade", es: "Ramot de Galaad", typeKey: "place.type.city" },
  dan_323: { pt: "Dã", es: "Dan", typeKey: "place.type.region" },
  ekron_364: { pt: "Ecrom", es: "Ecrón", typeKey: "place.type.city" },
  tarshish_1139: { pt: "Társis", es: "Tarsis" },
  mount_sinai_855: { pt: "Monte Sinai", es: "Monte Sinaí", typeKey: "place.type.mountain" },
  gaza_446: { pt: "Gaza", es: "Gaza", typeKey: "place.type.city" },
  holy_place_574: { pt: "Lugar Santo", es: "Lugar Santo" },
  ashdod_101: { pt: "Asdode", es: "Asdod", typeKey: "place.type.city" },
  nineveh_899: { pt: "Nínive", es: "Nínive", typeKey: "place.type.city" },
  sinai_1098: { pt: "Sinai", es: "Sinaí", typeKey: "place.type.region" },
  amalek_53: { pt: "Amaleque", es: "Amalec", typeKey: "place.type.region" },
  asia_108: { pt: "Ásia", es: "Asia", typeKey: "place.type.region" },
  sheba_1067: { pt: "Sabá", es: "Sabá", typeKey: "place.type.region" },
  ramah_972: { pt: "Ramá", es: "Ramá", typeKey: "place.type.city" },
  "beth-shemesh_234": { pt: "Bete-Semes", es: "Bet-semes", typeKey: "place.type.city" },
  ephesus_400: { pt: "Éfeso", es: "Éfeso", typeKey: "place.type.city" },
  river_244: { pt: "Rio (Eufrates)", es: "Río (Éufrates)", typeKey: "place.type.region" },
  cush_312: { pt: "Cuxe", es: "Cus", typeKey: "place.type.region" },
  capernaum_274: { pt: "Cafarnaum", es: "Cafarnaún", typeKey: "place.type.city" },
  caesarea_266: { pt: "Cesareia", es: "Cesarea", typeKey: "place.type.city" },
  horeb_576: { pt: "Horebe", es: "Horeb" },
  eden_354: { pt: "Éden", es: "Edén", typeKey: "place.type.region" },
  kadesh_661: { pt: "Cades", es: "Cades" },
  keilah_681: { pt: "Queila", es: "Keila", typeKey: "place.type.city" },
  arabah_79: { pt: "Arabá", es: "Arabá" },
  libnah_728: { pt: "Libna", es: "Libna", typeKey: "place.type.city" },
  anathoth_63: { pt: "Anatote", es: "Anatot", typeKey: "place.type.city" },
  "kiriath-jearim_701": { pt: "Quiriate-Jearim", es: "Quiriat-Jearim", typeKey: "place.type.city" },
  gezer_463: { pt: "Gezer", es: "Guézer", typeKey: "place.type.city" },
  rabbah_966: { pt: "Rabá", es: "Rabá" },
  antioch_68: { pt: "Antioquia (Síria)", es: "Antioquía (Siria)", typeKey: "place.type.city" },
  geba_447: { pt: "Geba", es: "Gueba", typeKey: "place.type.city" },
  elam_365: { pt: "Elão", es: "Elam", typeKey: "place.type.region" },
  holy_place_575: { pt: "Lugar Santo", es: "Lugar Santo" },
  joppa_652: { pt: "Jope", es: "Jope", typeKey: "place.type.city" },
  tirzah_1170: { pt: "Tirza", es: "Tirsa", typeKey: "place.type.city" },
  mahanaim_756: { pt: "Maanaim", es: "Mahanaim", typeKey: "place.type.city" },
  ramah_975: { pt: "Ramá", es: "Ramá", typeKey: "place.type.city" },
  cyprus_316: { pt: "Chipre", es: "Chipre", typeKey: "place.type.island" },
  jazer_628: { pt: "Jazer", es: "Jazer", typeKey: "place.type.city" },
  most_holy_place_827: { pt: "Lugar Santíssimo", es: "Lugar Santísimo" },
  ammon_58: { pt: "Amom", es: "Amón" },
  ziklag_1259: { pt: "Ziclague", es: "Siclag", typeKey: "place.type.city" },
  arnon_92: { pt: "Arnom", es: "Arnón", typeKey: "place.type.water" },
  great_sea_493: { pt: "Mar Grande", es: "Mar Grande", typeKey: "place.type.water" },
  "jabesh-gilead_611": { pt: "Jabes-Gileade", es: "Jabes de Galaad", typeKey: "place.type.city" },
  megiddo_777: { pt: "Megido", es: "Meguido", typeKey: "place.type.city" },
  hazor_545: { pt: "Hazor", es: "Hazor", typeKey: "place.type.city" },
  mount_of_olives_861: { pt: "Monte das Oliveiras", es: "Monte de los Olivos", typeKey: "place.type.mountain" },
  riblah_1001: { pt: "Ribla", es: "Ribla", typeKey: "place.type.city" },
};

// ─── Helper functions ────────────────────────────────────────────────────────

/**
 * Translate a place slug to the localized name.
 * Falls back to `fallback` (typically `place.name` from the API).
 */
export function placeName(
  slug: string | null | undefined,
  locale: Locale,
  fallback?: string,
): string {
  if (!slug) return fallback ?? "";
  if (locale === "en") return fallback ?? slug;
  const entry = PLACES[slug];
  if (!entry) return fallback ?? slug;
  if (locale === "pt") return entry.pt;
  if (locale === "es") return entry.es;
  return fallback ?? slug;
}

/** Look up a place's curated type i18n key (city / mountain / water / etc.). */
export function placeTypeKey(slug: string | null | undefined): string | undefined {
  if (!slug) return undefined;
  return PLACES[slug]?.typeKey;
}

export function hasPlaceTranslation(slug: string | null | undefined): boolean {
  return !!slug && slug in PLACES;
}

/** Translate a list of place slugs into a comma-joined string. */
export function placeNamesJoin(
  slugs: string[] | undefined | null,
  locale: Locale,
  separator = ", ",
): string {
  if (!slugs || slugs.length === 0) return "";
  return slugs.map((s) => placeName(s, locale, s)).join(separator);
}

export { PLACES };
