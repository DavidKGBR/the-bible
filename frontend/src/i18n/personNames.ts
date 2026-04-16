/**
 * personNames.ts — translations for the top ~150 biblical people by verse
 * count (Theographic dataset). Slug-keyed so it matches `person.slug` and
 * navigation URLs across PeoplePage, TimelinePage, MapPage, WordStudyPage, etc.
 *
 * Pattern: one `PERSONS` record keyed by slug, each entry holds `pt` / `es`
 * names. Optional `occupationKey` points to an i18n key in en/pt/es.json for
 * the curated "Profeta e Legislador"-style short description.
 *
 * Fallback: when a slug is missing, `personName(slug, locale, fallback)`
 * returns the `fallback` (typically the EN name from the API). That keeps
 * long-tail entities visible in EN rather than hidden.
 *
 * Convention (see STYLE_GUIDE.md): consagrated biblical names in PT-BR
 * ("Moisés", "Davi", "Jacó") and ES-LATAM ("Moisés", "David", "Jacob").
 * Parenthetical clarifiers mirror the EN source ("Jacob (Israel)" →
 * "Jacó (Israel)").
 */

import type { Locale } from "./i18nContext";

export interface PersonEntry {
  pt: string;
  es: string;
  /** i18n key for a short occupation/role description (optional). */
  occupationKey?: string;
}

// ─── Core lookup table — top ~150 by verse count ─────────────────────────────

