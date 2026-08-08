import pytest

from services.hosting_limits import (
    SlidingWindowRateLimiter,
    load_hosting_limits,
)


def test_hosting_limits_use_safe_defaults(monkeypatch):
    variable_names = (
        "FLOWSNAP_DELIVERY_ENABLED",
        "FLOWSNAP_MAX_FILE_SIZE_MB",
        "FLOWSNAP_MAX_CONCURRENT_DOWNLOADS",
        "FLOWSNAP_API_RATE_LIMIT",
        "FLOWSNAP_EXPENSIVE_RATE_LIMIT",
        "FLOWSNAP_RATE_WINDOW_SECONDS",
    )
    for name in variable_names:
        monkeypatch.delenv(name, raising=False)

    limits = load_hosting_limits()

    assert limits.delivery_enabled is True
    assert limits.max_file_size_bytes == 100 * 1024 * 1024
    assert limits.max_concurrent_downloads == 1
    assert limits.api_requests_per_window == 60
    assert limits.expensive_requests_per_window == 12
    assert limits.rate_window_seconds == 60


def test_hosting_limits_accept_environment_overrides(monkeypatch):
    monkeypatch.setenv("FLOWSNAP_DELIVERY_ENABLED", "false")
    monkeypatch.setenv("FLOWSNAP_MAX_FILE_SIZE_MB", "25")
    monkeypatch.setenv("FLOWSNAP_MAX_CONCURRENT_DOWNLOADS", "2")
    monkeypatch.setenv("FLOWSNAP_API_RATE_LIMIT", "20")
    monkeypatch.setenv("FLOWSNAP_EXPENSIVE_RATE_LIMIT", "5")
    monkeypatch.setenv("FLOWSNAP_RATE_WINDOW_SECONDS", "30")

    limits = load_hosting_limits()

    assert limits.delivery_enabled is False
    assert limits.max_file_size_bytes == 25 * 1024 * 1024
    assert limits.max_concurrent_downloads == 2
    assert limits.api_requests_per_window == 20
    assert limits.expensive_requests_per_window == 5
    assert limits.rate_window_seconds == 30


def test_hosting_limits_reject_non_positive_values(monkeypatch):
    monkeypatch.setenv("FLOWSNAP_API_RATE_LIMIT", "0")

    with pytest.raises(ValueError, match="positive integer"):
        load_hosting_limits()


def test_hosting_limits_reject_invalid_boolean(monkeypatch):
    monkeypatch.setenv("FLOWSNAP_DELIVERY_ENABLED", "sometimes")

    with pytest.raises(ValueError, match="must be true or false"):
        load_hosting_limits()


def test_rate_limiter_reopens_after_window():
    limiter = SlidingWindowRateLimiter(limit=2, window_seconds=60)

    assert limiter.allow("client", now=100)
    assert limiter.allow("client", now=101)
    assert not limiter.allow("client", now=102)
    assert limiter.allow("client", now=161)
