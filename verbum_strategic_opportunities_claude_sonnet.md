# 🏛️ Verbum — Report de Oportunidades & Análise Estratégica 2026

> **Arquiteto:** Antigravity (Google DeepMind) | **Stack Base:** FastAPI + DuckDB (Python) + React/TypeScript
> **Data:** Abril 2026 | **Versão:** 1.0

---

## Sumário Executivo

O Verbum está em posição privilegiada para se tornar o primeiro estudo bíblico *verdadeiramente* local-first do mercado. A combinação de DuckDB no backend com React no frontend cria uma base ideal para migrar progressivamente a computação dos dados para o dispositivo do usuário, eliminando dependências de servidor para o módulo de estudo, tornando a experiência totalmente offline e gratuita.

As 5 frentes mapeadas abaixo não são hipótese — são tecnologias validadas em produção em 2026, com ecosistemas ativos. Este relatório define o *como* técnico para cada uma.

---

## Frente 1 — PWA & Arquitetura Local-First Real

### 🎯 Oportunidade

**Status da tecnologia (2026):** `MADURA ✅`

DuckDB-WASM + OPFS é a combinação definitiva para colocar um banco de dados analítico com poder de SQL completo *inside* o navegador, com persistência real entre sessões. O YouVersion (o concorrente direto) ainda opera com modelo server-dependente para dados bíblicos. O Verbum pode ser o primeiro a servir textos em Grego/Hebraico, Strong's e interlinear **completamente do dispositivo do usuário**.

> [!IMPORTANT]
> **OPFS (Origin Private File System)** não é `localStorage`. É uma API de sistema de arquivos de alta performance do W3C, disponível em todos os navegadores modernos (Chrome 86+, Firefox 111+, Safari 15.2+). DuckDB pode montar um arquivo `.db` *diretamente* dentro do OPFS, com persistência total entre sessões.

### 📐 Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────┐
│                    PWA (React + Vite)                        │
├────────────────────┬────────────────────────────────────────┤
│   UI Layer         │   Web Worker (Dedicated)                │
│  (React Components)│  ┌──────────────────────────────────┐  │
│                    │  │  AsyncDuckDB (WASM)               │  │
│   useDuckDB()      │  │  ──────────────────               │  │
│   (custom hook)    │◄─┤  OPFS: verbum.db                  │  │
│                    │  │  ┌─────────────────────────────┐  │  │
│                    │  │  │ bible_verses        (~80MB) │  │  │
│                    │  │  │ strongs_greek       (~12MB) │  │  │
│                    │  │  │ strongs_hebrew      (~10MB) │  │  │
│                    │  │  │ interlinear         (~35MB) │  │  │
│                    │  │  │ user_annotations    (<1MB)  │  │  │
│                    │  │  └─────────────────────────────┘  │  │
│                    │  └──────────────────────────────────┘  │
└────────────────────┴────────────────────────────────────────┘
          │ Sync (background, opcional)
          ▼
   FastAPI Backend (Python) ← apenas para updates de corpus
```

### 🔧 Implementação Técnica — Passo a Passo

#### **Passo 1: Setup DuckDB-WASM no Vite**

```bash
npm install @duckdb/duckdb-wasm
```

```typescript
// src/workers/duckdb.worker.ts
import * as duckdb from "@duckdb/duckdb-wasm";

let db: duckdb.AsyncDuckDB | null = null;

self.onmessage = async (event) => {
  if (event.data.type === "INIT") {
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
    const worker = await duckdb.createWorker(bundle.mainWorker!);
    const logger = new duckdb.ConsoleLogger();
    db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

    // Configurar OPFS para persistência real
    await db.open({
      path: "opfs://verbum-v1.db",
      accessMode: duckdb.DuckDBAccessMode.READ_WRITE,
    });

    // Forçar checkpoint imediato (não depender do WAL)
    const conn = await db.connect();
    await conn.query("SET wal_autocheckpoint = '0KB'");
    await conn.close();

    self.postMessage({ type: "READY" });
  }
};
```

#### **Passo 2: Seeding Inicial (Download Progressivo)**

Na primeira visita, o app faz download do corpus bíblico como Parquet particionado:

```typescript
// src/hooks/useDuckDBSeed.ts
export const useDuckDBSeed = () => {
  const seed = async (conn: duckdb.AsyncDuckDBConnection) => {
    // Verificar se já foi seeded
    const result = await conn.query(
      "SELECT count(*) as c FROM information_schema.tables WHERE table_name='bible_verses'"
    );
    if (result.toArray()[0].c > 0) return; // já inicializado

    // Download progressivo com progress bar
    const datasets = [
      { name: "bible_verses", url: "/data/bible_verses.parquet", size: "~80MB" },
      { name: "strongs_greek", url: "/data/strongs_greek.parquet", size: "~12MB" },
      { name: "interlinear", url: "/data/interlinear.parquet", size: "~35MB" },
    ];

    for (const ds of datasets) {
      const resp = await fetch(ds.url);
      // DuckDB pode ler Parquet diretamente de uma URL ou buffer
      await conn.query(`
        CREATE TABLE ${ds.name} AS
        SELECT * FROM read_parquet('${ds.url}')
      `);
    }
  };
  return { seed };
};
```

#### **Passo 3: Custom Hook React**

```typescript
// src/hooks/useDuckDB.ts
import { useEffect, useRef, useState } from "react";