const PERSONS: Record<string, PersonEntry> = {
  // Deity
  god_1324: { pt: "Deus", es: "Dios" },
  jesus_905: { pt: "Jesus Cristo", es: "Jesucristo", occupationKey: "people.occupation.messiah" },
  holy_spirit_7400: { pt: "Espírito Santo", es: "Espíritu Santo" },

  // Patriarchs
  adam_78: { pt: "Adão", es: "Adán" },
  noah_2210: { pt: "Noé", es: "Noé" },
  shem_2613: { pt: "Sem", es: "Sem" },
  abraham_58: { pt: "Abraão", es: "Abraham", occupationKey: "people.occupation.patriarch" },
  sarah_2473: { pt: "Sara", es: "Sara" },
  isaac_616: { pt: "Isaque", es: "Isaac" },
  rebekah_2401: { pt: "Rebeca", es: "Rebeca" },
  israel_682: { pt: "Jacó (Israel)", es: "Jacob (Israel)" },
  rachel_2386: { pt: "Raquel", es: "Raquel" },
  leah_1813: { pt: "Lia", es: "Lea" },
  laban_1803: { pt: "Labão", es: "Labán" },
  esau_1216: { pt: "Esaú (Edom)", es: "Esaú (Edom)" },
  ishmael_631: { pt: "Ismael", es: "Ismael" },
  "ishmael_630": { pt: "Ismael (filho de Agar)", es: "Ismael (hijo de Agar)" },
  lot_1830: { pt: "Ló", es: "Lot" },
  cain_533: { pt: "Caim", es: "Caín" },

  // Twelve tribes (patriarchs)
  reuben_2429: { pt: "Rúben", es: "Rubén" },
  simeon_2741: { pt: "Simeão", es: "Simeón" },
  levi_1820: { pt: "Levi (patriarca)", es: "Leví (patriarca)" },
  judah_1751: { pt: "Judá (patriarca)", es: "Judá (patriarca)" },
  dan_973: { pt: "Dã", es: "Dan" },
  naphtali_2149: { pt: "Naftali", es: "Neftalí" },
  gad_1262: { pt: "Gade", es: "Gad" },
  asher_337: { pt: "Aser", es: "Aser" },
  issachar_645: { pt: "Issacar", es: "Isacar" },
  zebulun_3002: { pt: "Zebulom", es: "Zabulón" },
  joseph_1710: { pt: "José (filho de Jacó)", es: "José (hijo de Jacob)" },
  benjamin_463: { pt: "Benjamim (patriarca)", es: "Benjamín (patriarca)" },
  ephraim_1206: { pt: "Efraim", es: "Efraín" },
  manasseh_1928: { pt: "Manassés (filho de José)", es: "Manasés (hijo de José)" },

  // Exodus / Conquest
  moses_2108: { pt: "Moisés", es: "Moisés", occupationKey: "people.occupation.prophetLawgiver" },
  aaron_1: { pt: "Arão", es: "Aarón" },
  eleazar_1062: { pt: "Eleazar", es: "Eleazar" },
  ithamar_649: { pt: "Itamar", es: "Itamar" },
  joshua_1727: { pt: "Josué", es: "Josué" },
  caleb_537: { pt: "Calebe", es: "Caleb" },
  jethro_2431: { pt: "Jetro", es: "Jetro" },
  balaam_593: { pt: "Balaão", es: "Balaam" },
  balak_387: { pt: "Balaque", es: "Balac" },
  pharaoh_2331: { pt: "Faraó (do Êxodo)", es: "Faraón (del Éxodo)" },
  pharaoh_2329: { pt: "Faraó (de José)", es: "Faraón (de José)" },
  korah_1795: { pt: "Corá (levita)", es: "Coré (levita)" },
  merari_2004: { pt: "Merari", es: "Merari" },
  kohath_1790: { pt: "Coate", es: "Coat" },
  gershon_1305: { pt: "Gérson", es: "Gersón" },
  phinehas_2349: { pt: "Fineias (levita)", es: "Finees (levita)" },
  nun_2214: { pt: "Num", es: "Nun" },
  midian_2075: { pt: "Midiã", es: "Madián" },
  amalek_197: { pt: "Amaleque", es: "Amalec" },
  sihon_2739: { pt: "Seom", es: "Sehón" },
  og_2238: { pt: "Ogue", es: "Og" },
  canaan_914: { pt: "Canaã", es: "Canaán" },

  // Judges
  gideon_1314: { pt: "Gideão", es: "Gedeón" },
  samson_2468: { pt: "Sansão", es: "Sansón" },
  jephthah_839: { pt: "Jefté", es: "Jefté" },
  eli_1072: { pt: "Eli", es: "Elí" },
  samuel_2469: { pt: "Samuel", es: "Samuel" },

  // United / Divided Kingdom
  saul_2478: { pt: "Saul", es: "Saúl" },
  jonathan_1692: { pt: "Jônatas", es: "Jonatán" },
  david_994: { pt: "Davi", es: "David", occupationKey: "people.occupation.kingOfIsrael" },
  jesse_903: { pt: "Jessé", es: "Isaí" },
  solomon_2762: { pt: "Salomão", es: "Salomón" },
  absalom_59: { pt: "Absalão", es: "Absalón" },
  joab_1617: { pt: "Joabe", es: "Joab" },
  abner_57: { pt: "Abner", es: "Abner" },
  abiathar_20: { pt: "Abiatar", es: "Abiatar" },
  nathan_2153: { pt: "Natã", es: "Natán" },
  zadok_2973: { pt: "Zadoque", es: "Sadoc" },
  michal_2073: { pt: "Mical", es: "Mical" },
  abishai_50: { pt: "Abisai", es: "Abisai" },
  benaiah_439: { pt: "Benaia", es: "Benaía" },
  zeruiah_3055: { pt: "Zeruia", es: "Sarvia" },
  adonijah_97: { pt: "Adonias", es: "Adonías" },
  hiram_1532: { pt: "Hirão", es: "Hiram" },
  rehoboam_2412: { pt: "Roboão", es: "Roboam" },
  jeroboam_872: { pt: "Jeroboão", es: "Jeroboam" },
  nebat_2165: { pt: "Nebate", es: "Nabat" },

  // Kings of Judah / Israel
  asa_318: { pt: "Asa", es: "Asa" },
  abijah_38: { pt: "Abias", es: "Abías" },
  jehoshaphat_808: { pt: "Josafá", es: "Josafat" },
  jehoram_803: { pt: "Jeorão", es: "Joram" },
  joram_804: { pt: "Jorão", es: "Joram" },
  ahaziah_121: { pt: "Acazias", es: "Ocozías" },
  joash_1633: { pt: "Joás", es: "Joás" },
  joash_1632: { pt: "Joás", es: "Joás" },
  amaziah_214: { pt: "Amazias", es: "Amasías" },
  uzziah_375: { pt: "Uzias", es: "Uzías" },
  jotham_1735: { pt: "Jotão", es: "Jotam" },
  ahaz_118: { pt: "Acaz", es: "Acaz" },
  hezekiah_1512: { pt: "Ezequias", es: "Ezequías" },
  manasseh_1930: { pt: "Manassés (filho de Ezequias)", es: "Manasés (hijo de Ezequías)" },
  josiah_1730: { pt: "Josias", es: "Josías" },
  jehoiakim_1085: { pt: "Jeoaquim", es: "Joacim" },
  jehoiachin_791: { pt: "Joaquim", es: "Joaquín" },
  zedekiah_1950: { pt: "Zedequias", es: "Sedequías" },
  ahab_113: { pt: "Acabe", es: "Acab" },
  jezebel_1605: { pt: "Jezabel", es: "Jezabel" },
  jehu_817: { pt: "Jeú", es: "Jehú" },
  baasha_589: { pt: "Baasa", es: "Baasa" },
  ornan_289: { pt: "Ornã", es: "Ornán" },
  jehoiada_793: { pt: "Joiada", es: "Joiada" },
  jehoiada_792: { pt: "Joiada", es: "Joiada" },
  shaphan_2550: { pt: "Safã", es: "Safán" },
  hilkiah_1524: { pt: "Hilquias", es: "Hilcías" },
  gedaliah_1287: { pt: "Gedalias", es: "Gedalías" },
  ahikam_141: { pt: "Aicão", es: "Ahicam" },

  // Prophets
  elijah_1131: { pt: "Elias", es: "Elías", occupationKey: "people.occupation.prophet" },
  elisha_1153: { pt: "Eliseu", es: "Eliseo", occupationKey: "people.occupation.prophet" },
  isaiah_617: { pt: "Isaías", es: "Isaías", occupationKey: "people.occupation.prophet" },
  jeremiah_853: { pt: "Jeremias", es: "Jeremías", occupationKey: "people.occupation.prophet" },
  daniel_975: { pt: "Daniel", es: "Daniel", occupationKey: "people.occupation.prophet" },
  jonah_1689: { pt: "Jonas", es: "Jonás", occupationKey: "people.occupation.prophet" },
  micah_2049: { pt: "Miqueias", es: "Miqueas", occupationKey: "people.occupation.prophet" },
  micaiah_2054: { pt: "Micaías", es: "Micaías" },
  baruch_410: { pt: "Baruque", es: "Baruc" },
  ezra_1245: { pt: "Esdras", es: "Esdras" },
  zerubbabel_3054: { pt: "Zorobabel", es: "Zorobabel" },
  mordecai_2107: { pt: "Mardoqueu", es: "Mardoqueo" },
  esther_1343: { pt: "Ester", es: "Ester", occupationKey: "people.occupation.queenOfPersia" },
  ahasuerus_117: { pt: "Assuero", es: "Asuero" },
  haman_1360: { pt: "Hamã", es: "Amán" },
  job_1639: { pt: "Jó", es: "Job" },

  // Empires / foreign kings
  nebuchadnezzar_2167: { pt: "Nabucodonosor", es: "Nabucodonosor" },
  darius_978: { pt: "Dario", es: "Darío" },
  cyrus_968: { pt: "Ciro", es: "Ciro" },
  "ben-hadad_452": { pt: "Ben-Hadade", es: "Ben-Adad" },
  hazael_1463: { pt: "Hazael", es: "Hazael" },
  rabshakeh_2384: { pt: "Rabsaqué", es: "Rabsaces" },
  "nebuzar-adan_2169": { pt: "Nebuzaradã", es: "Nabuzaradán" },
  shadrach_1398: { pt: "Sadraque", es: "Sadrac" },
  meshach_2092: { pt: "Mesaque", es: "Mesac" },
  abednego_10: { pt: "Abednego", es: "Abed-nego" },

  // Early narrative
  moab_2103: { pt: "Moabe", es: "Moab" },
  baal_573: { pt: "Baal", es: "Baal" },
  satan_2476: { pt: "Satanás", es: "Satanás" },
  achish_66: { pt: "Aquis", es: "Aquis" },
  nabal_2126: { pt: "Nabal", es: "Nabal" },
  naboth_2127: { pt: "Nabote", es: "Nabot" },
  abimelech_41: { pt: "Abimeleque", es: "Abimelec" },
  abimelech_40: { pt: "Abimeleque (rei de Gerar)", es: "Abimelec (rey de Gerar)" },
  boaz_519: { pt: "Boaz", es: "Booz" },
  naomi_2147: { pt: "Noemi", es: "Noemí" },
  ruth_2450: { pt: "Rute", es: "Rut" },
  hadarezer_1340: { pt: "Hadadezer", es: "Hadad-ezer" },
  ahithophel_162: { pt: "Aitofel", es: "Ahitofel" },
  amnon_232: { pt: "Amnom", es: "Amnón" },
  sisera_2757: { pt: "Sísera (capitão do exército)", es: "Sísara (capitán del ejército)" },
  machir_1877: { pt: "Maquir", es: "Maquir" },
  shimei_2684: { pt: "Simei", es: "Simei" },
  jephunneh_840: { pt: "Jefoné", es: "Jefone" },
  nethaniah_2198: { pt: "Netanias", es: "Netanías" },
  uriah_2898: { pt: "Urias", es: "Urías" },

  // New Testament
  mary_1938: { pt: "Maria (Mãe de Jesus)", es: "María (Madre de Jesús)", occupationKey: "people.occupation.motherOfJesus" },
  joseph_1715: { pt: "José (esposo de Maria)", es: "José (esposo de María)" },
  john_1676: { pt: "João Batista", es: "Juan el Bautista" },
  peter_2745: { pt: "Simão Pedro", es: "Simón Pedro" },
  paul_2479: { pt: "Paulo", es: "Pablo", occupationKey: "people.occupation.apostle" },
  barnabas_1722: { pt: "Barnabé", es: "Bernabé" },
  silas_2740: { pt: "Silas", es: "Silas" },
  timotheus_2863: { pt: "Timóteo", es: "Timoteo" },
  john_1677: { pt: "João Apóstolo", es: "Juan el Apóstol" },
  james_717: { pt: "Tiago (filho de Zebedeu)", es: "Santiago (hijo de Zebedeo)" },
  judas_1760: { pt: "Judas Iscariotes", es: "Judas Iscariote" },
  pilate_2365: { pt: "Pôncio Pilatos", es: "Poncio Pilato" },
  herod_1505: { pt: "Herodes Antipas", es: "Herodes Antipas" },
  philip_2347: { pt: "Filipe, o Evangelista", es: "Felipe el Evangelista" },

  // Additional mid-tier & early-narrative fills
  asaph_330: { pt: "Asafe (levita)", es: "Asaf (levita)" },
  eve_1231: { pt: "Eva", es: "Eva" },
  abel_13: { pt: "Abel", es: "Abel" },
  enoch_368: { pt: "Enoque", es: "Enoc" },
  seth_2604: { pt: "Sete", es: "Set" },
  terah_2841: { pt: "Terá", es: "Taré" },
  nahor_2142: { pt: "Naor", es: "Nacor" },
  hagar_1330: { pt: "Agar", es: "Agar" },
};

