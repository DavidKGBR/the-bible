"""
🧪 Tests — Cross-References (Sprint 2)
"""

import pandas as pd
import pytest

from src.config import LoadConfig
from src.extract.crossref_extractor import (
    CrossRefExtractor,
    numeric_to_verse_id,
    parse_crossref_line,
)
from src.load.duckdb_loader import DuckDBLoader
from src.models.schemas import CrossReference, RawCrossReference
from src.transform.crossref_mapper import (
    classify_reference_type,
    crossrefs_to_dataframe,
    transform_crossrefs,
)

# ─── Numeric → Verse ID Conversion ───────────────────────────────────────────


class TestNumericToVerseId:
    def test_genesis_1_1(self):
        result = numeric_to_verse_id(1001001)
        assert result == ("GEN", 1, 1)

    def test_john_3_16(self):
        result = numeric_to_verse_id(43003016)
        assert result == ("JHN", 3, 16)

    def test_revelation_22_21(self):
        result = numeric_to_verse_id(66022021)
        assert result == ("REV", 22, 21)

    def test_psalms_23_1(self):
        result = numeric_to_verse_id(19023001)
        assert result == ("PSA", 23, 1)

    def test_invalid_book_zero(self):
        assert numeric_to_verse_id(1001) is None  # book 0

    def test_invalid_book_67(self):
        assert numeric_to_verse_id(67001001) is None

    def test_invalid_chapter_zero(self):
        assert numeric_to_verse_id(1000001) is None

    def test_invalid_verse_zero(self):
        assert numeric_to_verse_id(1001000) is None

    def test_all_66_books_map(self):
        """Every canonical book position (1-66) should have a mapping."""
        for pos in range(1, 67):
            result = numeric_to_verse_id(pos * 1_000_000 + 1001)
            assert result is not None, f"Position {pos} has no mapping"
            assert len(result[0]) >= 2  # book_id is at least 2 chars


# ─── TSV Line Parsing ────────────────────────────────────────────────────────


class TestParseCrossrefLine:
    def test_valid_line(self):
        ref = parse_crossref_line("01001001\t5\t43003016")
        assert ref is not None
        assert ref.source_verse_id == "GEN.1.1"
        assert ref.target_verse_id == "JHN.3.16"
        assert ref.votes == 5

    def test_two_column_line(self):
        ref = parse_crossref_line("01001001\t43003016")
        assert ref is not None
        assert ref.votes == 1  # default

    def test_header_line_skipped(self):
        ref = parse_crossref_line("From Verse\tVotes\tTo Verse")
        assert ref is None

    def test_comment_line_skipped(self):
        ref = parse_crossref_line("# This is a comment")
        assert ref is None

    def test_empty_line_skipped(self):
        ref = parse_crossref_line("")
        assert ref is None

    def test_invalid_verse_returns_none(self):
        ref = parse_crossref_line("99999999\t1\t01001001")
        assert ref is None


# ─── Extractor Tests ─────────────────────────────────────────────────────────


class TestCrossRefExtractor:
    def test_parse_tsv_content(self):
        content = (
            "From Verse\tVotes\tTo Verse\n"
            "01001001\t5\t43003016\n"
            "01001002\t3\t19023001\n"
            "# comment\n"
            "99999999\t1\t01001001\n"  # invalid
        )
        extractor = CrossRefExtractor()
        refs = extractor._parse_tsv(content)
        assert len(refs) == 2
        assert refs[0].source_verse_id == "GEN.1.1"
        assert refs[1].source_verse_id == "GEN.1.2"

    def test_parse_deduplicates(self):
        content = (
            "01001001\t5\t43003016\n"
            "01001001\t3\t43003016\n"  # duplicate
        )
        extractor = CrossRefExtractor()
        refs = extractor._parse_tsv(content)
        assert len(refs) == 1

    def test_cache_round_trip(self, tmp_path):
        extractor = CrossRefExtractor(cache_dir=tmp_path)
        refs = [
            RawCrossReference(source_verse_id="GEN.1.1", target_verse_id="JHN.3.16", votes=5),
        ]
        extractor._save_to_cache(refs)
        loaded = extractor._load_from_cache()
        assert loaded is not None
        assert len(loaded) == 1
        assert loaded[0].source_verse_id == "GEN.1.1"


# ─── Mapper / Transform Tests ────────────────────────────────────────────────


class TestClassifyReferenceType:
    def test_direct_nearby(self):
        assert classify_reference_type(1, 2, 1) == "direct"

    def test_direct_same_book(self):
        assert classify_reference_type(1, 1, 0) == "direct"

    def test_thematic_medium_distance(self):
        assert classify_reference_type(1, 20, 19) == "thematic"

    def test_prophetic_large_distance(self):
        assert classify_reference_type(1, 66, 65) == "prophetic"