export function useDuckDB() {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/duckdb.worker.ts", import.meta.url),
      { type: "module" }
    );

    workerRef.current.onmessage = (e) => {
      if (e.data.type === "READY") setIsReady(true);
    };

    workerRef.current.postMessage({ type: "INIT" });

    return () => workerRef.current?.terminate();
  }, []);

  const query = async <T>(sql: string): Promise<T[]> => {
    // implementação com Comlink ou MessageChannel
    return [];
  };

  return { isReady, query };
}
```

#### **Passo 4: Service Worker para PWA completo**

```typescript
// vite.config.ts — usando vite-plugin-pwa
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        // Cache do WASM bundle (~5MB) e data assets
        globPatterns: ["**/*.{js,css,html,ico,wasm}"],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        runtimeCaching: [
          {
            urlPattern: /\/data\/.*\.parquet$/,
            handler: "CacheFirst", // cache local do corpus
            options: { cacheName: "verbum-corpus-v1" },
          },
        ],
      },
    }),
  ],
});
```

### ⚖️ Trade-offs

| Aspecto | Vantagem | Desvantagem |
|---|---|---|
| **Performance** | Queries locais eliminam latência de rede | Bundle inicial WASM ~5MB |
| **Privacidade** | Dados 100% no dispositivo | Usuário gerencia storage |
| **Offline** | Funciona sem internet após seed | Seed inicial requer conexão |
| **Custo infra** | Elimina 90% das queries ao servidor | Backend mantido apenas para updates |
| **Storage** | ~150MB total (corpus completo) | Dispositivos com <512MB livres podem ter problemas |

> [!TIP]
> **Estratégia de entregas progressivas:** Começar apenas com a versão NT em Grego (~25MB) e permitir download modular do AT/AT-Hebraico separadamente. Usar a Cache Storage API para gerenciar as versões baixadas.

---

## Frente 2 — Busca Semântica Nativa com DuckDB VSS

### 🎯 Oportunidade

**Status da tecnologia (2026):** `EXPERIMENTAL - USAR COM CAUTELA ⚠️`

A extensão `vss` do DuckDB implementa índices HNSW nativos via SQL. Para o Verbum, isso significa trocar o `ILIKE '%ἀγάπη%'` por busca por **intenção semântica**: "versículos sobre amor incondicional" → retorna versos relevantes mesmo sem a palavra exata.

> [!WARNING]
> A extensão `vss` ainda é **experimental** em 2026. Os índices HNSW em disco precisam de `SET hnsw_enable_experimental_persistence = true;` e o WAL recovery pode não ser confiável. Trate os índices como **derivados e reconstruíveis** a partir dos embeddings armazenados na tabela principal.

### 📐 Arquitetura de Embeddings Bíblicos

```
Pipeline Python (Backend — execução única)
─────────────────────────────────────────
Corpus de Versículos
    │
    ▼
Modelo de Embedding multilingual
(sentence-transformers/paraphrase-multilingual-mpnet-base-v2)
    │
    ▼ vetores float[768]
DuckDB: tabela verse_embeddings
    │
    ▼
Export para Parquet (servido como asset estático)

Frontend (DuckDB-WASM + VSS)
─────────────────────────────
Parquet carregado no OPFS
    │
    ▼
LOAD vss; CREATE INDEX HNSW;
    │
    ▼
Query semântica com array_distance()
```

### 🔧 Implementação Técnica — Passo a Passo

#### **Passo 1: Gerar Embeddings no Backend Python**

```python
# src/etl/generate_embeddings.py
from sentence_transformers import SentenceTransformer
import duckdb
import numpy as np

def generate_verse_embeddings():
    model = SentenceTransformer("paraphrase-multilingual-mpnet-base-v2")
    conn = duckdb.connect("verbum.db")

    # Carregar versículos
    verses = conn.execute("""
        SELECT book_code, chapter, verse, text_pt, text_grc
        FROM bible_verses
        WHERE translation = 'ARA'
    """).fetchdf()

    # Gerar embeddings
    texts = verses["text_pt"].tolist()
    embeddings = model.encode(texts, batch_size=64, show_progress_bar=True)

    # Persistir como FLOAT[768]
    conn.execute("""
        CREATE TABLE IF NOT EXISTS verse_embeddings (
            book_code VARCHAR,
            chapter INTEGER,
            verse INTEGER,
            embedding FLOAT[768]
        )
    """)

    for i, row in verses.iterrows():
        emb_list = embeddings[i].tolist()
        conn.execute(
            "INSERT INTO verse_embeddings VALUES (?, ?, ?, ?)",
            [row["book_code"], row["chapter"], row["verse"], emb_list]
        )

    # Exportar como Parquet
    conn.execute("COPY verse_embeddings TO 'verse_embeddings.parquet' (FORMAT PARQUET)")
    print("✅ Embeddings gerados e exportados!")
```

#### **Passo 2: FastAPI endpoint de busca semântica**

```python
# src/api/routers/search.py
from fastapi import APIRouter
from sentence_transformers import SentenceTransformer

router = APIRouter(prefix="/api/v1/search")
model = SentenceTransformer("paraphrase-multilingual-mpnet-base-v2")

@router.get("/semantic")
async def semantic_search(q: str, limit: int = 10):
    """Busca semântica por intenção teológica."""
    conn = get_duckdb_conn()
    conn.execute("INSTALL vss; LOAD vss;")

    # Gerar embedding da query
    query_vec = model.encode(q).tolist()

    results = conn.execute("""
        SELECT
            v.book_code, v.chapter, v.verse, v.text_pt,
            array_distance(e.embedding, ?::FLOAT[768]) AS semantic_distance
        FROM verse_embeddings e
        JOIN bible_verses v USING (book_code, chapter, verse)
        ORDER BY semantic_distance ASC
        LIMIT ?
    """, [query_vec, limit]).fetchdf()

    return results.to_dict("records")