// ─── Helper functions ────────────────────────────────────────────────────────

/**
 * Translate a person slug to the localized name.
 * Falls back to `fallback` (typically `person.name` from the API).
 */
export function personName(
  slug: string | null | undefined,
  locale: Locale,
  fallback?: string,
): string {
  if (!slug) return fallback ?? "";
  if (locale === "en") return fallback ?? slug;
  const entry = PERSONS[slug];
  if (!entry) return fallback ?? slug;
  if (locale === "pt") return entry.pt;
  if (locale === "es") return entry.es;
  return fallback ?? slug;
}

/**
 * Look up a person's curated occupation i18n key.
 * Returns `undefined` if this person has no short description.
 */
export function personOccupationKey(slug: string | null | undefined): string | undefined {
  if (!slug) return undefined;
  return PERSONS[slug]?.occupationKey;
}

/** Whether we have a translation for this slug (useful for conditional UI). */
export function hasPersonTranslation(slug: string | null | undefined): boolean {
  return !!slug && slug in PERSONS;
}

/**
 * Translate a list of participant slugs into a locale-aware comma-joined
 * string. Missing slugs fall back to the slug itself (last-resort).
 */
export function personNamesJoin(
  slugs: string[] | undefined | null,
  locale: Locale,
  separator = ", ",
): string {
  if (!slugs || slugs.length === 0) return "";
  return slugs.map((s) => personName(s, locale, s)).join(separator);
}

export { PERSONS };
