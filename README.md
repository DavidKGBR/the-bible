<h1 align="center">Verbum</h1>

<p align="center">
  <strong>The first free, open-source Bible study platform that rivals Logos ($400+) — combining academic tools, geography, AI analysis, and devotional content in one app.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.10%20|%203.11%20|%203.12-blue?logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/DuckDB-1.1+-yellow?logo=duckdb" alt="DuckDB">
  <img src="https://img.shields.io/badge/Gemini-AI-8E75B2?logo=google&logoColor=white" alt="Gemini">
  <img src="https://img.shields.io/badge/i18n-EN%20|%20PT%20|%20ES-ff69b4" alt="i18n">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

<p align="center">
  <a href="#-what-you-get">What you get</a> •
  <a href="#-features-at-a-glance">Features</a> •
  <a href="#-quick-start">Quick start</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-testing--quality">Testing</a>
</p>

---

## What you get

A complete Bible study ecosystem — ETL pipeline, REST API, React reader, and AI insights:

| Metric | Count |
|--------|-------|
| **Verses** | 302,503 across 10 translations in 5 languages |
| **Cross-references** | 344,754 (OpenBible.info) |
| **Strong's entries** | 14,870 (Hebrew + Greek lexicon) |
| **Interlinear words** | 800K+ (TAGNT + TAHOT via STEPBible) |
| **Biblical people** | 3,000+ with family trees and timelines |
| **Biblical places** | 1,600+ with coordinates and events |
| **Topical index** | 20,000+ topics (Nave's Topical Bible) |
| **API endpoints** | 82 across 22 routers |
| **Frontend pages** | 26 interactive surfaces |
| **Test cases** | 385 (pytest) |
| **Languages (UI)** | English, Portuguese, Spanish |

### Translations

| Language | Translations |
|----------|-------------|
| English | KJV, BBE, ASV, WEB, DARBY |
| Portuguese | NVI, RA, ACF |
| Spanish | RVR |
| French | APEE |

---

## Features at a glance

### Reading & Study
| Feature | Route | Description |
|---------|-------|-------------|
| **Reader** | `/reader` | Three modes: single, parallel (2 translations), immersive (3D book spread with page flip) |
| **Search** | `/search` | Full-text search with keyword pills, sentiment badges, popular verses |
| **Bookmarks** | `/bookmarks` | Local bookmarks with seeded suggestions |
| **Notes** | `/notes` | Personal study notes (localStorage) |
| **Reading Plans** | `/plans` | Multi-day reading plans with progress tracking |
| **Compare** | `/compare` | Synoptic parallel viewer (Last Supper, Beatitudes, etc.) with custom passages |
| **Dictionary** | `/dictionary` | Easton's + Smith's Bible Dictionary, 7,000+ entries |

### Languages & Interlinear
| Feature | Route | Description |
|---------|-------|-------------|
| **Word Study** | `/word-study/:id` | Strong's concordance + interlinear view + word journey across eras |
| **Semantic Graph** | `/semantic-graph` | D3 force-directed graph of word co-occurrences |
| **Translation Divergence** | — | Side-by-side comparison of how translations render the same Greek/Hebrew word |

### People, Places & Geography
| Feature | Route | Description |
|---------|-------|-------------|
| **Authors** | `/authors` | 40 biblical authors with literary style and vocab fingerprints |
| **People** | `/people` | 3,000+ biblical persons — search, filter by gender/tribe/book, family trees |
| **Places** | `/places` | 1,600+ locations with coordinates, events, and type filters |
| **Map** | `/map` | Interactive Leaflet map with era filters and journey routes (Paul's journeys, Exodus) |
| **Timeline** | `/timeline` | Cross-referenced biblical + secular events on a zoomable D3 timeline |

### Topics & Devotional
| Feature | Route | Description |
|---------|-------|-------------|
| **Topics** | `/topics` | 20,000+ Nave's topics — search-first UI with popular chips |
| **Devotional** | `/devotional` | Thematic reading plans (Names of God, Forgiveness, etc.) with verse text |

### AI & Deep Analysis
| Feature | Route | Description |
|---------|-------|-------------|
| **AI Explain** | (in Reader) | Google Gemini per-verse explanations in EN/PT, cached on disk |
| **Deep Analytics** | `/deep-analytics` | Hapax legomena, vocabulary richness, lexical density heatmaps |
| **Intertextuality** | `/intertextuality` | OT→NT citation heatmap + quotation graph |
| **Open Questions** | `/open-questions` | 15 curated scholarly debates with multiple perspectives |
| **Semantic Threads** | `/threads` | Auto-discovered thematic threads spanning distant books |
| **Literary Structure** | `/structure` | Chiasms, parallelisms, inclusio across 10+ passages |

### Community & Polish
| Feature | Route | Description |
|---------|-------|-------------|
| **Emotional Landscape** | `/emotional` | Per-verse sentiment flow charts + book emotional profiles |
| **Community Notes** | `/community` | Curated scholarly observations per verse, searchable |
| **Arc Diagram** | `/arc-diagram` | 344K cross-refs as canvas arcs at 60fps, click to explore |
| **i18n** | (sidebar) | Flag selector for EN/PT/ES, auto-detects browser language |
| **Commentary** | (in Reader) | 6 external commentaries via HelloAO (Matthew Henry, John Gill, etc.) |
| **Streak** | (sidebar) | Reading streak tracker with daily badge |

---

## Quick start

### 1. Install

```bash
git clone https://github.com/DavidKGBR/verbum.git
cd verbum
pip install -e ".[all]"
cd frontend && npm install && cd ..
cp .env.example .env          # fill in ABIBLIA_DIGITAL_TOKEN, GEMINI_API_KEY (optional)
```

### 2. Run the pipeline

```bash
# All 10 translations + cross-refs (cached runs ~2 min; first fetch longer)
python -m src.cli run --translations kjv,nvi,bbe,ra,acf,rvr,apee,asv,web,darby

# Single translation, specific books
python -m src.cli run --books "GEN,PSA,JHN" --translations kjv

# Extract Strong's, interlinear, people, places, topics
python -m src.cli extract-strongs
python -m src.cli extract-interlinear
python -m src.cli extract-theographic
python -m src.cli extract-geocoding
python -m src.cli extract-naves

# See what got loaded
python -m src.cli info
```

### 3. Start the services

```bash
# Backend (FastAPI) — http://localhost:8000 · docs at /docs
PYTHONIOENCODING=utf-8 python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (Vite) — http://localhost:5173 (proxies /api to :8000)
cd frontend && npm run dev
```

---

## Architecture

```
┌──────────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────────┐
│     EXTRACT      │───▶│  TRANSFORM   │───▶│    LOAD     │───▶│      SERVE       │
├──────────────────┤    ├──────────────┤    ├─────────────┤    ├──────────────────┤
│ bible-api.com    │    │ Clean + HTML │    │ DuckDB      │    │ FastAPI (82 API) │
│ abibliadigital   │    │ TextBlob NLP │    │ 15+ tables  │    │ React 19 SPA     │
│ STEPBible TAGNT  │    │ Dedup + KJV  │    │ 344K xrefs  │    │ 26 pages         │
│ Theographic      │    │ annotations  │    │ 800K interl. │    │ Gemini AI        │
│ OpenBible refs   │    │ Sentiment    │    │ 14K Strong's │    │ i18n (EN/PT/ES)  │
│ Nave's Topical   │    │ enrichment   │    │             │    │                  │
│ OpenBible Geo    │    │              │    │             │    │                  │
└──────────────────┘    └──────────────┘    └─────────────┘    └──────────────────┘
```

### Tech stack

| Layer | Stack |
|-------|-------|
| **Extract** | `httpx`, per-translation JSON cache, STEPBible parsers, Theographic, Nave's |
| **Transform** | `pandas`, `textblob`, `html.unescape`, KJV annotation stripper, sentiment enrichment |
| **Load** | `duckdb` (analytical views, parameterised inserts, 15+ tables) |
| **API** | `fastapi`, `pydantic v2`, `typer` CLI, 22 routers, 82 endpoints |
| **Frontend** | `react 19`, `vite 6`, `typescript`, `tailwind v4`, `d3`, `leaflet`, `react-router` |
| **AI** | `google-generativeai` (Gemini 2.0 Flash), disk cache with rate limiting |
| **i18n** | React Context + `useI18n()` hook, 3 languages, localStorage persistence |
| **Quality** | `ruff`, `mypy`, `pytest` (385 tests), `tsc --noEmit` |

### Source layout

```
src/
  cli.py                  # Typer: run, info, extract-*, query
  pipeline.py             # BiblePipeline orchestrator
  config.py               # Dataclass config + env overrides
  extract/
    bible_sources.py      # BibleSource ABC + 2 implementations
    translations.py       # 10 translations registry
    crossref_extractor.py # OpenBible 344K cross-refs
    strongs_extractor.py  # 14,870 Strong's entries
    stepbible_extractor.py # TAGNT + TAHOT interlinear
    theographic_extractor.py # 3K people, 1.6K places, 4K events
    openbible_geocoding.py # lat/long for places
    naves_extractor.py    # 20K topics
    morphhb_extractor.py  # Hebrew morphology
    sblgnt_extractor.py   # Greek NT text
    dictionary_extractor.py # Easton's + Smith's
  transform/
    cleaning.py           # normalize, dedup, validate
    enrichment.py         # sentiment + metrics + aggregates
    kjv_annotations.py    # strip {annotations}
    multilang_aligner.py  # align verses across translations
    crossref_mapper.py    # map cross-refs to verse IDs
  load/
    duckdb_loader.py      # schema, views, 15+ tables
    gcs_loader.py         # optional GCS + BigQuery
  api/
    main.py               # FastAPI app + CORS + 22 routers
    dependencies.py       # per-request DuckDB connection
    routers/              # 22 router modules (see API Reference)
  ai/
    gemini_client.py      # rate-limited + cached
    passage_explainer.py  # prompts for explain + compare
  models/
    schemas.py            # Pydantic v2: RawVerse, EnrichedVerse, etc.
    theographic.py        # BiblicalPerson, BiblicalPlace, etc.

frontend/src/
  App.tsx                 # 26 routes
  main.tsx                # BrowserRouter + I18nProvider
  i18n/                   # i18nContext.tsx + en/pt/es.json
  pages/                  # 26 page components
  components/             # BibleReader, ParallelView, ImmersiveReader/,
                          # ArcDiagram/, VerseActions, FamilyTree, etc.
  hooks/                  # useArcData, useBookmarks, useReadingHistory, etc.
  services/api.ts         # typed fetch wrappers for all 82 endpoints

data/static/              # Curated JSON: authors, plans, questions, structures, etc.
tests/                    # 32 test files, 385 test cases
```

---

## API Reference

Full OpenAPI docs at `http://localhost:8000/docs`. Summary of all 22 routers:

| Router | Endpoints | Description |
|--------|-----------|-------------|
| **books** | 5 | Book list, chapters, verses, random verse, translations |
| **reader** | 2 | Chapter page (with `text_clean` for KJV), parallel view |
| **search** | 1 | Full-text search with translation/book filters |
| **analytics** | 3 | Sentiment by group, translation stats, heatmap |
| **crossrefs** | 5 | Arcs, between books, per-verse, counts, network |
| **ai_insights** | 2 | Gemini explain + compare |
| **lexicon** | 8 | Strong's lookup, interlinear chapter, word distribution, journey |
| **semantic** | 3 | Co-occurrence graph, divergence analysis |
| **authors** | 2 | Author list, detail with vocab stats |
| **people** | 4 | People search, detail, family tree, by book |
| **places** | 4 | Place search, detail, types, GeoJSON |
| **timeline** | 3 | Biblical events, secular events, combined |
| **compare** | 3 | Synoptic presets, custom parallel, diff |
| **topics** | 4 | Topic search, popular, detail with verse text |
| **devotional** | 3 | Plans list, plan detail, day reading |
| **deep_analytics** | 4 | Hapax, fingerprint, density, vocabulary richness |
| **intertextuality** | 3 | OT→NT quotations, heatmap, citation chain |
| **open_questions** | 3 | Questions list, detail, for-verse |
| **threads** | 3 | Thread list, detail, discover by tag |
| **structure** | 4 | All structures, by book, by chapter, chiasms |
| **emotional** | 3 | Sentiment landscape, peaks, book profiles |
| **community** | 3 | Notes by verse, recent notes, stats |

---

## Testing & quality

```bash
make test            # fast tests (excludes @slow, @integration)
make test-all        # full suite (385 tests) with coverage HTML
make lint            # ruff check
make typecheck       # mypy
make quality         # lint + typecheck + test

# Frontend
cd frontend && npx tsc --noEmit    # TypeScript strict check
cd frontend && npm run build       # production build
```

### Test coverage

- **32 test files** covering all API routers, extractors, transforms, and loaders
- **385 test cases** with parameterised fixtures and seeded DuckDB
- Backend routers for all Fase 0-4 features have dedicated test suites
- Markers: `@pytest.mark.integration`, `@pytest.mark.slow`

---

## Data sources & credits

| Source | Data | License |
|--------|------|---------|
| [bible-api.com](https://bible-api.com) | KJV, BBE, ASV, WEB, DARBY text | Public domain |
| [abibliadigital.com.br](https://www.abibliadigital.com.br) | NVI, RA, ACF, RVR, APEE text | Public domain |
| [OpenBible.info](https://www.openbible.info/labs/cross-references/) | 344K cross-references | CC-BY |
| [STEPBible](https://github.com/STEPBible/STEPBible-Data) | TAGNT + TAHOT interlinear | CC-BY |
| [Theographic](https://github.com/robertrouse/theographic-bible-metadata) | People, places, events | CC-BY-SA 4.0 |
| [OpenBible Geocoding](https://github.com/openbibleinfo/Bible-Geocoding-Data) | 1,300+ lat/long coordinates | CC-BY |
| Nave's Topical Bible | 20,000+ topics | Public domain |
| Easton's + Smith's Dictionaries | 7,000+ entries | Public domain |
| [HelloAO](https://bible.helloao.org) | Commentary API | Open |
| [TextBlob](https://textblob.readthedocs.io/) | NLP sentiment analysis | MIT |
| [DuckDB](https://duckdb.org/) | Analytical database | MIT |
| [Google Gemini](https://ai.google.dev/) | AI explanations | API terms |

---

## Development roadmap

### Completed

- **v1.0** — Pipeline + Streamlit dashboard
- **v2.0** — FastAPI + React reader (single/parallel/immersive) + arc diagram + search + bookmarks
- **v3.0** — Strong's concordance + interlinear + semantic graph + dictionary + commentary + word study
- **v4.0** — 17 new features across 4 phases:
  - Fase 0+1: Infrastructure extractors + geography & people (authors, people, places, map, timeline)
  - Fase 2: Advanced study (compare, topics, devotional)
  - Fase 3: AI analysis (word journey, hapax, intertextuality, open questions, threads, literary structure)
  - Fase 4: Community & polish (emotional landscape, i18n, community notes)

### Future

- Cloud deployment (GCP Cloud Run + BigQuery + Terraform)
- Three.js 3D emotional terrain visualization
- User accounts + community note submissions
- Mobile PWA optimization
- More translations and languages

---

## Contributing

1. Fork, branch (`git checkout -b feature/something`)
2. `make quality` locally
3. Commit with Conventional style (`feat:`, `fix:`, `docs:`)
4. PR against `main`

---

## License

MIT — see [LICENSE](LICENSE).

<p align="center"><strong>Built one sprint at a time with Claude Code</strong></p>
