import pytest


@pytest.fixture(autouse=True)
def reset_application_rate_limits():
    try:
        import app as app_module
    except ImportError:
        yield
        return

    app_module.api_rate_limiter.reset()
    app_module.expensive_rate_limiter.reset()
    yield


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
