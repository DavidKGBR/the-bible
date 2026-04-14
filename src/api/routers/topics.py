"""
📚 Topics Router
Serves Nave's Topical Bible — search topics and get grouped verse references.
4,673 topics with 191,787 verse links.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query

from src.api.dependencies import get_db

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/topics")
def list_topics(
    q: str | None = Query(None, min_length=2, description="Search topics by name"),
    limit: int = Query(50, ge=1, le=500, description="Max results"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
) -> dict:
    """List or search topics from Nave's Topical Bible."""
    conn = get_db()
    try:
        conditions: list[str] = []
        params: list[object] = []

        if q:
            conditions.append("LOWER(name) LIKE ?")
            params.append(f"%{q.lower()}%")

        where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

        count_row = conn.execute(f"SELECT COUNT(*) FROM topics {where}", params).fetchone()
        total = count_row[0] if count_row else 0

        params_page = [*params, limit, offset]
        df = conn.execute(
            f"""
            SELECT topic_id, name, slug, verse_count
            FROM topics
            {where}
            ORDER BY verse_count DESC, name
            LIMIT ? OFFSET ?
            """,
            params_page,
        ).fetchdf()

        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "results": df.to_dict(orient="records"),
        }
    finally:
        conn.close()


@router.get("/topics/popular")
def popular_topics(
    limit: int = Query(20, ge=1, le=100),
) -> dict:
    """Get the most-referenced topics."""
    conn = get_db()
    try:
        df = conn.execute(
            """
            SELECT topic_id, name, slug, verse_count
            FROM topics
            ORDER BY verse_count DESC
            LIMIT ?
            """,
            [limit],
        ).fetchdf()
        return {"results": df.to_dict(orient="records")}
    finally:
        conn.close()


@router.get("/topics/{slug}")
def get_topic(
    slug: str,
    translation: str = Query("kjv", description="Translation for verse text"),
    limit: int = Query(50, ge=1, le=500, description="Max verses to return"),
) -> dict:
    """Get a topic with its verse texts."""
    conn = get_db()
    try:
        # Get topic info
        topic_row = conn.execute(
            "SELECT topic_id, name, slug, verse_count FROM topics WHERE slug = ?",
            [slug],
        ).fetchone()

        if not topic_row:
            raise HTTPException(status_code=404, detail=f"Topic '{slug}' not found")

        topic = {
            "topic_id": topic_row[0],
            "name": topic_row[1],
            "slug": topic_row[2],
            "verse_count": topic_row[3],
        }

        # Get verse texts by joining topic_verses → verses
        df = conn.execute(
            """
            SELECT
                tv.verse_id,
                v.book_name,
                v.chapter,
                v.verse,
                v.text,
                v.reference,
                v.book_id
            FROM topic_verses tv
            LEFT JOIN verses v
              ON v.verse_id = tv.verse_id
              AND v.translation_id = ?
            WHERE tv.topic_id = ?
            ORDER BY tv.sort_order
            LIMIT ?
            """,
            [translation, topic["topic_id"], limit],
        ).fetchdf()

        verses = df.to_dict(orient="records")

        return {
            **topic,
            "translation": translation,
            "verses": verses,
        }
    finally:
        conn.close()


@router.get("/topics/for-verse/{verse_id}")
def topics_for_verse(verse_id: str) -> dict:
    """Find which topics reference a specific verse."""
    conn = get_db()
    try:
        df = conn.execute(
            """
            SELECT t.topic_id, t.name, t.slug, t.verse_count
            FROM topic_verses tv
            JOIN topics t ON t.topic_id = tv.topic_id
            WHERE tv.verse_id = ?
            ORDER BY t.verse_count DESC
            """,
            [verse_id],
        ).fetchdf()

        return {
            "verse_id": verse_id,
            "topics": df.to_dict(orient="records"),
        }
    finally:
        conn.close()
