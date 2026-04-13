# 🔧 IMPROVEMENTS.md — Melhorias Críticas para o Bible Data Pipeline
## Análise honesta + soluções concretas

> Este documento identifica problemas reais encontrados no código e nos
> screenshots, em ordem de impacto para o usuário final.

---

## 🔴 CRÍTICOS (afetam usabilidade)

### 1. Arc Diagram: SVG não escala com 3.538 arcos

**Problema:** O componente renderiza cada arco como um `<path>` SVG
individual via `arcs.map()` (ArcDiagram.tsx:121). Com 3.538 arcos, o
browser precisa manter 3.538 elementos DOM, cada um com event listeners
de hover. Isso causa:
- Lag ao mover o mouse (especialmente em mobile/laptops modestos)
- Scroll travando na página
- Memória alta

**Solução: Canvas para arcos + SVG overlay para interação.**

```typescript
// Conceito da solução:
// 1. Desenhar arcos no <canvas> (rápido, zero DOM)
// 2. Sobrepor <svg> transparente apenas para os livros (barras clicáveis)
// 3. No hover de um livro, redesenhar canvas com arcos filtrados

// Canvas rendering:
const canvas = canvasRef.current;
const ctx = canvas.getContext('2d');

function drawArcs(highlightBook: string | null) {
  ctx.clearRect(0, 0, width, height);
  for (const arc of arcs) {
    const connected = !highlightBook ||
      arc.source_book_id === highlightBook ||
      arc.target_book_id === highlightBook;

    ctx.beginPath();
    ctx.strokeStyle = getArcColor(arc);
    ctx.globalAlpha = connected ? opacityScale(arc.connection_count, maxWeight) : 0.03;
    ctx.lineWidth = Math.max(0.5, Math.min(2, arc.connection_count / 25));

    // Semicircle arc
    const x1 = positions[arc.source_book_id].cx;
    const x2 = positions[arc.target_book_id].cx;
    const radius = Math.abs(x2 - x1) / 2;
    const cx = (x1 + x2) / 2;
    ctx.arc(cx, baseline, radius, Math.PI, 0); // semicircle above baseline
    ctx.stroke();
  }
}
```

**Arquivos a alterar:** `ArcDiagram.tsx` (reescrever), `ArcDiagramPage.tsx`

**Resultado:** De 3.538 DOM nodes para 1 canvas + ~66 SVG rects. 60fps garantido.

---

### 2. ArcDetailPanel: lista infinita sem estrutura

**Problema:** ISA → JER tem 1.532 conexões. O painel carrega 50 (limite da
API) e despeja tudo numa lista vertical de cards idênticos. Não tem:
- Agrupamento (por capítulo, por tema)
- Paginação ou "load more"
- Resumo/contexto ("Isaiah and Jeremiah share themes of prophecy...")
- Forma rápida de filtrar

**Solução: Agrupar por capítulo do livro-fonte + "load more" + resumo.**

```
┌──────────────────────────┐
│ ISA → JER               ×│
│ 1.532 connections         │
│                           │
│ ┌─ Isaiah 1 (4 refs) ──┐ │
│ │ 1:2 → Jer 2:12  ▸    │ │
│ │ 1:4 → Jer 5:28  ▸    │ │
│ │ 1:10 → Jer 1:10 ▸    │ │
│ │ 1:15 → Jer 7:16 ▸    │ │
│ └───────────────────────┘ │
│ ┌─ Isaiah 2 (3 refs) ──┐ │
│ │ 2:2 → Jer 3:17  ▸    │ │
│ │ ...                   │ │
│ └───────────────────────┘ │
│                           │
│ [Show more chapters ↓]    │
│                           │
│ [Open Isaiah in Reader]   │
│ [Open Jeremiah in Reader] │
└──────────────────────────┘
```

**Mudanças:**
- Agrupar cross-refs por capítulo do source_verse_id
- Mostrar 5 grupos iniciais, "Show more" para o resto
- Cada cross-ref é uma linha compacta (não um card inteiro)
- Botões rápidos "Open in Reader" para cada livro

---

### 3. Apenas 2 traduções carregadas (KJV + NVI)

