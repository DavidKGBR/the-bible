"""
🔗 Extract — Cross-References
Downloads and parses Bible cross-references from OpenBible.info.
"""

from __future__ import annotations

import io
import json
import logging
import zipfile
from pathlib import Path

import httpx

from src.models.schemas import BOOK_CATALOG, RawCrossReference

logger = logging.getLogger(__name__)

CROSSREF_URL = "https://a.openbible.info/data/cross-references.zip"
CROSSREF_FILENAME = "cross_references.txt"

# Build position (1-66) → book_id mapping from BOOK_CATALOG
_POSITION_TO_BOOK_ID: dict[int, str] = {b["pos"]: b["id"] for b in BOOK_CATALOG}


def numeric_to_verse_id(numeric: int) -> tuple[str, int, int] | None:
    """Convert OpenBible numeric format (BBCCCVVV) to (book_id, chapter, verse).

    Args:
        numeric: 8-digit number, e.g. 1001001 = Genesis 1:1, 43003016 = John 3:16

    Returns:
        Tuple of (book_id, chapter, verse) or None if invalid.
    """
    book_num = numeric // 1_000_000
    chapter = (numeric % 1_000_000) // 1_000
    verse = numeric % 1_000

    if book_num < 1 or book_num > 66 or chapter < 1 or verse < 1:
        return None

    book_id = _POSITION_TO_BOOK_ID.get(book_num)
    if not book_id:
        return None

    return book_id, chapter, verse


def parse_crossref_line(line: str) -> RawCrossReference | None:
    """Parse a single line from the OpenBible cross-references TSV.

    Format: "from_verse\\tvotes\\tto_verse"
    Example: "01001001\\t5\\t43003016"
    """
    line = line.strip()
    if not line or line.startswith("#"):
        return None

    parts = line.split("\t")
    if len(parts) < 2:
        return None

    try:
        from_str = parts[0].strip()
        to_str = parts[-1].strip()

        # Handle "From Verse\tVotes\tTo Verse" header
        if not from_str.isdigit():
            return None

        from_numeric = int(from_str)
        to_numeric = int(to_str)

        # Votes is middle column (default 1 if missing/invalid)
        votes = 1
        if len(parts) >= 3:
            try:
                votes = int(parts[1].strip())
            except ValueError:
                votes = 1

        source = numeric_to_verse_id(from_numeric)
        target = numeric_to_verse_id(to_numeric)

        if not source or not target:
            return None

        source_id = f"{source[0]}.{source[1]}.{source[2]}"
        target_id = f"{target[0]}.{target[1]}.{target[2]}"

        return RawCrossReference(
            source_verse_id=source_id,
            target_verse_id=target_id,
            votes=votes,
        )

    except (ValueError, IndexError) as e:
        logger.debug(f"Skipping malformed line: {line!r} ({e})")
        return None


class CrossRefExtractor:
    """Extracts cross-references from OpenBible.info."""

    def __init__(self, cache_dir: Path | None = None) -> None:
        self.cache_dir = cache_dir

    def fetch_all(self) -> list[RawCrossReference]:
        """Download and parse all cross-references.

        Tries cache first, then downloads from OpenBible.info.
        """
        # Try cache
        if self.cache_dir:
            cached = self._load_from_cache()
            if cached:
                return cached

        # Download
        logger.info("🌐 Downloading cross-references from OpenBible.info...")
        tsv_content = self._download()
        if not tsv_content:
            logger.error("Failed to download cross-references")
            return []

        # Parse
        refs = self._parse_tsv(tsv_content)

        # Cache raw data
        if self.cache_dir and refs:
            self._save_to_cache(refs)

        return refs

    def _download(self) -> str | None:
        """Download the cross-references ZIP and extract TSV content."""
        try:
            response = httpx.get(CROSSREF_URL, timeout=60, follow_redirects=True)
            response.raise_for_status()

            with zipfile.ZipFile(io.BytesIO(response.content)) as zf:
                names = zf.namelist()
                # Find the TSV file in the ZIP
                tsv_name = None
                for name in names:
                    if name.endswith(".txt") or name.endswith(".tsv"):
                        tsv_name = name
                        break

                if not tsv_name:
                    logger.error(f"No TSV/TXT file in ZIP. Contents: {names}")
                    return None

                return zf.read(tsv_name).decode("utf-8")

        except httpx.HTTPError as e:
            logger.error(f"HTTP error downloading cross-references: {e}")
            return None
        except zipfile.BadZipFile:
            logger.error("Downloaded file is not a valid ZIP")
            return None

    def _parse_tsv(self, content: str) -> list[RawCrossReference]:
        """Parse TSV content into RawCrossReference objects."""
        refs: list[RawCrossReference] = []
        skipped = 0

        for line in content.splitlines():
            ref = parse_crossref_line(line)
            if ref:
                refs.append(ref)
            elif line.strip() and not line.startswith("#"):
                skipped += 1

        if skipped > 0:
            logger.warning(f"⚠️  Skipped {skipped} malformed lines")

        # Deduplicate
        seen: set[tuple[str, str]] = set()
        unique: list[RawCrossReference] = []
        for ref in refs:
            key = (ref.source_verse_id, ref.target_verse_id)
            if key not in seen:
                seen.add(key)
                unique.append(ref)

        dupes = len(refs) - len(unique)
        if dupes > 0:
            logger.info(f"🗑️  Removed {dupes} duplicate cross-references")

        logger.info(f"✅ Parsed {len(unique)} cross-references")
        return unique

    def _load_from_cache(self) -> list[RawCrossReference] | None:
        """Load cross-references from cached JSON."""
        if not self.cache_dir:
            return None

        cache_file = self.cache_dir / "crossrefs.json"
        if not cache_file.exists():
            return None

        try:
            data = json.loads(cache_file.read_text())
            refs = [RawCrossReference(**item) for item in data]
            logger.info(f"📂 Loaded {len(refs)} cross-references from cache")
            return refs
        except Exception as e:
            logger.warning(f"Error loading cache: {e}")
            return None

    def _save_to_cache(self, refs: list[RawCrossReference]) -> None:
        """Save cross-references to cache as JSON."""
        if not self.cache_dir:
            return

        self.cache_dir.mkdir(parents=True, exist_ok=True)
        cache_file = self.cache_dir / "crossrefs.json"
        cache_file.write_text(
            json.dumps(
                [r.model_dump() for r in refs],
                ensure_ascii=False,
            )
        )
        logger.info(f"💾 Cached {len(refs)} cross-references to {cache_file}")
