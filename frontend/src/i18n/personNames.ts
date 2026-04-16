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

  // ─── Coverage fill for canonical events (participants referenced by the
  // ~120 events translated in timelineEvents.ts) ─────────────────────────────

  // OT narrative
  ham_1359: { pt: "Cam", es: "Cam" },
  japheth_726: { pt: "Jafé", es: "Jafet" },
  nimrod_2206: { pt: "Nimrode", es: "Nimrod" },
  enoch_1192: { pt: "Enoque (pai de Matusalém)", es: "Enoc (padre de Matusalén)" },
  daughter_of_lot_older_985: { pt: "Filha mais velha de Ló", es: "Hija mayor de Lot" },
  daughter_of_lot_younger_984: { pt: "Filha mais nova de Ló", es: "Hija menor de Lot" },
  pharaoh_2328: { pt: "Faraó (na jornada de Abraão)", es: "Faraón (en el viaje de Abraham)" },

  // Judges
  othniel_2259: { pt: "Otniel", es: "Otoniel" },
  "chushan-rishathaim_944": { pt: "Cusã-Risataim", es: "Cusán-Risataim" },
  eglon_1037: { pt: "Eglom", es: "Eglón" },
  ehud_1039: { pt: "Eúde", es: "Aod" },
  jabin_677: { pt: "Jabim (rei de Hazor)", es: "Jabín (rey de Hazor)" },
  barak_401: { pt: "Baraque", es: "Barac" },
  deborah_997: { pt: "Débora", es: "Débora" },
  tola_2879: { pt: "Tola", es: "Tola" },
  jair_709: { pt: "Jair", es: "Jair" },
  ibzan_1588: { pt: "Ibsã", es: "Ibzán" },
  elon_1184: { pt: "Elom", es: "Elón" },
  abdon_10: { pt: "Abdom", es: "Abdón" },

  // Monarchs/narrative additions
  goliath_1327: { pt: "Golias", es: "Goliat" },

  // Minor prophets & scribes
  obadiah_2226: { pt: "Obadias", es: "Abdías" },
  joel_1660: { pt: "Joel", es: "Joel" },
  amos_238: { pt: "Amós", es: "Amós" },
  hosea_1555: { pt: "Oseias", es: "Oseas" },
  micah_2053: { pt: "Miqueias", es: "Miqueas" },
  nahum_2145: { pt: "Naum", es: "Nahúm" },
  habakkuk_1334: { pt: "Habacuque", es: "Habacuc" },
  zephaniah_3040: { pt: "Sofonias", es: "Sofonías" },
  haggai_1349: { pt: "Ageu", es: "Hageo" },
  zechariah_3016: { pt: "Zacarias", es: "Zacarías" },
  malachi_1899: { pt: "Malaquias", es: "Malaquías" },
  ezekiel_1237: { pt: "Ezequiel", es: "Ezequiel" },

  // NT — birth narrative & twelve apostles
  elisabeth_1152: { pt: "Isabel", es: "Isabel" },
  zacharias_2971: { pt: "Zacarias (pai de João Batista)", es: "Zacarías (padre de Juan el Bautista)" },
  simeon_2744: { pt: "Simeão (profeta)", es: "Simeón (profeta)" },
  andrew_264: { pt: "André", es: "Andrés" },
  james_718: { pt: "Tiago (filho de Alfeu)", es: "Santiago (hijo de Alfeo)" },
  james_719: { pt: "Tiago (irmão de Jesus)", es: "Santiago (hermano de Jesús)" },
  philip_2344: { pt: "Filipe, o Apóstolo", es: "Felipe el Apóstol" },
  bartholomew_405: { pt: "Bartolomeu", es: "Bartolomé" },
  matthew_1971: { pt: "Mateus", es: "Mateo" },
  thomas_2851: { pt: "Tomé", es: "Tomás" },
  alphaeus_192: { pt: "Alfeu", es: "Alfeo" },
  lebbaeus_1815: { pt: "Lebeu Tadeu", es: "Lebeo Tadeo" },
  simon_2746: { pt: "Simão Zelote", es: "Simón Zelote" },
  mother_of_zebedees_children_2112: { pt: "Mãe dos filhos de Zebedeu", es: "Madre de los hijos de Zebedeo" },

  // NT — gospels / passion
  nicodemus_2204: { pt: "Nicodemos", es: "Nicodemo" },
  lazarus_1812: { pt: "Lázaro", es: "Lázaro" },
  mary_1939: { pt: "Maria (irmã de Lázaro)", es: "María (hermana de Lázaro)" },
  mary_1940: { pt: "Maria (mulher de Cléopas)", es: "María (mujer de Cleofas)" },
  mary_1943: { pt: "Maria Madalena", es: "María Magdalena" },
  salome_2464: { pt: "Salomé", es: "Salomé" },
  barabbas_399: { pt: "Barrabás", es: "Barrabás" },
  caiaphas_532: { pt: "Caifás", es: "Caifás" },
  annas_269: { pt: "Anás", es: "Anás" },
  john_1678: { pt: "João (parente do sumo sacerdote)", es: "Juan (pariente del sumo sacerdote)" },
  joseph_1716: { pt: "José de Arimateia", es: "José de Arimatea" },
  simon_2749: { pt: "Simão (Cireneu/outros)", es: "Simón (Cireneo/otros)" },
  simon_2753: { pt: "Simão, o curtidor", es: "Simón el curtidor" },

  // NT — Herod family
  herod_1504: { pt: "Herodes (o Grande)", es: "Herodes (el Grande)" },
  herod_1506: { pt: "Herodes Agripa I", es: "Herodes Agripa I" },

  // Acts — apostolic era
  matthias_1972: { pt: "Matias", es: "Matías" },
  stephen_2802: { pt: "Estêvão", es: "Esteban" },
  ananias_258: { pt: "Ananias (marido de Safira)", es: "Ananías (marido de Safira)" },
  sapphira_2472: { pt: "Safira", es: "Safira" },
  nicanor_2203: { pt: "Nicanor", es: "Nicanor" },
  prochorus_2371: { pt: "Prócoro", es: "Prócoro" },
  timon_2862: { pt: "Timão", es: "Timón" },
  parmenas_2272: { pt: "Parmenas", es: "Pármenas" },
  nicolas_2205: { pt: "Nicolau", es: "Nicolás" },
  ananias_259: { pt: "Ananias (discípulo de Damasco)", es: "Ananías (discípulo de Damasco)" },
  cornelius_956: { pt: "Cornélio", es: "Cornelio" },
  candace_916: { pt: "Candace", es: "Candace" },
  simon_2752: { pt: "Simão, o mágico", es: "Simón el mago" },
  rhoda_2439: { pt: "Rode", es: "Rode" },
  mary_1941: { pt: "Maria (mãe de João Marcos)", es: "María (madre de Juan Marcos)" },
  mark_1679: { pt: "João Marcos", es: "Juan Marcos" },
  agabus_107: { pt: "Ágabo", es: "Ágabo" },
  manaen_1926: { pt: "Manaém", es: "Manaén" },
  lucius_1833: { pt: "Lúcio", es: "Lucio" },
  barsabas_1720: { pt: "Barsabás Justo", es: "Barsabás Justo" },
  judas_1759: { pt: "Judas Barsabás", es: "Judas Barsabás" },
  jason_742: { pt: "Jasom", es: "Jasón" },

  // Paul's journeys — companions & encounters
  luke_1836: { pt: "Lucas", es: "Lucas" },
  aquila_279: { pt: "Áquila", es: "Aquila" },
  priscilla_2370: { pt: "Priscila", es: "Priscila" },
  lydia_1837: { pt: "Lídia", es: "Lidia" },
  dionysius_1013: { pt: "Dionísio", es: "Dionisio" },
  damaris_972: { pt: "Dâmaris", es: "Dámaris" },
  demas_1006: { pt: "Demas", es: "Demas" },
  demetrius_1007: { pt: "Demétrio", es: "Demetrio" },
  alexander_187: { pt: "Alexandre (filho de Simão)", es: "Alejandro (hijo de Simón)" },
  alexander_188: { pt: "Alexandre (judeu de Éfeso)", es: "Alejandro (judío de Éfeso)" },
  aristarchus_306: { pt: "Aristarco", es: "Aristarco" },
  trophimus_2880: { pt: "Trófimo", es: "Trófimo" },
  epaphras_1195: { pt: "Epafras", es: "Epafras" },
  gaius_1269: { pt: "Gaio (da Macedônia)", es: "Gayo (de Macedonia)" },
  julius_1763: { pt: "Júlio", es: "Julio" },
  publius_2374: { pt: "Públio", es: "Publio" },
  portius_2367: { pt: "Pórcio Festo", es: "Porcio Festo" },
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