```

#### **Passo 3: Criar índice HNSW no WASM (frontend)**

```typescript
// No worker DuckDB após carregar verse_embeddings.parquet
const initVSS = async (conn: duckdb.AsyncDuckDBConnection) => {
  await conn.query("INSTALL vss; LOAD vss;");
  await conn.query("SET hnsw_enable_experimental_persistence = true;");

  // Criar índice HNSW (apenas uma vez)
  await conn.query(`
    CREATE INDEX IF NOT EXISTS hnsw_verse_idx
    ON verse_embeddings
    USING HNSW (embedding)
    WITH (metric = 'cosine')
  `);
};
```

#### **Passo 4: Estratégia Híbrida (Lexical + Semântica)**

Para máxima precisão teológica, combine BM25 (texto exato) com busca vetorial:

```typescript
// src/services/hybridSearch.ts
export async function hybridSearch(query: string, conn: AsyncDuckDBConnection) {
  // Canal 1: Busca lexical (palavras exatas em Grego/Hebraico)
  const lexical = await conn.query(`
    SELECT book_code, chapter, verse, text_pt, 1.0 AS lex_score
    FROM bible_verses
    WHERE text_pt ILIKE '%${query}%'
       OR text_grc ILIKE '%${query}%'
    LIMIT 20
  `);

  // Canal 2: Busca semântica via backend
  const semanticResp = await fetch(`/api/v1/search/semantic?q=${encodeURIComponent(query)}&limit=20`);
  const semantic = await semanticResp.json();

  // Fusão RRF (Reciprocal Rank Fusion)
  return mergeRRF(lexical.toArray(), semantic);
}

function mergeRRF(lexical: any[], semantic: any[], k = 60) {
  const scores = new Map<string, number>();
  const addScore = (items: any[], key: (i: any) => string) => {
    items.forEach((item, rank) => {
      const id = key(item);
      scores.set(id, (scores.get(id) || 0) + 1 / (k + rank + 1));
    });
  };
  addScore(lexical, (i) => `${i.book_code}-${i.chapter}-${i.verse}`);
  addScore(semantic, (i) => `${i.book_code}-${i.chapter}-${i.verse}`);
  // ... ordenar e retornar top-k combinado
}
```

### ⚖️ Trade-offs

| Aspecto | Vantagem | Desvantagem |
|---|---|---|
| **Recall semântico** | Encontra versículos por tema, não só por palavra | Embeddings multilingual: ~768B por verso (40MB heap) |
| **Custo de inferência** | Embedding da query: ~10ms no servidor | Modelo não roda no WASM hoje (precisa de backend) |
| **Extensão VSS** | SQL nativo, zero infra extra | Status experimental, WAL recovery instável |
| **Alternativa** | LanceDB tem integração DuckDB nativa e é mais estável | Adiciona dependência externa |

> [!NOTE]
> **Alternativa madura:** Considere usar **LanceDB** (que tem integração nativa com DuckDB via extensão `lance`) para produção. LanceDB é Apache 2.0, roda localmente, e já tem suporte a HNSW estável sem o flag experimental.

---

## Frente 3 — Sincronização Descentralizada (CRDT + WebRTC)

### 🎯 Oportunidade

**Status da tecnologia (2026):** `MADURA ✅ (Yjs) / EXPERIMENTAL (Automerge)`

Hoje as anotações do Verbum vivem presas no **localStorage de um único browser** — o maior problema de uma ferramenta de estudo sério. Com Yjs + y-webrtc, o usuário pode sincronizar suas notas bíblicas entre o celular e o notebook **sem servidor, sem conta, sem cloud**, usando WebRTC peer-to-peer.

> [!IMPORTANT]
> **Privacidade Radical:** Com WebRTC + Yjs, as anotações nunca passam por um servidor seu. O servidor de sinalização (necessário apenas para o handshake inicial) não vê o conteúdo das notas — apenas troca metadados de conexão. Após conectar, a sincronização é end-to-end.

### 📐 Arquitetura de Sincronização

```
Dispositivo A (Chrome/Desktop)           Dispositivo B (Chrome/Mobile)
┌────────────────────────────┐           ┌────────────────────────────┐
│   Yjs Document             │           │   Yjs Document             │
│   ┌────────────────────┐   │           │   ┌────────────────────┐   │
│   │ annotations: Y.Map │   │           │   │ annotations: Y.Map │   │
│   │ ┌────────────────┐ │   │  WebRTC   │   │ ┌────────────────┐ │   │
│   │ │ Jn 3:16 →      │ │◄──┼──────────┼──►│ │ Jn 3:16 →      │ │   │
│   │ │  "Nota 1..."   │ │   │  (P2P)   │   │ │  "Nota 1..."   │ │   │
│   │ └────────────────┘ │   │           │   │ └────────────────┘ │   │
│   └────────────────────┘   │           │   └────────────────────┘   │
│   Persistência: IndexedDB  │           │   Persistência: IndexedDB  │
└────────────────────────────┘           └────────────────────────────┘
              │                                       │
              └──────────────┬────────────────────────┘
                             │ Handshake inicial apenas
                      Signaling Server
                    (WebSocket — leve, stateless)
                    (pode ser free: y-sweet, Railway)
```

### 🔧 Implementação Técnica — Passo a Passo

#### **Passo 1: Instalar Yjs e providers**

```bash
npm install yjs y-webrtc y-indexeddb @y-presence/client
```

#### **Passo 2: Modelo de dados CRDT para anotações bíblicas**

```typescript
// src/store/verbumDoc.ts
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";

// Schema de anotações
export interface VerseAnnotation {
  id: string;
  verseRef: string; // e.g. "JN.3.16"
  text: string;
  tags: string[];
  highlight_color?: string;
  created_at: number;
  updated_at: number;
}

let ydoc: Y.Doc | null = null;
let webrtcProvider: WebrtcProvider | null = null;

