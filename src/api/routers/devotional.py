"""
🙏 Devotional Router
Serves thematic devotional plans with daily readings and reflections.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query

from src.api.dependencies import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

# Load static devotional plans once at import time
_PLANS_PATH = Path(__file__).resolve().parents[3] / "data" / "static" / "devotional_plans.json"
_PLANS: list[dict] = []
if _PLANS_PATH.exists():
    _PLANS = json.loads(_PLANS_PATH.read_text(encoding="utf-8"))


def _parse_range(range_str: str) -> tuple[str, int, int, int, int] | None:
    """Parse 'PSA.23.1-PSA.23.6' → (book_id, ch_start, vs_start, ch_end, vs_end)."""
    parts = range_str.split("-")
    if len(parts) != 2:
        return None
    try:
        s = parts[0].split(".")
        e = parts[1].split(".")
        if len(s) != 3 or len(e) != 3:
            return None
        return (s[0], int(s[1]), int(s[2]), int(e[1]), int(e[2]))
    except (ValueError, IndexError):
        return None


@router.get("/devotional/plans")
def list_plans() -> dict:
    """List all available devotional plans."""
    return {
        "count": len(_PLANS),
        "plans": [
            {
                "id": p["id"],
                "title": p["title"],
                "description": p["description"],
                "days": p["days"],
            }
            for p in _PLANS
        ],
    }


@router.get("/devotional/plans/{plan_id}")
def get_plan(plan_id: str) -> dict:
    """Get a devotional plan with all daily readings (no verse text)."""
    plan = next((p for p in _PLANS if p["id"] == plan_id), None)
    if not plan:
        raise HTTPException(status_code=404, detail=f"Plan '{plan_id}' not found")
    return plan


@router.get("/devotional/plans/{plan_id}/day/{day}")
def get_day_reading(
    plan_id: str,
    day: int,
    translation: str = Query("kjv", description="Translation ID"),
) -> dict:
    """Get a specific day's reading with full verse texts."""
    plan = next((p for p in _PLANS if p["id"] == plan_id), None)
    if not plan:
        raise HTTPException(status_code=404, detail=f"Plan '{plan_id}' not found")

    reading = next((r for r in plan["readings"] if r["day"] == day), None)
    if not reading:
        raise HTTPException(
            status_code=404,
            detail=f"Day {day} not found in plan '{plan_id}'",
        )

    # Fetch verse texts
    parsed = _parse_range(reading["passage"])
    verses: list[dict] = []
    if parsed:
        book_id, ch_start, vs_start, ch_end, vs_end = parsed
        conn = get_db()
        try:
            df = conn.execute(
                """
                SELECT verse_id, book_name, chapter, verse, text, reference
                FROM verses
                WHERE book_id = ?
                  AND translation_id = ?
                  AND (
                    (chapter = ? AND verse >= ?)
                    OR (chapter > ? AND chapter < ?)
                    OR (chapter = ? AND verse <= ?)
                  )
                ORDER BY chapter, verse
                """,
                [
                    book_id,
                    translation,
                    ch_start,
                    vs_start,
                    ch_start,
                    ch_end,
                    ch_end,
                    vs_end,
                ],
            ).fetchdf()
            verses = df.to_dict(orient="records")
        finally:
            conn.close()

    return {
        "plan_id": plan_id,
        "plan_title": plan["title"],
        "translation": translation,
        **reading,
        "verses": verses,
    }
