"""
🧬 Semantic Genealogy Router
Rastreia a jornada de conceitos-chave do hebraico ao grego através dos testamentos.

Endpoints:
    GET /genealogy/concepts              → catálogo de todos os conceitos
    GET /genealogy/concepts/{concept_id} → conceito completo + stats do DB
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException

from src.api.dependencies import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

# Load curated concept journeys once at import time
_GENEALOGY_PATH = (
    Path(__file__).resolve().parents[3] / "data" / "static" / "semantic_genealogy.json"
)
_CONCEPTS: list[dict] = []
if _GENEALOGY_PATH.exists():
    _CONCEPTS = json.loads(_GENEALOGY_PATH.read_text(encoding="utf-8"))

_CONCEPT_INDEX: dict[str, dict] = {c["id"]: c for c in _CONCEPTS}


def _enrich_node(node: dict, db: object) -> dict:
    """Add occurrence count and top books from the interlinear table."""
    strongs_id = node.get("strongs_id", "")
    enriched = dict(node)

    try:
        # Occurrence count in interlinear
        count_row = db.execute(  # type: ignore[attr-defined]
            "SELECT COUNT(*) FROM interlinear WHERE strongs_id = ?",
            [strongs_id],
        ).fetchone()
        enriched["occurrence_count"] = int(count_row[0]) if count_row else 0

        # Top 5 books by frequency
        top_rows = db.execute(  # type: ignore[attr-defined]
            """
            SELECT SPLIT_PART(verse_id, '.', 1) AS book_id, COUNT(*) AS cnt
            FROM   interlinear
            WHERE  strongs_id = ?
            GROUP  BY book_id
            ORDER  BY cnt DESC
            LIMIT  5
            """,
            [strongs_id],
        ).fetchall()
        enriched["top_books"] = [{"book_id": r[0], "count": int(r[1])} for r in top_rows]

        # Short definition from lexicon (if present)
        lex_row = db.execute(  # type: ignore[attr-defined]
            "SELECT short_definition, transliteration, original "
            "FROM strongs_lexicon WHERE strongs_id = ?",
            [strongs_id],
        ).fetchone()
        if lex_row:
            enriched["short_definition"] = lex_row[0]
            enriched["lexicon_transliteration"] = lex_row[1]
            enriched["original_script"] = lex_row[2]

    except Exception as exc:
        logger.warning("Failed to enrich node %s: %s", strongs_id, exc)

    return enriched


@router.get("/genealogy/concepts")
def list_concepts() -> dict:
    """Lista todos os conceitos disponíveis na genealogia semântica."""
    summary = [
        {
            "id": c["id"],
            "concept": c["concept"],
            "concept_en": c["concept_en"],
            "tagline": c["tagline"],
            "color": c["color"],
            "icon": c["icon"],
            "node_count": len(c.get("nodes", [])),
            "strongs_ids": [n["strongs_id"] for n in c.get("nodes", [])],
        }
        for c in _CONCEPTS
    ]
    return {"total": len(summary), "concepts": summary}


@router.get("/genealogy/concepts/{concept_id}")
def get_concept(concept_id: str) -> dict:
    """
    Retorna um conceito completo com estatísticas de ocorrência do DB.

    Para cada palavra (node), adiciona:
    - occurrence_count: total de ocorrências no interlinear
    - top_books: top 5 livros por frequência
    - short_definition: definição curta do léxico Strong's
    """
    concept = _CONCEPT_INDEX.get(concept_id)
    if not concept:
        raise HTTPException(
            status_code=404,
            detail=f"Conceito '{concept_id}' não encontrado. "
            f"Disponíveis: {list(_CONCEPT_INDEX.keys())}",
        )

    db = get_db()
    try:
        enriched_nodes = [_enrich_node(n, db) for n in concept.get("nodes", [])]
        return {
            **concept,
            "nodes": enriched_nodes,
        }
    finally:
        db.close()