export function initVerbumSync(roomId: string) {
  ydoc = new Y.Doc();

  // Persistência local (sobrevive ao refresh)
  const indexeddbPersistence = new IndexeddbPersistence("verbum-annotations", ydoc);

  // Sincronização P2P via WebRTC
  webrtcProvider = new WebrtcProvider(roomId, ydoc, {
    signaling: ["wss://signaling.verbum.app"], // seu servidor de sinalização
    // Opção gratuita: usar o servidor público do Yjs (apenas para dev)
    // signaling: ["wss://y-webrtc-signaling-eu.herokuapp.com"],
  });

  return {
    annotations: ydoc.getMap<VerseAnnotation>("annotations"),
    awareness: webrtcProvider.awareness,
  };
}
```

#### **Passo 3: Hook React para anotações sincronizadas**

```typescript
// src/hooks/useVerseAnnotations.ts
import { useEffect, useState, useCallback } from "react";
import * as Y from "yjs";
import { initVerbumSync, VerseAnnotation } from "../store/verbumDoc";

export function useVerseAnnotations(verseRef: string) {
  const [annotations, setAnnotations] = useState<VerseAnnotation[]>([]);
  const { annotations: yAnnotations } = initVerbumSync("verbum-user-room");

  useEffect(() => {
    const updateAnnotations = () => {
      const all = Array.from(yAnnotations.values());
      setAnnotations(all.filter((a) => a.verseRef === verseRef));
    };

    yAnnotations.observe(updateAnnotations);
    updateAnnotations(); // estado inicial

    return () => yAnnotations.unobserve(updateAnnotations);
  }, [verseRef]);

  const addAnnotation = useCallback(
    (text: string, tags: string[] = []) => {
      const annotation: VerseAnnotation = {
        id: crypto.randomUUID(),
        verseRef,
        text,
        tags,
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      yAnnotations.set(annotation.id, annotation);
    },
    [verseRef, yAnnotations]
  );

  return { annotations, addAnnotation };
}
```

#### **Passo 4: Servidor de Sinalização (Python/FastAPI)**

```python
# src/api/ws/signaling.py — servidor de sinalização mínimo
from fastapi import WebSocket
from typing import Dict, List

rooms: Dict[str, List[WebSocket]] = {}

@app.websocket("/ws/signaling/{room}")
async def signaling(websocket: WebSocket, room: str):
    await websocket.accept()
    if room not in rooms:
        rooms[room] = []
    rooms[room].append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast para todos os peers na sala
            for peer in rooms[room]:
                if peer != websocket:
                    await peer.send_text(data)
    finally:
        rooms[room].remove(websocket)
```

#### **Passo 5: Exportação/Backup local**

```typescript
// src/utils/exportAnnotations.ts
import * as Y from "yjs";

export function exportAnnotationsToJSON(ydoc: Y.Doc): string {
  const annotations = ydoc.getMap("annotations");
  const data = {
    exported_at: new Date().toISOString(),
    version: "1.0",
    annotations: Array.from(annotations.values()),
  };
  return JSON.stringify(data, null, 2);
}

export function downloadBackup(ydoc: Y.Doc) {
  const json = exportAnnotationsToJSON(ydoc);
  const blob = new Blob([json], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `verbum-annotations-${Date.now()}.json`;
  a.click();
}
```

### ⚖️ Trade-offs

| Aspecto | Vantagem | Desvantagem |
|---|---|---|
| **Privacidade** | Dados nunca saem do dispositivo (conteúdo) | Usuário precisa gerenciar o "Room ID" |
| **Offline-first** | Anotações funcionam sem internet | Sync só ocorre quando ambos os peers estão online |
| **Infraestrutura** | Sinalização é stateless e baratíssima | TURN server necessário para NAT estrito (~$5/mês) |
| **Conflitos** | CRDT resolve merges automaticamente, sem intervenção | Semantic conflicts (interpretação) são inevitáveis |
| **Portabilidade** | Export JSON/import garante escape de plataforma | Processo manual para usuário não-técnico |

> [!TIP]
> **Sala compartilhada = Grupos de Estudo!** O `roomId` pode ser compartilhado entre membros de um grupo de estudo bíblico. Cada participante escreve anotações e todos veem em tempo real — sem backend, sem conta, sem data brokering.

---

## Frente 4 — Pedagogia & Spaced Repetition (SM-2 / FSRS)

### 🎯 Oportunidade

**Status da tecnologia (2026):** `MADURA ✅ (SM-2) / EMERGENTE 🚀 (FSRS)`

O Anki domina o espaço de repetição espaçada com o algoritmo SM-2 há décadas. A evolução moderna é o **FSRS (Free Spaced Repetition Scheduler)** — mathematicamente superior, open-source, e já adotado pelo próprio Anki em 2024. Para vocabulário em Grego/Hebraico e memorização de versículos, isso é um diferencial enorme no Verbum.

> [!NOTE]
> **SM-2 vs FSRS:** SM-2 é mais simples de implementar e suficiente para MVP. FSRS usa um modelo de dificuldade adaptativa e é 20% mais eficiente em retenção segundo estudos comparativos. Para o Verbum, recomendo comenzar com SM-2 e migrar para FSRS na v2.

### 📐 Arquitetura de Flashcards Bíblicos

```
Verbum Flashcard Engine
─────────────────────────────────────────────────────────────
Tipos de Cards:
  1. Vocabulário Grego: ἀγάπη → "amor" (Strong G26)
  2. Vocabulário Hebraico: חֶסֶד → "amor leal/graça" (Strong H2617)
  3. Versículo → Referência: "Porque Deus amou tanto..." → Jo 3:16
  4. Referência → Versículo: Jo 3:16 → completar o texto

Estado por card (persistido no DuckDB/OPFS):
  - repetitions: INTEGER
  - interval: INTEGER (dias)
  - easiness_factor: FLOAT (padrão 2.5)
  - next_review_at: TIMESTAMP
  - last_reviewed: TIMESTAMP
```

### 🔧 Implementação Técnica — Passo a Passo

#### **Passo 1: Algoritmo SM-2 em TypeScript**

```typescript
// src/algorithms/sm2.ts
export interface CardState {
  repetitions: number;
  interval: number;       // dias
  easinessFactor: number; // min 1.3, default 2.5
  nextReviewAt: Date;
}

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;
// 0-2: falhou | 3: hard | 4: good | 5: perfect

export function sm2(card: CardState, quality: Quality): CardState {
  let { repetitions, interval, easinessFactor } = card;

  // Atualizar easiness factor
  const newEF = Math.max(
    1.3,
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  if (quality < 3) {
    // Resetar: falhou o card
    repetitions = 0;
    interval = 1;
  } else {
    // Sucesso: avançar no cronograma
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * newEF);
    repetitions += 1;
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return {
    repetitions,
    interval,
    easinessFactor: newEF,
    nextReviewAt,
  };
}

// Estado inicial de um card novo
export const defaultCardState = (): CardState => ({
  repetitions: 0,
  interval: 0,
  easinessFactor: 2.5,
  nextReviewAt: new Date(),
});
```

#### **Passo 2: Schema no DuckDB (OPFS)**

```sql
-- Criado no worker DuckDB durante o seed
CREATE TABLE IF NOT EXISTS flashcard_progress (
    card_id         VARCHAR PRIMARY KEY,
    card_type       VARCHAR, -- 'vocab_grc' | 'vocab_heb' | 'verse_ref' | 'ref_verse'
    source_ref      VARCHAR, -- Strong number ou referência (e.g., 'G26', 'JN.3.16')
    repetitions     INTEGER DEFAULT 0,
    interval_days   INTEGER DEFAULT 0,
    easiness_factor FLOAT   DEFAULT 2.5,
    next_review_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_reviewed   TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Query para buscar cards devidos hoje
SELECT fp.*, sv.word, sv.transliteration, sv.definition
FROM flashcard_progress fp
JOIN strongs_vocab sv ON fp.source_ref = sv.strongs_number
WHERE fp.next_review_at <= CURRENT_TIMESTAMP
  AND fp.card_type = 'vocab_grc'
ORDER BY fp.next_review_at ASC
LIMIT 20;
```

#### **Passo 3: Componente de Flashcard em Carrossel**

```tsx
// src/components/FlashcardCarousel.tsx
import { useState, useEffect } from "react";
import { sm2, Quality, CardState } from "../algorithms/sm2";
import { useDuckDB } from "../hooks/useDuckDB";

interface FlashCard {
  id: string;
  front: React.ReactNode;
  back: React.ReactNode;
  state: CardState;
}

export function FlashcardCarousel({ cards }: { cards: FlashCard[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const { query } = useDuckDB();

  const handleQuality = async (quality: Quality) => {
    const card = cards[currentIndex];
    const newState = sm2(card.state, quality);

    // Persistir no DuckDB OPFS
    await query(`
      UPDATE flashcard_progress
      SET repetitions = ${newState.repetitions},
          interval_days = ${newState.interval},
          easiness_factor = ${newState.easinessFactor},
          next_review_at = '${newState.nextReviewAt.toISOString()}',
          last_reviewed = CURRENT_TIMESTAMP
      WHERE card_id = '${card.id}'
    `);

    setSessionStats((s) => ({
      correct: s.correct + (quality >= 3 ? 1 : 0),
      total: s.total + 1,
    }));

    // Avançar para o próximo card
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((i) => i + 1), 300);
  };

  const card = cards[currentIndex];

  if (!card) return <SessionComplete stats={sessionStats} />;

  return (
    <div className="flashcard-carousel">
      {/* Progress bar */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(currentIndex / cards.length) * 100}%` }}
        />
      </div>

      {/* Card com flip animation */}
      <div
        className={`flashcard ${isFlipped ? "flipped" : ""}`}
        onClick={() => setIsFlipped(true)}
      >
        <div className="card-front">{card.front}</div>
        <div className="card-back">{card.back}</div>
      </div>

      {/* Botões de qualidade (só aparecem após flip) */}
      {isFlipped && (
        <div className="quality-buttons">
          <button onClick={() => handleQuality(1)} className="btn-again">
            🔴 De novo (1)
          </button>
          <button onClick={() => handleQuality(3)} className="btn-hard">
            🟠 Difícil (3)
          </button>
          <button onClick={() => handleQuality(4)} className="btn-good">
            🟢 Bom (4)
          </button>
          <button onClick={() => handleQuality(5)} className="btn-easy">
            ⚡ Fácil (5)
          </button>
        </div>
      )}

      {/* Streak badge */}
      <StreakBadge days={7} /> {/* buscar do DuckDB */}
    </div>
  );
}
```

#### **Passo 4: Geração Automática de Cards a partir do Corpus**

```python
# src/etl/generate_flashcards.py
import duckdb

def generate_vocab_flashcards():
    conn = duckdb.connect("verbum.db")

    # Auto-gerar cards de vocabulário do Strong's
    cards = conn.execute("""
        SELECT
            CONCAT('vocab_grc_', strongs_number) AS card_id,
            'vocab_grc' AS card_type,
            strongs_number AS source_ref
        FROM strongs_greek
        WHERE frequency > 10  -- apenas palavras que aparecem 10+ vezes
        ORDER BY frequency DESC
    """).fetchdf()

    conn.executemany("""
        INSERT OR IGNORE INTO flashcard_progress (card_id, card_type, source_ref)
        VALUES (?, ?, ?)
    """, cards.values.tolist())

    print(f"✅ {len(cards)} flashcards de vocabulário gerados!")
```

#### **Passo 5: Gamificação — Dashboard de Progresso**

```tsx
// src/components/StudyDashboard.tsx
const gamificationMetrics = {
  streak: { current: 7, max: 42, icon: "🔥" },
  today: { reviewed: 23, correct: 19, new: 5 },
  badges: [
    { id: "greek_explorer", label: "Explorador do Koinê", earned: true },
    { id: "30_day_streak", label: "Mês Fiel", earned: false, progress: 0.7 },
  ],
  xp: { current: 1250, nextLevel: 1500, level: 8 },
};
```

### ⚖️ Trade-offs

| Aspecto | Vantagem | Desvantagem |
|---|---|---|
| **SM-2** | Implementação simples, comportamento previsível | Menos preciso que FSRS para usuários avançados |
| **FSRS** | 20% mais eficiente em retenção, adaptativo | Implementação mais complexa (~300 linhas de lógica) |
| **Auto-geração** | Cards criados do corpus: zero esforço editorial | Qualidade dos cards depende da qualidade do corpus |
| **Gamificação** | Aumenta retenção de usuários em ~60% (estudos) | Risco de virar "colecionar streaks" ao invés de estudar |
| **Local (OPFS)** | Progresso persiste offline | Não sincroniza entre dispositivos sem Frente 3 |

> [!TIP]
> **Integrar com Frente 3 (Yjs):** O progresso de flashcards pode ser sincronizado via CRDT junto com as anotações. Use `Y.Map` para armazenar o estado de cada card — os CRDTs são perfeitos para "Last Write Wins" em campos de progresso individual.

---

## Frente 5 — Oráculo Teológico "Grounded" (RAG Estrito)

### 🎯 Oportunidade

**Status da tecnologia (2026):** `MADURA ✅ (RAG) / CRÍTICO DE SE FAZER BEM ⚠️`

O risco de um "assistente teológico" genérico baseado em LLM é enorme: modelos como GPT ou Claude têm vieses teológicos embutidos em seu pré-treinamento, introduzem sincretismo, e **fabricam citações patrísticas** com naturalidade assustadora. A solução é um oráculo 100% *grounded* — ele só pode responder com o que está nos comentários históricos do corpus.

> [!CAUTION]
> **Nunca** use um LLM sem RAG estrito para respostas teológicas. A probabilidade de alucinação em perguntas sobre doutrina, interpretação patrística, e exegese textual é alta. Um versículo citado incorretamente ou uma atribuição falsa a um Pai da Igreja pode causar dano real à fé do usuário.

### 📐 Arquitetura do Oráculo Teológico

```
Usuário: "O que Matthew Henry diz sobre a graça em Efésios 2:8?"
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│             VERBUM THEOLOGICAL ORACLE                    │
├─────────────────────────────────────────────────────────┤
│   Query Preprocessor                                     │
│   ├── Detectar referência bíblica (NER customizado)      │
│   ├── Detectar autor solicitado (Matthew Henry, Easton's)│
│   └── Decompor em sub-queries se necessário              │
│                              │                           │
│   Retriever (Híbrido)        ▼                           │
│   ├── BM25 (keyword exact match)                        │
│   ├── Vector Search (embeddings semânticos)              │
│   └── Structured Filter (book_ref = 'EPH', chapter = 2) │
│                              │                           │
│   Re-ranker (Cross-Encoder)  ▼                           │
│   └── Seleciona top 5 chunks mais relevantes            │
│                              │                           │
│   LLM com Prompt Estrito     ▼                           │
│   ├── SOMENTE contexto fornecido                        │
│   ├── Citar fonte exata (Matthew Henry: Ef 2:8, p.XX)   │
│   └── "Não sei" se não encontrar no corpus              │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Resposta com citações verificáveis
```

### 🔧 Implementação Técnica — Passo a Passo

#### **Passo 1: Preparar o Corpus de Comentários**

```python
# src/etl/ingest_commentaries.py
"""
Corpus prioritário (public domain):
- Matthew Henry's Complete Commentary (1706) — Project Gutenberg
- Easton's Bible Dictionary (1897) — Public Domain
- Adam Clarke's Commentary (1826) — Public Domain
- John Gill's Exposition (1746-1763) — Public Domain
- Albert Barnes' Notes (1832) — Public Domain
"""
import duckdb
from pathlib import Path

def ingest_commentary(conn: duckdb.DuckDBPyConnection):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS commentary_chunks (
            chunk_id        VARCHAR PRIMARY KEY,
            source          VARCHAR,  -- 'matthew_henry', 'eastons', 'adam_clarke'
            author          VARCHAR,
            year_published  INTEGER,
            book_code       VARCHAR,  -- 'EPH', 'JN', etc.
            chapter         INTEGER,
            verse           INTEGER,
            chunk_text      TEXT,
            embedding       FLOAT[768]
        )
    """)
```

#### **Passo 2: Pipeline RAG com LlamaIndex**

```python
# src/api/services/theological_oracle.py
from llama_index.core import VectorStoreIndex, ServiceContext, Document
from llama_index.core.retrievers import BM25Retriever, VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.postprocessor import SimilarityPostprocessor
from llama_index.llms.openai import OpenAI  # ou Gemini, Claude

THEOLOGICAL_SYSTEM_PROMPT = """
Você é o Oráculo Verbum, um assistente de pesquisa teológica estritamente grounded.

REGRAS ABSOLUTAS:
1. Responda APENAS com base nos trechos de contexto fornecidos.
2. Para cada afirmação, cite o autor e a fonte exata (ex: "Matthew Henry, Comentário a Ef 2:8").
3. Se a informação não estiver nos trechos fornecidos, responda:
   "Não encontrei uma resposta direta nos comentários históricos disponíveis para sua consulta."
4. NUNCA use seu conhecimento pré-treinado para complementar a resposta.
5. NUNCA gere citações de fontes que não estejam nos trechos fornecidos.

Formato de resposta:
- Resposta objetiva baseada no corpus
- [Fonte: Autor, Obra, Referência]
"""

class TheologicalOracle:
    def __init__(self):
        self.llm = OpenAI(
            model="gpt-4o-mini",
            system_prompt=THEOLOGICAL_SYSTEM_PROMPT,
            temperature=0.0,  # ZERO temperatura: sem criatividade, máxima fidelidade
        )

    async def query(
        self,
        user_question: str,
        book_code: str = None,
        chapter: int = None,
        verse: int = None,
        author_filter: str = None,
    ) -> dict:
        # 1. Busca híbrida (BM25 + Vector)
        chunks = await self._retrieve_chunks(
            user_question, book_code, chapter, verse, author_filter, k=20
        )

        # 2. Re-ranking com Cross-Encoder
        reranked = await self._rerank(user_question, chunks, top_k=5)

        # 3. Construir contexto para o LLM
        context = self._format_context(reranked)

        # 4. Verificação de relevância (guardrail)
        if len(reranked) == 0:
            return {
                "answer": "Não encontrei referências nos comentários históricos disponíveis.",
                "sources": [],
                "grounding_score": 0.0,
            }

        # 5. Gerar resposta com LLM
        response = await self.llm.achat(
            messages=[
                {"role": "system", "content": THEOLOGICAL_SYSTEM_PROMPT},
                {"role": "user", "content": f"Contexto:\n{context}\n\nPergunta: {user_question}"},
            ]
        )

        return {
            "answer": response.message.content,
            "sources": [c["source"] for c in reranked],
            "grounding_score": self._compute_grounding_score(response, reranked),
        }

    def _format_context(self, chunks: list) -> str:
        """Formata chunks com identificadores claros para rastreamento."""
        formatted = []
        for i, chunk in enumerate(chunks):
            formatted.append(
                f"[FONTE {i+1}: {chunk['author']}, {chunk['source']}, "
                f"{chunk['book_code']} {chunk['chapter']}:{chunk['verse']}]\n"
                f"{chunk['chunk_text']}\n"
            )
        return "\n---\n".join(formatted)

    def _compute_grounding_score(self, response, chunks) -> float:
        """
        Verifica se a resposta cita fontes dos chunks fornecidos.
        Score 0-1: 1.0 = 100% grounded, 0.0 = sem citações.
        """
        citations_found = sum(
            1 for chunk in chunks if chunk["chunk_id"] in response.message.content
        )
        return citations_found / max(len(chunks), 1)
```

#### **Passo 3: Endpoint FastAPI**

```python
# src/api/routers/oracle.py
from fastapi import APIRouter
from pydantic import BaseModel
from ..services.theological_oracle import TheologicalOracle

router = APIRouter(prefix="/api/v1/oracle")
oracle = TheologicalOracle()

class OracleRequest(BaseModel):
    question: str
    book_code: str | None = None
    chapter: int | None = None
    verse: int | None = None
    author_filter: str | None = None  # "matthew_henry", "eastons", etc.

@router.post("/ask")
async def ask_oracle(request: OracleRequest):
    """
    Oráculo Teológico Grounded.
    Responde APENAS com base no corpus de comentários históricos.
    """
    result = await oracle.query(
        user_question=request.question,
        book_code=request.book_code,
        chapter=request.chapter,
        verse=request.verse,
        author_filter=request.author_filter,
    )

    return {
        **result,
        "disclaimer": "Resposta baseada exclusivamente em comentários de domínio público. Verificar fontes citadas.",
    }
```

#### **Passo 4: UI do Oráculo com Source Cards**

```tsx
// src/components/TheologicalOracle.tsx
export function OracleResponse({ result }: { result: OracleResult }) {
  return (
    <div className="oracle-response">
      <div className="oracle-answer">
        <span className="oracle-icon">📜</span>
        <p>{result.answer}</p>
      </div>

      {/* Grounding indicator */}
      <div className="grounding-meter">
        <span>Fundamento histórico:</span>
        <div className="meter-bar">
          <div
            className="meter-fill"
            style={{
              width: `${result.grounding_score * 100}%`,
              backgroundColor: result.grounding_score > 0.7 ? "#22c55e" : "#f59e0b",
            }}
          />
        </div>
        <span>{Math.round(result.grounding_score * 100)}%</span>
      </div>

      {/* Source cards */}
      <div className="source-cards">
        {result.sources.map((source, i) => (
          <div key={i} className="source-card">
            <span className="source-author">{source.author}</span>
            <span className="source-ref">{source.book_code} {source.chapter}:{source.verse}</span>
            <span className="source-year">{source.year_published}</span>
          </div>
        ))}
      </div>

      <div className="oracle-disclaimer">
        ⚠️ Baseado exclusivamente em comentários de domínio público.
      </div>
    </div>
  );
}
```

#### **Passo 5: Guardrails Anti-Alucinação**

```python
# src/api/services/guardrails.py

class TheologicalGuardrails:
    """
    Camada de verificação pós-geração.
    Usa um segundo modelo para auditar a resposta.
    """

    AUDIT_PROMPT = """
    Analise a resposta do assistente e o contexto fornecido.
    Verifique:
    1. Cada afirmação tem uma fonte explícita nos trechos fornecidos?
    2. Alguma afirmação parece não ter base nos trechos?
    3. Há citações fabricadas (autores ou obras não presentes nos trechos)?

    Retorne JSON: {"is_grounded": bool, "issues": [str], "confidence": float}
    """

    async def audit(self, response: str, context_chunks: list) -> dict:
        # Usar modelo menor/mais rápido para auditoria
        audit_result = await self.audit_llm.achat(...)
        return audit_result
```

### ⚖️ Trade-offs

| Aspecto | Vantagem | Desvantagem |
|---|---|---|
| **Grounding estrito** | Zero alucinação teológica se implementado corretamente | Respostas mais "secas", menos conversacionais |
| **Temperatura = 0** | Consistência máxima, reprodutível | Pode parecer rígido para perguntas abertas |
| **Corpus histórico** | Fontes de domínio público, 100% gratuito, auditável | Perspectivas pré-séc. XX; cobertura limitada de teologia contemporânea |
| **Re-ranker** | Melhora recall de 60% → 85%+ em precisão | +100ms de latência por query |
| **LLM-as-Judge** | Detecta respostas não-groundadas antes do usuário ver | Dobra custo de API por query |
| **Modelo local (Ollama)** | Privacidade total, zero custo de API | Qualidade inferior a GPT-4o; exige hardware do servidor |

> [!WARNING]
> **Não use `temperature > 0.1` para o oráculo teológico.** Criatividade em respostas teológicas é sinônimo de alucinação. Mantenha temperatura ≤ 0.1 e sempre exija que o modelo cite fontes explícitas dos chunks fornecidos.

---

## 📊 Tabela Consolidada — Esforço × Impacto × Custo

| Frente | Impacto ao Usuário | Esforço de Dev | Custo de Infra | Diferencial Competitivo | Prioridade |
|--------|-------------------|----------------|----------------|------------------------|-----------|
| **1. PWA + DuckDB-WASM + OPFS** | 🔥🔥🔥🔥🔥 | 🔨🔨🔨🔨 (alto) | 💰 Muito Baixo (sem servidor) | ⭐⭐⭐⭐⭐ Nenhum app bíblico fez isso | **P0 — Fundação** |
| **2. Busca Semântica (VSS/HNSW)** | 🔥🔥🔥🔥 | 🔨🔨🔨 (médio) | 💰💰 Baixo (embedding = 1x) | ⭐⭐⭐⭐ YouVersion não tem | **P1** |
| **3. Sync CRDT/WebRTC (Yjs)** | 🔥🔥🔥🔥 | 🔨🔨🔨🔨 (alto) | 💰 Mínimo (sinalização) | ⭐⭐⭐⭐⭐ Radical para privacidade | **P2** |
| **4. Spaced Repetition (SM-2)** | 🔥🔥🔥🔥🔥 | 🔨🔨 (baixo) | 💰 Zero (100% local) | ⭐⭐⭐⭐ Diferencia de apps bíblicos | **P1 (quick win)** |
| **5. Oráculo Teológico RAG** | 🔥🔥🔥🔥 | 🔨🔨🔨🔨🔨 (muito alto) | 💰💰💰 Médio (LLM API) | ⭐⭐⭐⭐⭐ Inédito com corpus histórico | **P3** |

### Roadmap Recomendado

```
Q2 2026 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
├── [P1 - Quick Win] Frente 4: SM-2 Flashcards
│   └── 2-3 semanas | React + DuckDB OPFS local
│
├── [P1] Frente 2: Busca Semântica
│   └── 3-4 semanas | Python ETL + backend endpoint
│
Q3 2026 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
├── [P0 - Fundação] Frente 1: PWA DuckDB-WASM + OPFS
│   └── 4-6 semanas | Migração arquitetural pesada
│
├── [P2] Frente 3: CRDT Yjs + WebRTC Sync
│   └── 3-4 semanas | Depende da Frente 1 (OPFS)
│
Q4 2026 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
└── [P3] Frente 5: Oráculo Teológico RAG
    └── 6-8 semanas | Ingestion corpus + LlamaIndex + UI
```

---

## ⚙️ Stack Técnica Consolidada (Verbum 2.0)

```
Frontend (React + TypeScript + Vite)
├── duckdb-wasm            # SQL engine local (OPFS)
├── yjs + y-webrtc         # CRDT sync P2P
├── y-indexeddb            # Persistência yjs local
├── vite-plugin-pwa        # Service Worker + manifest
├── supermemo (ou manual)  # Algoritmo SM-2
└── framer-motion          # Animações de flashcard

Backend (Python + FastAPI)
├── duckdb                 # Pipeline ETL + serving
├── sentence-transformers  # Geração de embeddings
├── llama-index            # RAG framework
├── lancedb (opcional)     # Vector store mais estável que vss
└── websockets             # Servidor de sinalização WebRTC

Deploy
├── Frontend: Vercel / Cloudflare Pages (grátis)
├── Backend: Railway / Fly.io (~$5-20/mês)
├── Corpus (Parquet): Cloudflare R2 (grátis até 10GB)
└── Sinalização WebRTC: mesmo servidor FastAPI
```

---

## 🔑 Conclusão Estratégica

O Verbum tem **vantagem de fundação** rara: DuckDB já está no backend, o corpus está modelado, e a stack React/TypeScript é a mais adequada para as tecnologias descritas. As 5 frentes não são experimentos — são diferenciadores de produto que nenhum app bíblico em português entregou até hoje.

**O maior risco não é tecnológico — é de sequenciamento.** A Frente 1 (PWA Local-First) é a fundação arquitetural que desbloqueia todas as outras com custo zero de infraestrutura. Construir a Frente 4 (SM-2) antes disso é viável e entrega valor imediato ao usuário com mínimo esforço.

O Verbum não precisa ser o YouVersion. Ele precisa ser o que o YouVersion nunca vai conseguir ser: **radicalmente offline, extremamente profundo, completamente gratuito, e irrevogavelmente do usuário**.

---

*Relatório gerado em Abril 2026 · Verbum Strategic Architecture Report v1.0*
*Fontes: DuckDB Docs, Yjs GitHub, LangChain/LlamaIndex Docs, Papers SM-2/FSRS, W3C OPFS Spec, Mozilla Developer Network*