**Problema:** O screenshot da Home mostra "2 Translations · 2 Languages"
mas o código registra 10 traduções (kjv, bbe, nvi, ra, acf, rvr, apee,
asv, web, darby). O pipeline provavelmente só rodou para KJV e NVI.

**Solução:** Rodar o pipeline para todas as traduções registradas.

```bash
python -m src.cli run --translations kjv,nvi,bbe,ra,acf,rvr,apee,asv,web,darby
```

Depois verificar:
```sql
SELECT translation_id, COUNT(*) FROM verses GROUP BY 1 ORDER BY 2 DESC;
```

Se a API abibliadigital.com.br tiver rate limiting agressivo, rodar
em batches de 2-3 traduções por vez.

---

## 🟡 IMPORTANTES (afetam experiência)

### 4. Immersive Reader perdeu a magia do protótipo

**Problema:** O protótipo original (BibleReader.jsx) tinha:
- Livro aberto com duas páginas lado a lado
- Page-flip animado com CSS 3D transforms
- Perspectiva 3D (`perspective: 1800px`)
- Spine shadow central
- Textura de papel (SVG noise)
- Glow ambient

O ImmersiveReader atual é uma caixa escura com texto — funcional mas
sem a imersão que faz a pessoa sentir que está segurando um livro.

**Solução:** Integrar o visual do protótipo no componente real.

Elementos-chave a recuperar:
```css
/* Perspectiva 3D do livro */
.book-container {
  perspective: 1800px;
  perspective-origin: 50% 50%;
}

/* Spine central */
.book-spine {
  position: absolute;
  left: 50%;
  width: 12px;
  height: 100%;
  transform: translateX(-50%);
  background: linear-gradient(90deg,
    rgba(0,0,0,0.3), rgba(60,40,20,0.5), rgba(0,0,0,0.3));
}

/* Duas páginas lado a lado */
.page-left {
  width: 50%;
  background: linear-gradient(135deg, #F5F0E8, #EDE5D8);
  box-shadow: inset -4px 0 12px rgba(0,0,0,0.08);
  border-radius: 4px 0 0 4px;
}

.page-right {
  width: 50%;
  background: linear-gradient(225deg, #F5F0E8, #EDE5D8);
  border-radius: 0 4px 4px 0;
}

/* Page flip animation */
@keyframes flipNext {
  from { transform: rotateY(0deg); }
  to { transform: rotateY(-180deg); }
}
```

Layout: versos 1-15 na página esquerda, 16-31 na direita.
Click na página direita → flip animation → próxima "spread" de versos.

---

### 5. Verse of the Day: HTML entities não decodificadas

**Problema:** No screenshot da Home, o verso mostra `serpent&#x27;s`
em vez de `serpent's`. Provavelmente o texto vem da API com entities.

**Solução:** Decodificar no frontend ou no backend.

```typescript
// Frontend (simples)
function decodeEntities(text: string): string {
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}

// Ou no backend, ao salvar no DuckDB:
import html
text = html.unescape(raw_text)
```

**Nota:** Fazer no backend é melhor — corrige uma vez, para sempre.

---

### 6. Cross-ref badges (🔗 42) ocupam espaço visual demais

**Problema:** No Reader (screenshot 2), cada verso tem um badge à direita
mostrando "🔗 42", "🔗 8", "🔗 21". São informativos mas:
- Competem visualmente com o texto (que é o foco)
- O ícone 🔗 se repete 31 vezes na tela
- Números altos (42, 20, 17) chamam mais atenção que o texto bíblico

**Solução: Indicador mais sutil.**

```
Antes:  "In the beginning God created..."                    🔗 42
Depois: "In the beginning God created..."                      ·42
```

- Substituir 🔗 por um ponto discreto (·) ou nada
- Número em opacity 30%, sobe para 60% no hover do verso
- Cor: `var(--color-gold-dark)` em vez de alto contraste
- Ao clicar no número → abre cross-refs (já funciona)

---

## 🟢 POLISH (elevam a qualidade)

### 7. Home: Translation table é dashboard, não ferramenta

**Problema:** A tabela de traduções no final da Home mostra
ID/Language/Verses/Avg Sentiment. O sentimento médio não ajuda o
usuário — ninguém escolhe uma tradução pelo avg sentiment.

