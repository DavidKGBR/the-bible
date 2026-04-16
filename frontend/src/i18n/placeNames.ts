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

  // ─── Coverage fill for canonical events (locations referenced by the
  // ~120 events translated in timelineEvents.ts) ────────────────────────────

  // Primeval / Patriarchs
  nod_902: { pt: "Node", es: "Nod", typeKey: "place.type.region" },
  ararat_86: { pt: "Ararate", es: "Ararat", typeKey: "place.type.mountain" },
  babel_150: { pt: "Babel", es: "Babel", typeKey: "place.type.city" },
  shinar_1084: { pt: "Sinar", es: "Sinar", typeKey: "place.type.region" },
  accad_14: { pt: "Acade", es: "Acad", typeKey: "place.type.city" },
  erech_407: { pt: "Ereque", es: "Erec", typeKey: "place.type.city" },
  calneh_269: { pt: "Calné", es: "Calne", typeKey: "place.type.city" },
  calah_268: { pt: "Calá", es: "Cala", typeKey: "place.type.city" },
  resen_997: { pt: "Resém", es: "Resén", typeKey: "place.type.city" },
  "rehoboth-ir_992": { pt: "Reobote", es: "Rehobot", typeKey: "place.type.city" },
  haran_527: { pt: "Harã", es: "Harán", typeKey: "place.type.city" },
  moreh_817: { pt: "Moré (Siquém)", es: "Moré (Siquem)" },
  mesopotamia_790: { pt: "Mesopotâmia", es: "Mesopotamia", typeKey: "place.type.region" },
  ephrath_403: { pt: "Efrata", es: "Efrata", typeKey: "place.type.city" },
  plain_of_jordan_654: { pt: "Planície do Jordão", es: "Llanura del Jordán", typeKey: "place.type.region" },

  // Exodus / Wilderness
  etham_417: { pt: "Etã", es: "Etam", typeKey: "place.type.city" },
  migdol_799: { pt: "Migdol", es: "Migdol", typeKey: "place.type.city" },
  "baal-zephon_149": { pt: "Baal-Zefom", es: "Baal-zefón", typeKey: "place.type.city" },
  "pi-hahiroth_948": { pt: "Pi-Hairote", es: "Pi-hahirot", typeKey: "place.type.city" },
  succoth_1114: { pt: "Sucote", es: "Sucot", typeKey: "place.type.city" },
  elim_369: { pt: "Elim", es: "Elim", typeKey: "place.type.city" },
  marah_765: { pt: "Mara", es: "Mara", typeKey: "place.type.city" },
  massah_771: { pt: "Massá", es: "Masa", typeKey: "place.type.city" },
  meribah_783: { pt: "Meribá (de Horebe)", es: "Meriba (de Horeb)", typeKey: "place.type.city" },
  rephidim_996: { pt: "Refidim", es: "Refidim", typeKey: "place.type.city" },
  shur_1090: { pt: "Sur", es: "Shur", typeKey: "place.type.region" },
  sin_1097: { pt: "Sim", es: "Sin", typeKey: "place.type.region" },

  // NT — Galilee ministry & Judea
  cana_271: { pt: "Caná", es: "Caná", typeKey: "place.type.city" },
  bethany_186: { pt: "Betânia", es: "Betania", typeKey: "place.type.city" },
  bethsaida_231: { pt: "Betsaida", es: "Betsaida", typeKey: "place.type.city" },
  caesarea_philippi_267: { pt: "Cesareia de Filipe", es: "Cesarea de Filipo", typeKey: "place.type.city" },
  decapolis_328: { pt: "Decápolis", es: "Decápolis", typeKey: "place.type.region" },
  mount_hermon_841: { pt: "Monte Hermom", es: "Monte Hermón", typeKey: "place.type.mountain" },
  sea_of_galilee_1032: { pt: "Mar da Galileia", es: "Mar de Galilea", typeKey: "place.type.water" },
  sychar_1119: { pt: "Sicar", es: "Sicar", typeKey: "place.type.city" },
  gethsemane_462: { pt: "Getsêmani", es: "Getsemaní", typeKey: "place.type.city" },
  golgotha_487: { pt: "Gólgota", es: "Gólgota", typeKey: "place.type.city" },
  olivet_907: { pt: "Monte das Oliveiras", es: "Monte de los Olivos", typeKey: "place.type.mountain" },
  mount_of_olives_828: { pt: "Monte das Oliveiras", es: "Monte de los Olivos", typeKey: "place.type.mountain" },
  beautiful_gate_163: { pt: "Porta Formosa", es: "Puerta la Hermosa" },
  straight_1112: { pt: "Rua Direita", es: "Calle Derecha" },

  // Paul's missionary journeys — Asia Minor & Greece
  antioch_69: { pt: "Antioquia da Pisídia", es: "Antioquía de Pisidia", typeKey: "place.type.city" },
  pisidia_952: { pt: "Pisídia", es: "Pisidia", typeKey: "place.type.region" },
  iconium_590: { pt: "Icônio", es: "Iconio", typeKey: "place.type.city" },
  lystra_742: { pt: "Listra", es: "Listra", typeKey: "place.type.city" },
  derbe_330: { pt: "Derbe", es: "Derbe", typeKey: "place.type.city" },
  perga_936: { pt: "Perge", es: "Perge", typeKey: "place.type.city" },
  pamphylia_918: { pt: "Panfília", es: "Panfilia", typeKey: "place.type.region" },
  attalia_120: { pt: "Atália", es: "Atalia", typeKey: "place.type.city" },
  cilicia_300: { pt: "Cilícia", es: "Cilicia", typeKey: "place.type.region" },
  tarsus_1140: { pt: "Tarso", es: "Tarso", typeKey: "place.type.city" },
  salamis_1016: { pt: "Salamina", es: "Salamina", typeKey: "place.type.city" },
  paphos_919: { pt: "Pafos", es: "Pafos", typeKey: "place.type.city" },
  seleucia_1045: { pt: "Selêucia", es: "Seleucia", typeKey: "place.type.city" },
  troas_1182: { pt: "Trôade", es: "Troas", typeKey: "place.type.city" },
  samothrace_1025: { pt: "Samotrácia", es: "Samotracia", typeKey: "place.type.island" },
  neapolis_880: { pt: "Neápolis", es: "Neápolis", typeKey: "place.type.city" },
  philippi_942: { pt: "Filipos", es: "Filipos", typeKey: "place.type.city" },
  thessalonica_1158: { pt: "Tessalônica", es: "Tesalónica", typeKey: "place.type.city" },
  athens_118: { pt: "Atenas", es: "Atenas", typeKey: "place.type.city" },
  areopagus_87: { pt: "Areópago", es: "Areópago" },

  // Paul's journey to Rome
  myra_864: { pt: "Mira", es: "Mira", typeKey: "place.type.city" },
  lycia_740: { pt: "Lícia", es: "Licia", typeKey: "place.type.region" },
  cnidus_304: { pt: "Cnido", es: "Cnido", typeKey: "place.type.city" },
  crete_310: { pt: "Creta", es: "Creta", typeKey: "place.type.island" },
  salmone_1020: { pt: "Salmona", es: "Salmón", typeKey: "place.type.city" },
  fair_havens_424: { pt: "Bons Portos", es: "Buenos Puertos", typeKey: "place.type.city" },
  lasea_717: { pt: "Laseia", es: "Lasea", typeKey: "place.type.city" },
  phenice_945: { pt: "Fenice", es: "Fenice", typeKey: "place.type.city" },
  clauda_280: { pt: "Clauda", es: "Clauda", typeKey: "place.type.island" },
  syrtis_1123: { pt: "Sirte", es: "Sirte", typeKey: "place.type.water" },
  adria_30: { pt: "Adriático", es: "Adriático", typeKey: "place.type.water" },
  melita_761: { pt: "Malta (Melita)", es: "Malta (Melita)", typeKey: "place.type.island" },
  adramyttium_29: { pt: "Adramítio", es: "Adramitio", typeKey: "place.type.city" },
  syracuse_1121: { pt: "Siracusa", es: "Siracusa", typeKey: "place.type.city" },
  rhegium_999: { pt: "Régio", es: "Regio", typeKey: "place.type.city" },
  puteoli_963: { pt: "Putéoli", es: "Puteoli", typeKey: "place.type.city" },
  italy_601: { pt: "Itália", es: "Italia", typeKey: "place.type.region" },
  rome_1013: { pt: "Roma", es: "Roma", typeKey: "place.type.city" },
  appii_forum_427: { pt: "Fórum de Ápio", es: "Foro de Apio" },
  three_taverns_1159: { pt: "Três Tabernas", es: "Tres Tabernas" },
  alexandria_46: { pt: "Alexandria", es: "Alejandría", typeKey: "place.type.city" },
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