class TestTransformCrossrefs:
    @pytest.fixture
    def sample_raw_refs(self):
        return [
            RawCrossReference(source_verse_id="GEN.1.1", target_verse_id="JHN.1.1", votes=5),
            RawCrossReference(source_verse_id="PSA.23.1", target_verse_id="JHN.10.11", votes=3),
            RawCrossReference(source_verse_id="ISA.53.5", target_verse_id="1PE.2.24", votes=4),
        ]

    def test_transforms_all_valid(self, sample_raw_refs):
        refs, stats = transform_crossrefs(sample_raw_refs)
        assert len(refs) == 3
        assert stats.total_refs == 3

    def test_enriches_with_positions(self, sample_raw_refs):
        refs, _ = transform_crossrefs(sample_raw_refs)
        gen_ref = refs[0]
        assert gen_ref.source_book_id == "GEN"
        assert gen_ref.target_book_id == "JHN"
        assert gen_ref.source_book_position == 1
        assert gen_ref.target_book_position == 43
        assert gen_ref.arc_distance == 42

    def test_classifies_types(self, sample_raw_refs):
        refs, _ = transform_crossrefs(sample_raw_refs)
        # GEN→JHN distance=42 → prophetic
        assert refs[0].reference_type == "prophetic"

    def test_skips_self_references(self):
        raw = [
            RawCrossReference(source_verse_id="GEN.1.1", target_verse_id="GEN.1.1", votes=1),
        ]
        refs, stats = transform_crossrefs(raw)
        assert len(refs) == 0
        assert stats.total_refs == 0

    def test_skips_invalid_book_ids(self):
        raw = [
            RawCrossReference(source_verse_id="XXX.1.1", target_verse_id="GEN.1.1", votes=1),
        ]
        refs, _ = transform_crossrefs(raw)
        assert len(refs) == 0

    def test_stats_computation(self, sample_raw_refs):
        _, stats = transform_crossrefs(sample_raw_refs)
        assert stats.total_refs == 3
        assert stats.unique_book_pairs == 3
        assert stats.avg_arc_distance > 0
        assert stats.max_arc_distance > 0

    def test_testament_crossing_stats(self, sample_raw_refs):
        _, stats = transform_crossrefs(sample_raw_refs)
        # All 3 are OT→NT
        assert stats.refs_old_to_new == 3
        assert stats.refs_within_old == 0
        assert stats.refs_within_new == 0


class TestCrossrefsToDataframe:
    def test_converts_to_dataframe(self):
        refs = [
            CrossReference(
                source_verse_id="GEN.1.1",
                target_verse_id="JHN.1.1",
                source_book_id="GEN",
                target_book_id="JHN",
                source_book_position=1,
                target_book_position=43,
                votes=5,
                reference_type="prophetic",
            ),
        ]
        df = crossrefs_to_dataframe(refs)
        assert len(df) == 1
        assert "arc_distance" in df.columns
        assert df.iloc[0]["arc_distance"] == 42

    def test_empty_returns_empty_df(self):
        df = crossrefs_to_dataframe([])
        assert df.empty


# ─── DuckDB Integration Tests ────────────────────────────────────────────────


class TestDuckDBCrossRefs:
    @pytest.fixture
    def tmp_db(self, tmp_path) -> DuckDBLoader:
        config = LoadConfig(duckdb_path=str(tmp_path / "test.duckdb"))
        loader = DuckDBLoader(config)
        loader.create_schema()
        yield loader
        loader.close()

    @pytest.fixture
    def sample_crossref_df(self):
        return pd.DataFrame(
            [
                {
                    "source_verse_id": "GEN.1.1",
                    "target_verse_id": "JHN.1.1",
                    "source_book_id": "GEN",
                    "target_book_id": "JHN",
                    "source_book_position": 1,
                    "target_book_position": 43,
                    "votes": 5,
                    "reference_type": "prophetic",
                    "arc_distance": 42,
                },
                {
                    "source_verse_id": "PSA.23.1",
                    "target_verse_id": "JHN.10.11",
                    "source_book_id": "PSA",
                    "target_book_id": "JHN",
                    "source_book_position": 19,
                    "target_book_position": 43,
                    "votes": 3,
                    "reference_type": "prophetic",
                    "arc_distance": 24,
                },
            ]
        )

    def test_cross_references_table_exists(self, tmp_db):
        tables = tmp_db.query("SHOW TABLES")
        assert "cross_references" in tables["name"].tolist()

    def test_load_cross_references(self, tmp_db, sample_crossref_df):
        count = tmp_db.load_cross_references(sample_crossref_df)
        assert count == 2

    def test_load_is_idempotent(self, tmp_db, sample_crossref_df):
        tmp_db.load_cross_references(sample_crossref_df)
        count = tmp_db.load_cross_references(sample_crossref_df)
        assert count == 2

    def test_crossref_arcs_view(self, tmp_db, sample_crossref_df):
        tmp_db.load_cross_references(sample_crossref_df)
        result = tmp_db.query("SELECT * FROM v_crossref_arcs")
        assert len(result) == 2  # 2 unique book pairs
        assert "connection_count" in result.columns

    def test_most_connected_books_view(self, tmp_db, sample_crossref_df):
        tmp_db.load_cross_references(sample_crossref_df)
        result = tmp_db.query("SELECT * FROM v_most_connected_books")
        assert len(result) > 0
        assert "total_connections" in result.columns

    def test_summary_includes_crossrefs(self, tmp_db, sample_crossref_df):
        tmp_db.load_cross_references(sample_crossref_df)
        summary = tmp_db.get_summary()
        assert summary["total_crossrefs"] == 2

    def test_load_empty_df(self, tmp_db):
        count = tmp_db.load_cross_references(pd.DataFrame())
        assert count == 0
