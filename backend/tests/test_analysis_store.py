

def test_analysis_store_saves_and_returns_analysis():
    from services.analysis_store import AnalysisStore

    clock = [1_000.0]

    store = AnalysisStore(
        ttl_seconds=60,
        now=lambda: clock[0],
        id_factory=lambda: "analysis-test-123",
    )

    analysis = {
        "title": "Test Video",
        "formats": [
            {
                "format_id": "18",
                "extension": "mp4",
            }
        ],
    }

    analysis_id = store.save(analysis)

    assert analysis_id == "analysis-test-123"
    assert store.get(analysis_id) == analysis


def test_analysis_store_expires_old_analysis():
    from services.analysis_store import AnalysisStore

    clock = [1_000.0]

    store = AnalysisStore(
        ttl_seconds=60,
        now=lambda: clock[0],
        id_factory=lambda: "analysis-test-123",
    )

    analysis_id = store.save(
        {
            "title": "Test Video",
            "formats": [],
        }
    )

    clock[0] = 1_061.0

    assert store.get(analysis_id) is None