**Solução: Cards de tradução com identidade.**

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 🇬🇧 KJV      │ │ 🇧🇷 NVI      │ │ 🇬🇧 BBE      │
│ King James   │ │ Nova Versão  │ │ Basic Eng.  │
│ 1611 · EN    │ │ 1993 · PT-BR │ │ 1965 · EN   │
│ 31,101 versos│ │ 31,105 versos│ │ 31,102 versos│
│ [Read →]     │ │ [Read →]     │ │ [Read →]     │
└─────────────┘ └─────────────┘ └─────────────┘
```

Cada card linka para `/reader?translation=nvi`. Mostrar bandeira do
idioma, ano, e um "Read →" que abre direto naquela tradução.

---

### 8. Search: placeholder mais convidativo + sugestões

**Problema:** A página de Search está funcional mas fria. O placeholder
"Search verses (e.g., love, beginning, faith)..." é bom mas quando
não tem busca, a página é completamente vazia.

**Solução: Estado vazio com sugestões clicáveis.**

```
┌─────────────────────────────────────────────────────┐
│ [Search verses...                          ] [Search]│
│                                                      │
│ Try searching for:                                   │
│                                                      │
│  [love] [faith] [hope] [grace] [peace] [wisdom]     │
│  [Jesus] [David] [Moses] [beginning] [light]        │
│                                                      │
│ Popular verses:                                      │
│  • John 3:16 — For God so loved the world...         │
│  • Psalm 23:1 — The LORD is my shepherd...           │
│  • Romans 8:28 — And we know that all things...      │
└─────────────────────────────────────────────────────┘
```

Cada tag é clicável → executa a busca automaticamente.

---

### 9. Sidebar "CONTINUE" sempre mostra Genesis 1

**Problema:** Nos screenshots, o sidebar sempre mostra "CONTINUE /
Genesis 1 / KJV". Possivelmente o useReadingHistory está funcionando
mas não atualiza ao navegar entre capítulos.

**Verificar:** O hook está sendo chamado no BibleReader quando muda
de capítulo? Procurar por `record()` no BibleReader.tsx.

---

### 10. Bookmarks page vazia precisa ser convidativa

**Problema:** A página de Bookmarks mostra apenas "No bookmarks yet."
com uma estrela e "Start reading". Funcional mas fria.

**Solução:** Mostrar sugestões de versos populares para bookmarkar.

```
  ★ No bookmarks yet.

  Start by reading and clicking the bookmark icon
  on any verse. Here are some to get you started:

  "For God so loved the world..." — John 3:16  [★ Save]
  "The LORD is my shepherd..."   — Psalm 23:1  [★ Save]
  "I can do all things..."       — Phil 4:13   [★ Save]
```

---

## 📋 Prompt para o Claude Code

```
/ultraplan Implement critical improvements from IMPROVEMENTS.md.

PRIORITY ORDER:

1. ARC DIAGRAM PERFORMANCE (highest impact):
   - Rewrite ArcDiagram.tsx to use HTML Canvas for arcs rendering
   - Keep SVG overlay only for book bars (clickable) and labels
   - Canvas redraws on hover (filter arcs by book) — must be 60fps
   - Keep all existing features: color modes, min connections slider, hover fade

2. ARC DETAIL PANEL UX:
   - Group cross-refs by source chapter
   - Show 5 chapter groups initially, "Show more" for rest
   - Each cross-ref is a compact single line (not a full card)
   - Add "Open [book] in Reader" buttons at bottom

3. HTML ENTITY DECODING:
   - In src/transform/cleaning.py, add html.unescape() to normalize_text()
   - This fixes &#x27; → ' in all verse text globally
   - Also strip any remaining HTML tags

4. CROSS-REF BADGES: make subtle
   - Replace 🔗 icon with just the number
   - Set opacity to 0.25, hover → 0.5
   - Font size 11px, color var(--color-gold-dark)

5. SEARCH EMPTY STATE:
   - Add clickable suggestion tags below search bar
   - Tags: love, faith, hope, grace, peace, Jesus, David, beginning
   - Click tag → auto-fills input and triggers search

See IMPROVEMENTS.md for full specs, wireframes, and code examples.
```

---

*"O detalhe é a diferença entre bom e excelente."*
