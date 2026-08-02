import pytest


def pytest_addoption(parser):
    parser.addoption(
        "--run-live",
        action="store_true",
        default=False,
        help="run tests that contact real external platforms",
    )
    parser.addoption(
        "--run-download",
        action="store_true",
        default=False,
        help="run tests for the unfinished download feature",
    )


def pytest_collection_modifyitems(config, items):
    if not config.getoption("--run-live"):
        skip_live = pytest.mark.skip(
            reason="use --run-live to run external platform tests"
        )

        for item in items:
            if "live" in item.keywords:
                item.add_marker(skip_live)

    if not config.getoption("--run-download"):
        skip_download = pytest.mark.skip(
            reason="use --run-download to activate download feature tests"
        )

        for item in items:
            if "download" in item.keywords:
                item.add_marker(skip_download)
